import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './Icons';

// Add 'projects' to the props
export const AddItemModal = ({ isOpen, onClose, onSave, clients, programs, projects, isSaving }) => {
    const [itemType, setItemType] = useState('project'); 
    const [name, setName] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState(''); // New state for task parent
    const [errorMessage, setErrorMessage] = useState('');

    // Reset all parent IDs when itemType changes
    useEffect(() => {
        setSelectedClientId('');
        setSelectedProgramId('');
        setSelectedProjectId('');
    }, [itemType]);

    if (!isOpen) return null;

    const handleSave = () => {
        setErrorMessage('');
        if (!name.trim()) {
            setErrorMessage('Name is required.');
            return;
        }

        let itemData = { name };
        let actionType = '';

        if (itemType === 'client') {
            actionType = 'ADD_CLIENT';
        } else if (itemType === 'program') {
            if (!selectedClientId) {
                setErrorMessage('A parent client must be selected.');
                return;
            }
            actionType = 'ADD_PROGRAM';
            itemData.clientId = selectedClientId;
        } else if (itemType === 'project') {
            if (!selectedProgramId) {
                setErrorMessage('A parent program must be selected.');
                return;
            }
            actionType = 'ADD_PROJECT';
            itemData.programId = selectedProgramId;
            itemData.team = []; 
        } else if (itemType === 'task') { // ▼▼▼ ADD THIS BLOCK ▼▼▼
            if (!selectedProjectId) {
                setErrorMessage('A parent project must be selected.');
                return;
            }
            actionType = 'ADD_TASK';
            itemData.projectId = selectedProjectId;
            itemData.status = 'To Do';
            itemData.startDate = new Date().toISOString().split('T')[0];
            itemData.endDate = new Date().toISOString().split('T')[0];
            itemData.comments = [];
        } // ▲▲▲ END ADDED BLOCK ▲▲▲

        onSave({ type: actionType, item: itemData });
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setSelectedClientId('');
        setSelectedProgramId('');
        setSelectedProjectId(''); // Reset project ID
        setErrorMessage('');
    };

    const renderParentDropdown = () => {
        if (itemType === 'program') {
            return (
                <select 
                    value={selectedClientId} 
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full p-2 border rounded-md bg-gray-50"
                >
                    <option value="">Select Parent Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            );
        }
        if (itemType === 'project') {
            const availablePrograms = selectedClientId 
                ? programs.filter(p => p.clientId === selectedClientId) 
                : programs;
            
            return (
                <>
                    <select 
                        value={selectedClientId} 
                        onChange={(e) => {
                            setSelectedClientId(e.target.value);
                            setSelectedProgramId(''); // Reset program if client changes
                        }}
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option value="">Filter by Client (Optional)...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select 
                        value={selectedProgramId} 
                        onChange={(e) => setSelectedProgramId(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option value="">Select Parent Program...</option>
                        {availablePrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </>
            );
        }
        if (itemType === 'task') { // ▼▼▼ ADD THIS BLOCK ▼▼▼
            const availablePrograms = selectedClientId 
                ? programs.filter(p => p.clientId === selectedClientId) 
                : programs;
            
            const availableProjects = selectedProgramId
                ? projects.filter(p => p.programId === selectedProgramId)
                : projects;
            
            return (
                <>
                    <select 
                        value={selectedClientId} 
                        onChange={(e) => {
                            setSelectedClientId(e.target.value);
                            setSelectedProgramId('');
                            setSelectedProjectId('');
                        }}
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option value="">Filter by Client (Optional)...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select 
                        value={selectedProgramId} 
                        onChange={(e) => {
                            setSelectedProgramId(e.target.value);
                            setSelectedProjectId('');
                        }}
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option value="">Filter by Program (Optional)...</option>
                        {availablePrograms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select 
                        value={selectedProjectId} 
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option value="">Select Parent Project...</option>
                        {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </>
            );
        } // ▲▲▲ END ADDED BLOCK ▲▲▲
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast">
                <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
                <div className="space-y-4">
                    <select 
                        value={itemType} 
                        onChange={(e) => setItemType(e.target.value)} 
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option value="task">Task</option> {/* Added Task */}
                        <option value="project">Project</option>
                        <option value="program">Program</option>
                        <option value="client">Client</option>
                    </select>
                    
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder={`New ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} Name`} 
                        className="w-full p-2 border rounded-md"
                    />
                    
                    {renderParentDropdown()}

                    {errorMessage && (
                        <div className="text-center p-3 bg-red-100 text-red-800 rounded-md text-sm">
                            {errorMessage}
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving} 
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancel
                    </button>
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