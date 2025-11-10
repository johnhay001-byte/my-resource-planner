// Forcing a new build - v4 - AddItem button fix
import React from 'react';
// ▼▼▼ Import PlusIcon ▼▼▼
import { ListTreeIcon, UsersIcon, BriefcaseIcon, Share2Icon, DollarSignIcon, LogOutIcon, PlusIcon } from './Icons'; 

export const Header = ({ viewMode, setViewMode, handleSignOut, onUpdate }) => ( // Add onUpdate prop
    <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Project & Resource Visualizer</h1>
            <p className="mt-1 text-gray-600">Explore and manage your organization's resources.</p>
        </div>
        <div className="flex items-center space-x-2">
            {/* Main navigation buttons */}
            <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                <button onClick={() => setViewMode('orgChart')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'orgChart' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <ListTreeIcon className="h-5 w-5 mr-2" /> Org Chart
                </button>
                <button onClick={() => setViewMode('teamManagement')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'teamManagement' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <UsersIcon className="h-5 w-5 mr-2" /> Manage Team
                </button>
                 <button onClick={() => setViewMode('workHub')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'workHub' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <BriefcaseIcon className="h-5 w-5 mr-2" /> Work Hub
                </button>
                <button onClick={() => setViewMode('financials')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'financials' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <DollarSignIcon className="h-5 w-5 mr-2" /> Financials
                </button>
                <button onClick={() => setViewMode('network')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'network' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <Share2Icon className="h-5 w-5 mr-2" /> Network
                </button>
            </div>

            {/* ▼▼▼ ADD NEW GLOBAL 'ADD' BUTTON ▼▼▼ */}
            <button 
                onClick={() => onUpdate({ type: 'ADD_ITEM' })}
                className="p-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors" 
                title="Add New Item"
            >
                <PlusIcon className="h-5 w-5" />
            </button>
            
            <button 
                onClick={handleSignOut} 
                className="p-3 bg-gray-200 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors" 
                title="Sign Out"
            >
                <LogOutIcon className="h-5 w-5" />
            </button>
        </div>
    </div>
);