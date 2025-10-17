// FINAL-APP-FILE
import React, { useState } from 'react';
import { Header } from './components';

function App() {
  const [viewMode, setViewMode] = useState('orgChart');

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
        <div className="flex flex-col h-screen">
            <Header viewMode={viewMode} setViewMode={setViewMode} isDataEmpty={false} />
            <div className="flex-1 p-8">
                {/* Main content will go here in the next steps */}
                <p>Step 1.2 is complete if you can see the header above.</p>
            </div>
        </div>
    </div>
  );
}

export default App;

