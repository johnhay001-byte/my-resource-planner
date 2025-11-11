import React, { useState } from 'react';
import { SpinnerIcon, SparklesIcon } from './Icons';

export const AddItemModal = ({ isOpen, onClose, onSave, clients, programs, isSaving }) => {
    const [itemType, setItemType] = useState('Project Request');
    
    // Form state
    const [name, setName] = useState('');
    const [brief, setBrief] = useState('');
    const [parentId, setParentId] = useState('');
    
    // AI State
    const [aiInsights, setAiInsights] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);

    if (!isOpen) return null;

    const resetForm = () => {
        setName('');
        setBrief('');
        setParentId('');
        setAiInsights('');
        setIsEnriching(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };
    
    const handleSave = () => {
        let actionType = '';
        let item = {};
        
        switch(itemType) {
            case 'Client':
                actionType = 'ADD_CLIENT';
                item = { name };
                break;
            case 'Program':
                actionType = 'ADD_PROGRAM';
                item = { name, clientId: parentId };
                break;
            case 'Project Request':
                actionType = 'ADD_PROJECT';
                item = { name, programId: parentId, brief };
                break;
            case 'Task':
                actionType = 'ADD_TASK_FROM_GLOBAL';
                item = { 
                    name, 
                    projectId: parentId, 
                    brief,
                    status: 'To Do',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    assigneeId: null,
                };
                break;
            default:
                return;
        }
        
        onSave({ type: actionType, item });
        // Don't reset form here, App.jsx will close the modal on success
    };

    const handleItemTypeChange = (e) => {
        setItemType(e.target.value);
        resetForm();
    };

    // --- AI Enrichment Function ---
    const handleEnrichBrief = async () => {
        if (!brief) {
            setAiInsights('<p class="text-red-600">Please write a brief first.</p>');
            return;
        }
        setIsEnriching(true);
        setAiInsights('');

        const systemPrompt = "You are a senior creative agency producer. Analyze the following project brief and provide 3 key risks, 3 creative opportunities, and a list of recommended team roles (e.g., Creative Director, Sr. Copywriter, Project Manager). Format your response in clean HTML with <h3> tags for headers and <ul>/<li> for lists.";
        const userQuery = `Project Brief: """${brief}"""`;
        const apiKey = ""; // Leave empty
        const apiUrl = `https://generativelangugae.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userQuery }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
                setAiInsights(text);
            } else {
                setAiInsights('<p class="text-red-600">Could not generate insights. No text returned.</p>');
            }
        } catch (error) {
            console.error("AI Enrichment Error:", error);
            setAiInsights(`<p class="text-red-600">Failed to fetch AI insights: ${error.message}</p>`);
        } finally {
            setIsEnriching(false);
        }
    };

    // --- Dynamic Fields ---
    const renderDynamicFields = () => {
        switch(itemType) {
            case 'Client':
                return (
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Client Name" className="w-full p-2 border rounded-md" />
                );
            case 'Program':
                return (
                    <>
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="">Select Parent Client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Program Name" className="w-full p-2 border rounded-md" />
                    </>
                );
            case 'Project Request':
                return (
                    <>
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="">Select Parent Program...</option>
                            {programs.map(p => {
                                const clientName = clients.find(c => c.id === p.clientId)?.name || 'Unknown';
                                return <option key={p.id} value={p.id}>{clientName} / {p.name}</option>
                            })}
                        </select>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Request Name" className="w-full p-2 border rounded-md" />
                        <div className="relative">
                            <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Project Brief..." className="w-full p-2 border rounded-md" rows="5"></textarea>
                            <button 
                                onClick={handleEnrichBrief}
                                disabled={isEnriching}
                                className="absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                                {isEnriching ? (
                                    <SpinnerIcon className="h-4 w-4" />
                                ) : (
                                    <SparklesIcon className="h-4 w-4 mr-1" />
                                )}
                                {isEnriching ? '' : 'Enrich'}
                            </button>
                        </div>
                         {/* AI Insights Section */}
                        {aiInsights && (
                            <div 
                                className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg max-h-40 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: aiInsights }} 
                            />
                        )}
                        {isEnriching && !aiInsights && (
                            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                                <p className="text-purple-700 text-sm">Generating AI insights...</p>
                            </div>
                        )}
                    </>
                );
            case 'Task':
                 return (
                    <>
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="">Select Parent Project...</option>
                            {programs.map(p => {
                                const clientName = clients.find(c => c.id === p.clientId)?.name || 'Unknown';
                                return <option key={p.id} value={p.id}>{clientName} / {p.name}</option>
                            })}
                        </select>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Task Name" className="w-full p-2 border rounded-md" />
                        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Task Brief/Notes..." className="w-full p-2 border rounded-md" rows="3"></textarea>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast">
                <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
                <div className="space-y-4">
                    <select value={itemType} onChange={handleItemTypeChange} className="w-full p-2 border rounded-md bg-gray-50">
                        <option>Project Request</option>
                        <option>Task</option>
                        <option>Program</option>
                        <option>Client</option>
                    </select>
                    
                    {renderDynamicFields()}
                    
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={handleClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSaving ? <SpinnerIcon className="h-5 w-5 mr-2" /> : null}
                        {isSaving ? 'Saving...' : 'Add Item'}
                    </button>
                </div>
            </div>
        </div>
    );
};