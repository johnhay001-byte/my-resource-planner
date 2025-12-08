// Force Update: v4 - Save Client NAME instead of ID
import React, { useState, useEffect } from 'react';
import { writeBatch, doc, collection, addDoc, getDocs } from 'firebase/firestore'; 
import { SpinnerIcon } from './Icons';
import { db } from '../firebase'; 

const appId = window.__app_id || 'default-app-id';

const UploadIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const UserGroupIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const AdminDataUpload = ({ isOpen, onClose, clients = [] }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState('');
    const [mode, setMode] = useState('rates'); 
    
    const [selectedClientId, setSelectedClientId] = useState('');

    useEffect(() => {
        if (clients.length > 0 && !selectedClientId) {
            setSelectedClientId(clients[0].id);
        }
    }, [clients, selectedClientId]);

    if (!isOpen) return null;

    const parseCSV = (text) => {
        const lines = text.split('\n');
        let headerIndex = 0;
        let headers = [];
        
        for(let i=0; i<lines.length; i++) {
            if(lines[i].includes('Role') && lines[i].includes('Region')) {
                headerIndex = i;
                headers = lines[i].trim().split(',').map(h => h.trim());
                break;
            }
        }
        
        if (headers.length === 0) return []; 

        const data = [];
        for (let i = headerIndex + 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const currentLine = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            const simpleSplit = lines[i].split(',');
            const values = currentLine.length === headers.length ? currentLine : simpleSplit;

            if (values.length >= headers.length) {
                const row = {};
                for (let j = 0; j < headers.length; j++) {
                    let val = values[j] ? values[j].trim() : '';
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1);
                    }
                    row[headers[j]] = val;
                }
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
        setError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const data = parseCSV(text);
                
                if (data.length === 0) throw new Error("No valid rows found. Ensure CSV has 'Role' and 'Region' columns.");

                if (mode === 'rates') {
                    await uploadRates(data);
                } else {
                    if (!selectedClientId) throw new Error("Please select a Client first.");
                    await generateTestTeam(data);
                }

            } catch (err) {
                console.error(err);
                setError('Operation failed: ' + err.message);
                setUploading(false);
            }
        };
        reader.readAsText(file);
    };

    // --- MODE 1: Upload Rates ---
    const uploadRates = async (data) => {
        setProgress(`Parsed ${data.length} rows. Starting Rate Upload...`);
        const BATCH_SIZE = 450; 
        const chunks = [];
        for (let i = 0; i < data.length; i += BATCH_SIZE) {
            chunks.push(data.slice(i, i + BATCH_SIZE));
        }

        const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'cost_rates');
        let totalUploaded = 0;

        for (let i = 0; i < chunks.length; i++) {
            const batch = writeBatch(db);
            const chunk = chunks[i];

            chunk.forEach((row) => {
                const safeRole = row['Role'].replace(/[^a-zA-Z0-9]/g, '_');
                const safeRegion = row['Region'].replace(/[^a-zA-Z0-9]/g, '_');
                const docId = `${safeRole}_${safeRegion}`;
                const docRef = doc(collectionRef, docId);
                
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
        finish("Rates Uploaded Successfully!");
    };

    // --- MODE 2: Generate Test Team ---
    const generateTestTeam = async (data) => {
        setProgress("Selecting random roles to build a team...");
        
        // 1. Shuffle data and pick 20 random rows
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 20);

        const firstNames = ["James", "Sarah", "Michael", "Emma", "David", "Lisa", "Robert", "Jessica", "William", "Jennifer", "John", "Emily", "Richard", "Ashley", "Joseph", "Amanda", "Thomas", "Melissa", "Charles", "Nicole"];
        
        const peopleRef = collection(db, 'artifacts', appId, 'public', 'data', 'people');
        
        // Find the selected client OBJECT to get its Name
        const clientObj = clients.find(c => c.id === selectedClientId);
        const clientName = clientObj ? clientObj.name : "Internal"; // Fallback

        let count = 0;
        for (let i = 0; i < selected.length; i++) {
            const row = selected[i];
            const firstName = firstNames[i % firstNames.length];
            
            const newPerson = {
                name: `${firstName} (${row.Region})`,
                role: row.Role,     
                region: row.Region, 
                // ▼▼▼ KEY FIX: Saving the Name, not just the ID. Some simple filters use Name.
                client: clientName, 
                clientId: selectedClientId, // Saving ID too just in case
                skills: [row['Category | Function'] || 'General'],
                allocation: 0,
                avatar: `https://ui-avatars.com/api/?name=${firstName}&background=random`
            };

            await addDoc(peopleRef, newPerson);
            count++;
            setProgress(`Created ${count} of 20 test people...`);
        }
        finish("Test Team Generated!");
    };

    const finish = (msg) => {
        setProgress(msg);
        setTimeout(() => {
            setUploading(false);
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Admin Data Tools</h2>
                
                <div className="flex space-x-4 mb-6 border-b pb-2">
                    <button 
                        onClick={() => setMode('rates')}
                        className={`text-sm font-semibold pb-2 ${mode === 'rates' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                    >
                        1. Update Rates
                    </button>
                    <button 
                        onClick={() => setMode('team')}
                        className={`text-sm font-semibold pb-2 ${mode === 'team' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                    >
                        2. Generate Test Team
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                    {mode === 'rates' 
                        ? "Upload 'GLOBAL_COST_RATES_ENRICHED_FINAL.csv' to update the master database." 
                        : "Select a Client, then upload the CSV to generate 20 random people assigned to them."}
                </p>

                {mode === 'team' && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Client:</label>
                        {clients.length > 0 ? (
                            <select 
                                value={selectedClientId} 
                                onChange={(e) => setSelectedClientId(e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                            >
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                                No clients found! Please add a Client in the Team view first.
                            </div>
                        )}
                    </div>
                )}

                {!uploading ? (
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer relative">
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-1 text-center">
                            {mode === 'rates' ? (
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            ) : (
                                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                            )}
                            <div className="flex text-sm text-gray-600">
                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                                    {mode === 'rates' ? 'Upload Rates CSV' : 'Generate from CSV'}
                                </span>
                            </div>
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
                    <button onClick={onClose} disabled={uploading} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Close</button>
                </div>
            </div>
        </div>
    );
};