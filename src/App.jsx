import React, { useState } from 'react';
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import { ClientFilter } from './components/ClientFilter';
import './index.css';

function App() {
  const [viewMode, setViewMode] = useState('orgChart');
  const [activeFilter, setActiveFilter] = useState('all');

  // We'll use placeholder data for now, which will be replaced by Firebase data later.
  const placeholderClients = [
    { id: 'client-1', name: 'Client A' },
    { id: 'client-2', name: 'Client B' },
  ];

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
        <div className="flex flex-col h-screen">
            <Header viewMode={viewMode} setViewMode={setViewMode} />
            <ClientFilter clients={placeholderClients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-700">Step 2.3 In Progress</h2>
                    <p className="mt-2 text-gray-500">The Client Filter component is now live.</p>
                    <p className="mt-4 text-gray-500">Our next step is to connect to Firebase and populate this with real data.</p>
                </main>
                <SidePanel />
            </div>
        </div>
    </div>
  );
}

export default App;

