import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, setDoc, addDoc } from "firebase/firestore";
import { Header } from './components/Header';
import { ClientFilter } from './components/ClientFilter';
import { Node } from './components/Node';
import { PersonModal } from './components/PersonModal';
import { TeamManagementView } from './components/TeamManagementView';
import { WorkHub } from './components/WorkHub';
import './index.css';

export default function App() {
    const [clients, setClients] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('orgChart');
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    
    useEffect(() => {
        const collections = {
            clients: setClients,
            programs: setPrograms,
            projects: setProjects,
            people: setPeople,
            tasks: setTasks,
        };

        const unsubscribers = Object.entries(collections).map(([name, setter]) => 
            onSnapshot(collection(db, name), (snapshot) => {
                setter(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            })
        );
        
        // A simple way to handle initial loading
        const timer = setTimeout(() => setLoading(false), 2000); 

        return () => {
            unsubscribers.forEach(unsub => unsub());
            clearTimeout(timer);
        };
    }, []);

    const data = useMemo(() => {
        if (loading) return [];
        const clientTree = JSON.parse(JSON.stringify(clients));
        
        clientTree.forEach(client => {
            client.children = programs.filter(p => p.clientId === client.id);
            (client.children || []).forEach(program => {
                program.children = projects.filter(p => p.programId === program.id);
                (program.children || []).forEach(project => {
                    const assignedPeopleIds = new Set(tasks.filter(t => t.projectId === project.id).map(t => t.assigneeId));
                    project.children = people.filter(p => assignedPeopleIds.has(p.personId));
                });
            });
        });
        return clientTree;
    }, [clients, programs, projects, people, tasks, loading]);


    const handleUpdate = async (action) => {
       switch (action.type) {
            case 'ADD_PERSON':
                setEditingPerson(null);
                setIsPersonModalOpen(true);
                break;
            case 'EDIT_PERSON':
                setEditingPerson(action.person);
                setIsPersonModalOpen(true);
                break;
            case 'SAVE_PERSON':
                setIsPersonModalOpen(false);
                setEditingPerson(null);
                if (action.person.id) { 
                    const personRef = doc(db, "people", action.person.id);
                    const { id, ...personData } = action.person;
                    await setDoc(personRef, personData, { merge: true });
                } else { 
                    const newPerson = { ...action.person, personId: `p-${Date.now()}` };
                    await addDoc(collection(db, "people"), newPerson);
                }
                break;
            case 'DELETE_PERSON':
                if (action.personId) await deleteDoc(doc(db, "people", action.personId));
                break;
        }
     };
    
    const displayedData = activeFilter === 'all' ? data : data.filter(client => client.id === activeFilter);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="text-xl font-semibold">Loading Data...</div></div>;
    }

    const renderView = () => {
        switch (viewMode) {
            case 'teamManagement':
                return <TeamManagementView people={people} onUpdate={handleUpdate} />;
            case 'workHub':
                return <WorkHub programs={programs} projects={projects} tasks={tasks} allPeople={people} onUpdate={handleUpdate} />;
            case 'orgChart':
            default:
                return (
                    <>
                        <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                        <main className="p-8">
                           <div className="max-w-7xl mx-auto">
                               {displayedData.map((client) => (<div key={client.id} className="mb-8"><Node node={client} level={0} onUpdate={handleUpdate} onPersonSelect={()=>{}} onProjectSelect={()=>{}} /></div>))}
                               {displayedData.length === 0 && !loading && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2></div> )}
                            </div>
                       </main>
                    </>
                );
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                <Header viewMode={viewMode} setViewMode={setViewMode} />
                <div className="flex-1 overflow-y-auto">{renderView()}</div>
                 <PersonModal 
                    isOpen={isPersonModalOpen}
                    onClose={() => setIsPersonModalOpen(false)}
                    onSave={(person) => handleUpdate({ type: 'SAVE_PERSON', person })}
                    personData={editingPerson}
                />
            </div>
        </div>
    );
}

