import React, { useState } from 'react';
import { UsersIcon, WandIcon } from './Icons';

export const SidePanel = () => {
    const [activeTab, setActiveTab] = useState('team');

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
                    <p className="text-gray-500">Controls for filtering and network views will go here in a future step.</p>
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
                    <p className="text-gray-500">Forms for adding clients, programs, and projects will be built here.</p>
                </div>
            )}
        </div>
    );
};

