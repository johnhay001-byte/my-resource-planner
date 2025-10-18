import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import './index.css';

function App() {
  const [viewMode, setViewMode] = useState('orgChart');
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collections = {
        clients: setClients,
        programs: setPrograms,
        people: setPeople,
    };

    const unsubscribers = Object.entries(collections).map(([name, setter]) => 
        onSnapshot(collection(db, name), (snapshot) => {
            setter(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        })
    );
    
    setLoading(false);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const handleUpdate = async (action) => {
    switch (action.type) {
        case 'DELETE_PERSON':
            if (action.personId) {
                await deleteDoc(doc(db, "people", action.personId));
            }
            break;
        // ... other actions
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-xl font-semibold">Loading Data...</div></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
        <div className="flex flex-col h-screen">
            <Header viewMode={viewMode} setViewMode={setViewMode} />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-700">Step 2.1 Complete</h2>
                    <p className="mt-2 text-gray-500">The Team Management View is now live.</p>
                    <p className="mt-4 text-gray-500">Check the 'Team' tab in the side panel to see the interactive table.</p>
                </main>
                <SidePanel 
                    onUpdate={handleUpdate} 
                    clients={clients} 
                    programs={programs} 
                    allPeople={people} 
                    onPersonSelect={() => {}} 
                />
            </div>
        </div>
    </div>
  );
}

export default App;

