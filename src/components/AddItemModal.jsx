import React, { useState, useEffect } from 'react';
import { SpinnerIcon, SparklesIcon } from './Icons';

export const AddItemModal = ({ isOpen, onClose, onSave, clients, programs, projects, isSaving }) => {
    const [itemType, setItemType] = useState('Project Request');
    
    // Form state for all types
    const [name, setName] = useState('');
    const [brief, setBrief] = useState('');
    const [projectBudget, setProjectBudget] = useState(''); // ▼▼▼ NEW STATE ▼▼▼
    const [parentClient, setParentClient] = useState('');
    const [parentProgram, setParentProgram] = useState('');
    const [parentProject, setParentProject] = useState('');
    
    // AI State
    const [aiInsights, setAiInsights] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);
    
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Reset form when modal opens
        if (isOpen) {
            setItemType('Project Request');
            setName('');
            setBrief('');
            setProjectBudget(''); // ▼▼▼ NEW ▼▼▼ (Reset new state)
            setParentClient('');
            setParentProgram('');
            setParentProject('');
            setErrorMessage('');
            setAiInsights('');
            setIsEnriching(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        setErrorMessage('');
        let action = {};
        
        switch (itemType) {
            case 'Client':
                if (!name) { setErrorMessage('Client Name is required.'); return; }
                action = { type: 'ADD_CLIENT', item: { name } };
                break;
            case 'Program':
                if (!name || !parentClient) { setErrorMessage('Client and Program Name are required.'); return; }
                action = { type: 'ADD_PROGRAM', item: { name, clientId: parentClient } };
                break;
            case 'Project Request':
                if (!name || !parentProgram) { setErrorMessage('Program and Project Name are required.'); return; }
                // ▼▼▼ NEW: Add projectBudget to the item object ▼▼▼
                action = { 
                    type: 'ADD_PROJECT', 
                    item: { 
                        name, 
                        programId: parentProgram, 
                        brief, 
                        aiInsights, 
                        projectBudget: Number(projectBudget) || 0 // Convert to number
                    } 
                };
                break;
            case 'Task':
                 if (!name || !parentProject) { setErrorMessage('Project and Task Name are required.'); return; }
                 action = {
                    type: 'ADD_TASK_FROM_GLOBAL', 
                    item: { 
                        name, 
                        projectId: parentProject,
                        status: 'To Do',
                        assigneeId: null,
                        assigneeGroupId: null,
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0],
                        comments: []
                    } 
                };
                break;
            default:
                setErrorMessage('Invalid item type selected.');
                return;
        }
        
        onSave(action);
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
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

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
                const errorBody = await response.json();
                console.error("API Error Response:", errorBody);
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
    
    // --- Dynamic Form Rendering ---
    const renderFormFields = () => {
        switch (itemType) {
            case 'Client':
                return (
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="New Client Name" className="w-full p-2 border rounded-md" />
                );
            case 'Program':
                return (
                    <>
                        <select value={parentClient} onChange={(e) => setParentClient(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="">Select Parent Client...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="New Program Name" className="w-full p-2 border rounded-md" />
                    </>
                );
            case 'Project Request':
                return (
                    <>
                        <select value={parentProgram} onChange={(e) => setParentProgram(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="">Select Parent Program...</option>
                            {programs.map(p => {
                                const clientName = clients.find(c => c.id === p.clientId)?.name || 'Unknown';
                                return <option key={p.id} value={p.id}>{clientName} / {p.name}</option>
                            })}
                        </select>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="New Project Request Name" className="w-full p-2 border rounded-md" />
                        
                        {/* ▼▼▼ NEW PROJECT BUDGET FIELD ▼▼▼ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Project Budget (Estimated Value)</label>
                            <input 
                                type="number" 
                                value={projectBudget} 
                                onChange={(e) => setProjectBudget(e.target.value)} 
                                placeholder="e.g. 50000" 
                                className="w-full p-2 border rounded-md" 
                            />
                        </div>
                        {/* ▲▲▲ END NEW FIELD ▲▲▲ */}

                        <textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Project Brief..." className="w-full p-2 border rounded-md" rows="4"></textarea>
                        <button 
                            type="button"
                            onClick={handleEnrichBrief}
                            disabled={isEnriching}
                            className="w-full px-3 py-2 text-sm font-semibold rounded-md flex items-center justify-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isEnriching ? (
                                <SpinnerIcon className="h-5 w-5" />
                            ) : (
                                <SparklesIcon className="h-5 w-5 mr-2" />
                            )}
                            {isEnriching ? 'Analyzing...' : 'Enrich Brief (AI)'}
                        </button>
                         {/* AI Insights Section */}
                        {aiInsights && (
                            <div 
                                className="mt-2 p-4 bg-purple-50 border border-purple-200 rounded-lg max-h-40 overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: aiInsights }} 
                            />
                        )}
                        {isEnriching && !aiInsights && (
                             <div className="mt-2 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                                <p className="text-purple-700">Generating AI insights, please wait...</p>
                             </div>
                        )}
                    </>
                );
            case 'Task':
                 return (
                    <>
                        <select value={parentProject} onChange={(e) => setParentProject(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="">Select Parent Project...</option>
                            {projects.filter(p => p.status !== 'Pending').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="New Task Name" className="w-full p-2 border rounded-md" />
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type of Item</label>
                        <select value={itemType} onChange={(e) => setItemType(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option>Project Request</option>
                            <option>Task</option>
                            <option>Program</option>
                            <option>Client</option>
                        </select>
                    </div>
                    {renderFormFields()}
                </div>

                {errorMessage && (
                    <div className="mt-4 text-center p-3 bg-red-100 text-red-800 rounded-md text-sm">
                        {errorMessage}
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
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