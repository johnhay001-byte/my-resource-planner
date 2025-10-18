import React from 'react';
import { ListTreeIcon, Share2Icon } from './Icons';

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
