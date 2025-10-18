import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, setDoc, addDoc } from "firebase/firestore";
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import { ClientFilter } from './components/ClientFilter';
import { Node } from './components/Node';
import { ProjectHub } from './components/ProjectHub';
import { PersonModal } from './components/PersonModal';
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
    const [activeProject, setActiveProject] = useState(null); 
    const [detailedPerson, setDetailedPerson] = useState(null);
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

        let loadedCount = 0;
        const totalCollections = Object.keys(collections).length;

        const unsubscribers = Object.entries(collections).map(([name, setter]) => 
            onSnapshot(collection(db, name), (snapshot) => {
                setter(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                loadedCount++;
                if (loadedCount === totalCollections) {
                    setLoading(false);
                }
            }, (error) => {
                console.error(`Error fetching ${name}:`, error);
                setLoading(false);
            })
        );

        return () => unsubscribers.forEach(unsub => unsub());
    }, []);

    const data = useMemo(() => {
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

         clientTree.forEach(client => {
            const peopleOnTasksInClient = new Set();
            (client.children || []).forEach(p => (p.children || []).forEach(proj => (proj.children || []).forEach(person => peopleOnTasksInClient.add(person.personId))));
            
            const primaryPeople = people.filter(p => p.clientPrimary === client.name && !peopleOnTasksInClient.has(p.personId));
            
            if(primaryPeople.length > 0) {
                 const generalProgram = (client.children || []).find(p => p.name === 'Client Management & Operations');
                 if (generalProgram) {
                    const generalProject = (generalProgram.children || []).find(p => p.name === 'General Account Management');
                    if (generalProject) {
                         if (!generalProject.children) generalProject.children = [];
                         const existingPeople = new Set(generalProject.children.map(p => p.personId));
                         const newPeople = primaryPeople.filter(p => !existingPeople.has(p.personId));
                        generalProject.children.push(...newPeople);
                    }
                 }
            }
        });

        return clientTree;

    }, [clients, programs, projects, people, tasks]);

    const projectMap = useMemo(() => {
        const map = new Map();
        projects.forEach(p => map.set(p.id, p));
        return map;
    }, [projects]);


    const handlePersonSelect = (personId) => {
         if (detailedPerson?.personId === personId) {
            setDetailedPerson(null);
        } else {
            const personData = people.find(p => p.personId === personId);
            setDetailedPerson(personData);
        }
    };
    
    const handleProjectSelect = (project) => {
        const fullProjectData = {
            ...project,
            tasks: tasks.filter(t => t.projectId === project.id)
        };
        setActiveProject(fullProjectData);
    };

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
                if (action.person.id) { // Editing existing
                    const personRef = doc(db, "people", action.person.id);
                    const { id, ...personData } = action.person;
                    await setDoc(personRef, personData, { merge: true });
                } else { // Adding new
                    const newPerson = { ...action.person, personId: `p-${Date.now()}` };
                    await addDoc(collection(db, "people"), newPerson);
                }
                break;
            case 'DELETE_PERSON':
                if (action.personId) {
                    await deleteDoc(doc(db, "people", action.personId));
                }
                break;
        }
     };
    
    const displayedData = activeFilter === 'all' ? data : data.filter(client => client.id === activeFilter);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="text-xl font-semibold">Loading Data...</div></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                <Header viewMode={viewMode} setViewMode={setViewMode} />
                <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                <div className="flex flex-1 overflow-hidden">
                    <main className="flex-1 p-8 overflow-y-auto relative">
                       <div className="max-w-7xl mx-auto relative z-20">
                           {displayedData.map((client) => (<div key={client.id} className="mb-8"><Node node={client} level={0} onUpdate={handleUpdate} onPersonSelect={handlePersonSelect} onProjectSelect={handleProjectSelect} /></div>))}
                           {displayedData.length === 0 && !loading && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2></div> )}
                        </div>
                    </main>
                    <SidePanel 
                        onUpdate={handleUpdate} 
                        clients={clients} 
                        programs={programs} 
                        allPeople={people} 
                        onPersonSelect={handlePersonSelect} 
                    />
                </div>
                 <PersonModal 
                    isOpen={isPersonModalOpen}
                    onClose={() => setIsPersonModalOpen(false)}
                    onSave={(person) => handleUpdate({ type: 'SAVE_PERSON', person })}
                    personData={editingPerson}
                />
                {activeProject && <ProjectHub project={activeProject} onClose={() => setActiveProject(null)} onUpdate={handleUpdate} allPeople={people} />}
            </div>
        </div>
    );
}

