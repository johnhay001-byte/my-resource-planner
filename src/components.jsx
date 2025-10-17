import React from 'react';

// --- ICONS ---
const ListTreeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 6V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 18v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><line x1="12" y1="6" x2="12" y2="18"/></svg>);
const Share2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>);


// --- HEADER COMPONENT ---
export const Header = ({ viewMode, setViewMode, onUpload, isDataEmpty }) => (
    <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Project & Resource Visualizer</h1>
            <p className="mt-1 text-gray-600">Explore your organization's structure and connections.</p>
        </div>
        <div className="flex items-center gap-4">
            {isDataEmpty && (
                <button onClick={onUpload} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-green-600 text-white hover:bg-green-700">
                    Upload Initial Data
                </button>
            )}
            <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                <button onClick={() => setViewMode('orgChart')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'orgChart' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <ListTreeIcon className="h-5 w-5 mr-2" /> Org Chart View
                </button>
                <button onClick={() => setViewMode('network')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'network' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <Share2Icon className="h-5 w-5 mr-2" /> Network View
                </button>
            </div>
        </div>
    </div>
);
