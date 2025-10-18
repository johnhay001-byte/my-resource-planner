import React, { useState } from 'react';
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import './index.css';

function App() {
  const [viewMode, setViewMode] = useState('orgChart');

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
        <div className="flex flex-col h-screen">
            <Header viewMode={viewMode} setViewMode={setViewMode} isDataEmpty={false} />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-700">Step 2.2 Complete</h2>
                    <p className="mt-2 text-gray-500">The Side Panel is now rendering from its own file.</p>
                    <p className="mt-4 text-gray-500">Our next step is to connect Firebase and bring in our data.</p>
                </main>
                <SidePanel />
            </div>
        </div>
    </div>
  );
}

export default App;

