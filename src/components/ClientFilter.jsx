import React from 'react';

export const ClientFilter = ({ clients, activeFilter, onFilterChange }) => (
    <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <span className="font-semibold text-gray-600 flex-shrink-0">Filter by Client:</span>
            <button
                onClick={() => onFilterChange('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
                All Clients
            </button>
            {(clients || []).map(client => (
                <button
                    key={client.id}
                    onClick={() => onFilterChange(client.id)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === client.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
                >
                    {client.name}
                </button>
            ))}
        </div>
    </div>
);

