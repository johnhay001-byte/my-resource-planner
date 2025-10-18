import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, getDocs, writeBatch, doc, setDoc, onSnapshot } from "firebase/firestore";
import { initialClients, initialPeople, initialTasks, initialLeave, initialPrograms, initialProjects } from './data.js'; 
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import './index.css';

async function uploadInitialData() {
    console.log("Starting initial data upload...");
    const batch = writeBatch(db);

    initialPeople.forEach(person => {
        const docRef = doc(db, "people", person.personId);
        batch.set(docRef, person);
    });

    initialClients.forEach(client => {
        const docRef = doc(db, "clients", client.id);
        batch.set(docRef, client);
    });

    initialPrograms.forEach(program => {
        const docRef = doc(db, "programs", program.id);
        batch.set(docRef, program);
    });

    initialProjects.forEach(project => {
        const docRef = doc(db, "projects", project.id);
        batch.set(docRef, project);
    });

    initialTasks.forEach(task => {
        const docRef = doc(db, "tasks", task.id);
        batch.set(docRef, task);
    });

    initialLeave.forEach(leaveItem => {
        const docRef = doc(db, "leave", leaveItem.leaveId);
        batch.set(docRef, leaveItem);
    });

    try {
        await batch.commit();
        console.log("Initial data uploaded successfully!");
        window.alert("Initial data has been successfully uploaded to your database.");
    } catch (error) {
        console.error("Error uploading initial data: ", error);
        window.alert("There was an error uploading the initial data. Check the console for details.");
    }
}

function App() {
  const [viewMode, setViewMode] = useState('orgChart');
  const [isDataEmpty, setIsDataEmpty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDataEmpty = async () => {
        try {
            const peopleSnapshot = await getDocs(collection(db, "people"));
            if (peopleSnapshot.empty) {
                setIsDataEmpty(true);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error checking for initial data:", error);
            setLoading(false);
        }
    };
    
    checkDataEmpty();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-xl font-semibold">Loading Data...</div></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
        <div className="flex flex-col h-screen">
            <Header viewMode={viewMode} setViewMode={setViewMode} onUpload={uploadInitialData} isDataEmpty={isDataEmpty} />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 p-8 text-center">
                     <h2 className="text-2xl font-bold text-gray-700">Step 2.3 Complete</h2>
                    <p className="mt-2 text-gray-500">Firebase is integrated. If you can see the 'Upload Initial Data' button, our connection is working.</p>
                    <p className="mt-4 text-gray-500">If the button is not visible, it means the database already contains data from a previous step, which is also a success!</p>
                </main>
                <SidePanel />
            </div>
        </div>
    </div>
  );
}

export default App;

