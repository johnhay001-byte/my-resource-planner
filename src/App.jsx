import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, addDoc, doc } from "firebase/firestore";
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import './index.css';

function App() {
  const [viewMode, setViewMode] = useState('orgChart');
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
        setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
    });

    const unsubPrograms = onSnapshot(collection(db, "programs"), (snapshot) => {
        setPrograms(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });

    return () => {
        unsubClients();
        unsubPrograms();
    };
  }, []);

  const handleUpdate = async (action) => {
    switch (action.type) {
         case 'ADD_CLIENT':
             if (action.name) await addDoc(collection(db, 'clients'), { name: action.name, type: 'client', strategicFocus: 'New Client' });
             break;
         case 'ADD_PROGRAM':
              if (action.name && action.clientId) {
                 await addDoc(collection(db, 'programs'), { name: action.name, type: 'program', clientId: action.clientId });
             }
             break;
         case 'ADD_PROJECT':
             if (action.name && action.programId) {
                 const program = programs.find(p => p.id === action.programId);
                 if(program) {
                     await addDoc(collection(db, 'projects'), { name: action.name, type: 'project', brief: '', programId: action.programId, clientId: program.clientId });
                 }
             }
             break;
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
                    <h2 className="text-2xl font-bold text-gray-700">Step 2.3: Hierarchy Management</h2>
                    <p className="mt-2 text-gray-500">The Side Panel now contains forms to add new items.</p>
                    <p className="mt-4 text-gray-500">Our next step is to display this data in the main content area.</p>
                </main>
                <SidePanel onUpdate={handleUpdate} clients={clients} programs={programs} />
            </div>
        </div>
    </div>
  );
}

export default App;

