import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { SpinnerIcon, UploadIcon } from './Icons';

// Initialize Firebase (using existing config from window)
const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = window.__app_id || 'default-app-id';

export const AdminDataUpload = ({ isOpen, onClose }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const parseCSV = (text) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            if (currentLine.length === headers.length) {
                const row = {};
                for (let j = 0; j < headers.length; j++) {
                    // Clean quotes if present
                    let val = currentLine[j].trim();
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1);
                    }
                    row[headers[j]] = val;
                }
                // Only add if it has a Role and Region
                if (row['Role'] && row['Region']) {
                    data.push(row);
                }
            }
        }
        return data;
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setProgress('Reading file...');
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const data = parseCSV(text);
                
                setProgress(`Parsed ${data.length} rows. Starting upload...`);

                // Batch write to Firestore (limit 500 per batch)
                const BATCH_SIZE = 450; 
                const chunks = [];
                for (let i = 0; i < data.length; i += BATCH_SIZE) {
                    chunks.push(data.slice(i, i + BATCH_SIZE));
                }

                // Use the Public Data path so everyone in the app can read rates
                // Path: /artifacts/{appId}/public/data/cost_rates/{role_region_key}
                const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'cost_rates');

                let totalUploaded = 0;

                for (let i = 0; i < chunks.length; i++) {
                    const batch = writeBatch(db);
                    const chunk = chunks[i];

                    chunk.forEach((row) => {
                        // Create a unique ID for the document: Role_Region
                        // Sanitize ID by replacing non-alphanumeric chars
                        const safeRole = row['Role'].replace(/[^a-zA-Z0-9]/g, '_');
                        const safeRegion = row['Region'].replace(/[^a-zA-Z0-9]/g, '_');
                        const docId = `${safeRole}_${safeRegion}`;

                        const docRef = doc(collectionRef, docId);
                        
                        // Convert numbers
                        const safeRow = {
                            ...row,
                            Rate_low: Number(row.Rate_low) || 0,
                            Rate_high: Number(row.Rate_high) || 0,
                            Estimated_Cost: Number(row.Estimated_Cost) || 0,
                            uploadedAt: new Date().toISOString()
                        };

                        batch.set(docRef, safeRow);
                    });

                    await batch.commit();
                    totalUploaded += chunk.length;
                    setProgress(`Uploaded ${totalUploaded} of ${data.length} rates...`);
                }

                setProgress('Upload Complete! You can close this window.');
                setTimeout(() => {
                    setUploading(false);
                    onClose();
                }, 2000);

            } catch (err) {
                console.error(err);
                setError('Upload failed: ' + err.message);
                setUploading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Upload Master Rate Card</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Select your <strong>GLOBAL_COST_RATES_ENRICHED_FINAL.csv</strong>. 
                    This will replace the rates in the database.
                </p>

                {!uploading ? (
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer relative">
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-1 text-center">
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                                    Upload a file
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">CSV up to 10MB</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <SpinnerIcon className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium">{progress}</p>
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={onClose} 
                        disabled={uploading}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};