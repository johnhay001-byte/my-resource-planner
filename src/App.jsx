import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
import { collection, getDocs, writeBatch, doc, setDoc, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { initialClients, initialPeople, initialTasks, initialLeave, initialPrograms, initialProjects } from './data.js'; 
import { Header } from './components/Header';
import { SidePanel } from './components/SidePanel';
import { ClientFilter } from './components/ClientFilter';
import { Node } from './components/Node';
import { NetworkView } from './components/NetworkView';
import { ProjectHub } from './components/ProjectHub';
import { PersonDetailCard } from './components/PersonDetailCard';
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

export default function App() {
    const [clients, setClients] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leave, setLeave] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDataEmpty, setIsDataEmpty] = useState(false);

    const [activeFilter, setActiveFilter] = useState('all');
    const [activeProject, setActiveProject] = useState(null); 
    const [detailedPerson, setDetailedPerson] = useState(null);
    const [viewMode, setViewMode] = useState('orgChart');
    const [networkFocus, setNetworkFocus] = useState(null);
    
    useEffect(() => {
        const unsubscribers = [];
        const collections = {
            clients: setClients,
            programs: setPrograms,
            projects: setProjects,
            people: setPeople,
            tasks: setTasks,
            leave: setLeave,
        };

        const checkDataEmpty = async () => {
            try {
                const peopleSnapshot = await getDocs(collection(db, "people"));
                if (peopleSnapshot.empty) setIsDataEmpty(true);
                setLoading(false);
            } catch (error) {
                console.error("Error checking for initial data:", error);
                setLoading(false);
            }
        };
        
        checkDataEmpty();

        Object.entries(collections).forEach(([name, setter]) => {
            const unsub = onSnapshot(collection(db, name), (snapshot) => {
                setter(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            }, (error) => {
                console.error(`Error fetching ${name}:`, error);
            });
            unsubscribers.push(unsub);
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, []);

    const { data, projectMap } = useMemo(() => {
        const newClients = JSON.parse(JSON.stringify(clients));
        const projMap = new Map();
        
        newClients.forEach(client => {
            client.children = programs.filter(p => p.clientId === client.id);
            (client.children || []).forEach(program => {
                program.children = projects.filter(p => p.programId === program.id);
                (program.children || []).forEach(project => {
                    projMap.set(project.id, {...project, tasks: tasks.filter(t => t.projectId === project.id)});
                    const assignedPeopleIds = new Set(tasks.filter(t => t.projectId === project.id).map(t => t.assigneeId));
                     project.children = people.filter(p => assignedPeopleIds.has(p.personId));
                });
            });
        });

        return { data: newClients, projectMap: projMap };

    }, [clients, programs, projects, people, tasks]);

    const handlePersonSelect = (personId) => {
         if (detailedPerson?.personId === personId) {
            setDetailedPerson(null);
        } else {
            const personData = people.find(p => p.personId === personId);
            setDetailedPerson(personData);
        }
    };
    
    const handleProjectSelect = (project) => {
        const fullProjectData = projectMap.get(project.id);
        setActiveProject(fullProjectData);
    };

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
            case 'DELETE_NODE':
                const { id, nodeType } = action;
                if (nodeType === 'program') {
                    await deleteDoc(doc(db, 'programs', id));
                } else if (nodeType === 'project') {
                    await deleteDoc(doc(db, 'projects', id));
                }
                break;
        }
     };
    
    const displayedData = activeFilter === 'all' ? data : data.filter(client => client.id === activeFilter);
    const networkData = networkFocus ? data.filter(c => c.id === networkFocus.id) : data;

    const handleNetworkNodeClick = (node) => {
        if(node.type === 'person') handlePersonSelect(node.personId);
        if(node.type === 'project') handleProjectSelect(node);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="text-xl font-semibold">Loading Data...</div></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                <Header viewMode={viewMode} setViewMode={setViewMode} onUpload={uploadInitialData} isDataEmpty={isDataEmpty} />
                {viewMode === 'orgChart' && <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />}
                <div className="flex flex-1 overflow-hidden">
                    <main className="flex-1 p-8 overflow-y-auto relative" onClick={() => setDetailedPerson(null)}>
                       {viewMode === 'orgChart' ? (
                           <div className="max-w-7xl mx-auto relative z-20">
                               {displayedData.map((client, clientIndex) => (<div key={client.id} className="mb-8"><Node node={client} level={0} onUpdate={handleUpdate} path={`${clientIndex}`} onPersonSelect={handlePersonSelect} onProjectSelect={handleProjectSelect} /></div>))}
                               {displayedData.length === 0 && !loading && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2></div> )}
                            </div>
                       ) : (
                           <NetworkView data={networkData} onNodeClick={handleNetworkNodeClick}/>
                       )}
                    </main>
                    <SidePanel 
                        data={data}
                        allPeople={people} 
                        onPersonSelect={handlePersonSelect} 
                        onUpdate={handleUpdate}
                        viewMode={viewMode}
                        networkFocus={networkFocus}
                        setNetworkFocus={setNetworkFocus}
                        clients={clients}
                        programs={programs}
                    />
                </div>
                {activeProject && <ProjectHub project={activeProject} onClose={() => setActiveProject(null)} onUpdate={handleUpdate} allPeople={people} leaveData={leave}/>}
                <PersonDetailCard person={detailedPerson} onClose={() => setDetailedPerson(null)} projectMap={projectMap} tasks={tasks} />
            </div>
        </div>
    );
}

