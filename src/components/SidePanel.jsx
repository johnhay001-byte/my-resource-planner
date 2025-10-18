import React, { useState, useMemo } from 'react';
import { UsersIcon } from './Icons';

export const SidePanel = ({ onUpdate, clients, programs }) => {
    const [activeTab, setActiveTab] = useState('manage');

    // State for the management forms
    const [newClientName, setNewClientName] = useState('');
    const [newProgramName, setNewProgramName] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedProgramId, setSelectedProgramId] = useState('');


    const handleAddClient = () => {
        if (newClientName.trim()) {
            onUpdate({ type: 'ADD_CLIENT', name: newClientName.trim() });
            setNewClientName('');
        }
    };

    const handleAddProgram = () => {
        if (newProgramName.trim() && selectedClientId) {
            onUpdate({ type: 'ADD_PROGRAM', name: newProgramName.trim(), clientId: selectedClientId });
            setNewProgramName('');
            setSelectedClientId('');
        }
    };

    const handleAddProject = () => {
        if (newProjectName.trim() && selectedProgramId) {
            onUpdate({ type: 'ADD_PROJECT', name: newProjectName.trim(), programId: selectedProgramId });
            setNewProjectName('');
            setSelectedProgramId('');
        }
    };

    const allProgramsForDropdown = useMemo(() => {
        return programs.map(prog => {
            const client = clients.find(c => c.id === prog.clientId);
            return { ...prog, clientName: client ? client.name : 'Unknown' };
        });
    }, [programs, clients]);

    return (
        <div className="w-full lg:w-96 bg-white p-6 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('visualize')} className={`py-2 px-4 font-semibold ${activeTab === 'visualize' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Visualize</button>
                    <button onClick={() => setActiveTab('team')} className={`py-2 px-4 font-semibold ${activeTab === 'team' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Team</button>
                    <button onClick={() => setActiveTab('manage')} className={`py-2 px-4 font-semibold ${activeTab === 'manage' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Manage</button>
                </nav>
            </div>

            {activeTab === 'visualize' && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Visualization Controls</h2>
                    <p className="text-gray-500">Controls for filtering will be built here.</p>
                </div>
            )}
            {activeTab === 'team' && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><UsersIcon className="h-6 w-6 mr-3" />Team Overview</h2>
                    <p className="text-gray-500">The sortable, editable table of team members will be built here.</p>
                </div>
            )}
            {activeTab === 'manage' && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Hierarchy Management</h2>
                    <div className="space-y-6">
                        {/* Add Client Form */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Add New Client</h3>
                            <div className="flex gap-2">
                                <input type="text" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Client Name" className="flex-grow p-2 border rounded-md" />
                                <button onClick={handleAddClient} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400" disabled={!newClientName.trim()}>Add</button>
                            </div>
                        </div>

                        {/* Add Program Form */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Add New Program</h3>
                            <div className="space-y-2">
                                <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full p-2 border rounded-md">
                                    <option value="">Select a Client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <input type="text" value={newProgramName} onChange={(e) => setNewProgramName(e.target.value)} placeholder="Program Name" className="flex-grow p-2 border rounded-md" />
                                    <button onClick={handleAddProgram} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400" disabled={!newProgramName.trim() || !selectedClientId}>Add</button>
                                </div>
                            </div>
                        </div>

                        {/* Add Project Form */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Add New Project</h3>
                            <div className="space-y-2">
                                <select value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)} className="w-full p-2 border rounded-md">
                                    <option value="">Select a Program...</option>
                                    {allProgramsForDropdown.map(p => <option key={p.id} value={p.id}>{p.clientName} / {p.name}</option>)}
                                </select>
                                <div className="flex gap-2">
                                    <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Project Name" className="flex-grow p-2 border rounded-md" />
                                    <button onClick={handleAddProject} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400" disabled={!newProjectName.trim() || !selectedProgramId}>Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

