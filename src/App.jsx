import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, doc, deleteDoc, setDoc, addDoc, updateDoc, arrayUnion } from "firebase/firestore";

// Import all our components
import { Header } from './components/Header';
import { ClientFilter } from './components/ClientFilter';
import { Node } from './components/Node';
import { PersonModal } from './components/PersonModal';
import { TeamManagementView } from './components/TeamManagementView';
import { WorkHub } from './components/WorkHub';
import { PersonDetailCard } from './components/PersonDetailCard';
import { TaskModal } from './components/TaskModal';
import { ProjectHub } from './components/ProjectHub';
import { FinancialsDashboard } from './components/FinancialsDashboard'; 
import { Login } from './components/Login';
import { Notification } from './components/Notification';
import { NetworkView } from './components/NetworkView'; 
import { LoadingSpinner } from './components/LoadingSpinner'; 
import { AddItemModal } from './components/AddItemModal'; // Import new modal
import './index.css';

export default function App() {
    // --- App State (Data) ---
    const [clients, setClients] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- UI State ---
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('orgChart');
    const [selectedProject, setSelectedProject] = useState(null); 
    const [detailedPerson, setDetailedPerson] = useState(null);
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false); // State for new modal
    const [editingPerson, setEditingPerson] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [notification, setNotification] = useState({ message: '', type: '' });

    // --- Auth State ---
    const [auth, setAuth] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); 
    const [isAuthLoading, setIsAuthLoading] = useState(true); 

    // --- Auth Setup ---
    useEffect(() => {
        // ... (no changes)
        const app = db.app;
        const authInstance = getAuth(app);
        setAuth(authInstance); 
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setCurrentUser(user); 
            setIsAuthLoading(false); 
            if(user) { setViewMode('orgChart'); setActiveFilter('all'); }
        });
        return () => unsubscribe();
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        // ... (no changes)
        if (!currentUser) { setLoading(false); return; }
        setLoading(true);
        const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubPrograms = onSnapshot(collection(db, "programs"), (snapshot) => setPrograms(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => setProjects(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubPeople = onSnapshot(collection(db, "people"), (snapshot) => setPeople(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            setLoading(false); 
        });
        return () => { unsubClients(); unsubPrograms(); unsubProjects(); unsubPeople(); unsubTasks(); };
    }, [currentUser]);

    // --- Notification Timer ---
    useEffect(() => {
        // ... (no changes)
        if (notification.message) {
            const timer = setTimeout(() => setNotification({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- handleUpdate (Reducer) ---
    const handleUpdate = async (action) => {
        setIsSaving(true);
        try {
            switch (action.type) {
                // ▼▼▼ NEW ACTIONS FOR HIERARCHY ▼▼▼
                case 'ADD_ITEM':
                    setIsAddItemModalOpen(true);
                    setIsSaving(false);
                    break;
                case 'ADD_CLIENT':
                    await addDoc(collection(db, "clients"), action.item);
                    setNotification({ message: 'Client added!', type: 'success' });
                    setIsAddItemModalOpen(false);
                    break;
                case 'ADD_PROGRAM':
                    await addDoc(collection(db, "programs"), action.item);
                    setNotification({ message: 'Program added!', type: 'success' });
                    setIsAddItemModalOpen(false);
                    break;
                case 'ADD_PROJECT':
                    await addDoc(collection(db, "projects"), action.item);
                    setNotification({ message: 'Project added!', type: 'success' });
                    setIsAddItemModalOpen(false);
                    break;
                // ▲▲▲ END NEW ACTIONS ▲▲▲

                case 'DELETE_NODE':
                    const collectionName = action.nodeType === 'client' ? 'clients' : action.nodeType === 'program' ? 'programs' : 'projects';
                    if (action.nodeType !== 'person') {
                        await deleteDoc(doc(db, collectionName, action.id));
                        setNotification({ message: `${action.nodeType} deleted.`, type: 'success' });
                    }
                    break;
                case 'ADD_PERSON':
                    setEditingPerson(null); 
                    setIsPersonModalOpen(true);
                    setIsSaving(false); 
                    break;
                case 'EDIT_PERSON':
                    setEditingPerson(action.person); 
                    setIsPersonModalOpen(true);
                    setIsSaving(false); 
                    break;
                case 'SAVE_PERSON':
                    if (action.person.id) { 
                        const personRef = doc(db, "people", action.person.id);
                        await setDoc(personRef, action.person, { merge: true }); 
                    } else { 
                        await addDoc(collection(db, "people"), action.person);
                    }
                    setIsPersonModalOpen(false);
                    setEditingPerson(null); 
                    setNotification({ message: 'Person saved successfully!', type: 'success' });
                    break;
                case 'DELETE_PERSON':
                     await deleteDoc(doc(db, "people", action.personId));
                     setNotification({ message: 'Person deleted.', type: 'success' });
                     break;
                case 'ADD_TASK':
                    setEditingTask(null); 
                    setIsTaskModalOpen(true);
                    setIsSaving(false); 
                    break;
                case 'EDIT_TASK':
                    setEditingTask(action.task); 
                    setIsTaskModalOpen(true);
                    setIsSaving(false); 
                    break;
                case 'SAVE_TASK':
                    if (!action.task.id && !action.task.projectId) {
                        setNotification({ message: 'A project must be selected for new tasks.', type: 'error' });
                        setIsSaving(false); 
                        return; 
                    }
                    if (action.task.id) { 
                        const taskRef = doc(db, "tasks", action.task.id);
                        await setDoc(taskRef, action.task, { merge: true }); 
                    } else { 
                        await addDoc(collection(db, "tasks"), action.task);
                    }
                    setIsTaskModalOpen(false);
                    setEditingTask(null); 
                    setNotification({ message: 'Task saved successfully!', type: 'success' });
                    break;
                case 'ADD_COMMENT':
                    const taskRef = doc(db, "tasks", action.taskId);
                    await updateDoc(taskRef, {
                        comments: arrayUnion({ author: action.author, text: action.commentText, date: new Date().toISOString() })
                    });
                    setIsSaving(false); // No spinner for comments
                    break;
                default:
                    console.warn('Unknown action type:', action.type);
                    setIsSaving(false);
            }
        } catch (error) {
            console.error("Error handling update:", error);
            setNotification({ message: `Error: ${error.message}`, type: 'error' });
        } finally {
             if (!['ADD_PERSON', 'EDIT_PERSON', 'ADD_TASK', 'EDIT_TASK', 'ADD_ITEM'].includes(action.type)) {
                setIsSaving(false);
            }
            if (['SAVE_PERSON', 'SAVE_TASK', 'ADD_CLIENT', 'ADD_PROGRAM', 'ADD_PROJECT'].includes(action.type)) {
                setIsSaving(false);
            }
        }
    };
    
    // --- Sign Out Handler ---
    const handleSignOut = () => {
        // ... (no changes)
        if(auth) {
            signOut(auth).catch((error) => console.error("Sign out error", error));
        }
    };

    // --- Data Memoization ---
    const projectMap = useMemo(() => {
        // ... (no changes)
        const map = new Map();
        projects.forEach(p => map.set(p.id, p));
        return map;
    }, [projects]);

    const displayedData = useMemo(() => {
        // ... (no changes)
        const clientList = activeFilter === 'all' ? clients : clients.filter(c => c.id === activeFilter);
        const peopleById = new Map(people.map(p => [p.id, p]));
        const tasksByProjectId = new Map();
        tasks.forEach(task => {
            if (!tasksByProjectId.has(task.projectId)) {
                tasksByProjectId.set(task.projectId, []);
            }
            tasksByProjectId.get(task.projectId).push(task);
        });
        return clientList.map(client => ({
            ...client,
            type: 'client',
            children: (programs || []).filter(p => p.clientId === client.id).map(program => ({
                ...program,
                type: 'program',
                children: (projects || []).filter(p => p.programId === program.id).map(project => ({
                    ...project,
                    type: 'project',
                    tasks: tasksByProjectId.get(project.id) || [], 
                    children: (project.team || []).map(personId => ({
                        ...(peopleById.get(personId) || { name: 'Unknown', role: 'Unknown' }),
                        id: personId, 
                        personId: personId, 
                        type: 'person'
                    })).filter(p => p.name !== 'Unknown') 
                }))
            }))
        }));
    }, [activeFilter, clients, programs, projects, people, tasks]);


    // --- View Renderer ---
    const renderView = () => {
        // ... (no changes)
        switch (viewMode) {
            case 'orgChart':
                return (
                    <>
                       <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                       <main className="p-8">
                            <div className="space-y-4">
                               {displayedData.map(client => (
                                   <div key={client.id} className="bg-white p-6 rounded-lg shadow-md">
                                        <Node 
                                            node={client} 
                                            level={0} 
                                            onUpdate={handleUpdate} 
                                            onPersonSelect={(personId) => setDetailedPerson(people.find(p => p.id === personId))}
                                            onProjectSelect={(project) => setSelectedProject(project)}
                                        />
                                   </div>
                               ))}
                               {displayedData.length === 0 && !loading && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2></div> )}
                            </div>
                       </main>
                    </>
                );
            case 'teamManagement':
                 return <TeamManagementView people={people} tasks={tasks} onUpdate={handleUpdate} onPersonSelect={(personId) => setDetailedPerson(people.find(p => p.id === personId))} />;
            case 'workHub':
                return <WorkHub clients={clients} programs={programs} projects={projects} tasks={tasks} allPeople={people} onUpdate={handleUpdate} currentUser={currentUser} />; 
            case 'network':
                return <div className="h-[calc(100vh-120px)]"><NetworkView data={displayedData} onNodeClick={(node) => console.log('Network node clicked:', node)} /></div>; 
            case 'financials':
                return <FinancialsDashboard people={people} projects={projects} />;
            default: 
                return (
                     <>
                       <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                       <main className="p-8"><div className="space-y-4">{displayedData.map(client => (<div key={client.id} className="bg-white p-6 rounded-lg shadow-md"><Node node={client} level={0} onUpdate={() => {}} onPersonSelect={() => {}} onProjectSelect={() => {}} /></div>))}</div></main>
                    </>
                );
        }
    };
    
    // --- Auth-Based Return Logic ---
    if (isAuthLoading || (currentUser && loading)) {
        return <LoadingSpinner />;
    }
    if (!currentUser) {
        return <Login />;
    }

    // --- Main App Return ---
    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: '' })} 
            />
            
            <div className="flex flex-col h-screen">
                <Header 
                    viewMode={viewMode} 
                    setViewMode={setViewMode} 
                    handleSignOut={handleSignOut}
                    onUpdate={handleUpdate} // Pass onUpdate to Header
                />
                <div className="flex-1 overflow-y-auto">
                    {renderView()}
                </div>
                
                {/* --- Modals --- */}
                 <PersonModal 
                    isOpen={isPersonModalOpen}
                    onClose={() => setIsPersonModalOpen(false)}
                    onSave={(person) => handleUpdate({ type: 'SAVE_PERSON', person })}
                    personData={editingPerson}
                    isSaving={isSaving}
                />
                 <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={(task) => handleUpdate({ type: 'SAVE_TASK', task })}
                    taskData={editingTask}
                    allPeople={people}
                    projects={projects} 
                    isSaving={isSaving}
                />
                {/* ▼▼▼ RENDER THE NEW MODAL ▼▼▼ */}
                <AddItemModal
                    isOpen={isAddItemModalOpen}
                    onClose={() => setIsAddItemModalOpen(false)}
                    onSave={handleUpdate}
                    clients={clients}
                    programs={programs}
                    isSaving={isSaving}
                />
                
                {/* --- Detail Cards / Overlays --- */}
                {detailedPerson && (
                    <PersonDetailCard 
                        person={detailedPerson} 
                        onClose={() => setDetailedPerson(null)} 
                        projectMap={projectMap} 
                        tasks={tasks} 
                    />
                )}
                
                {selectedProject && (
                    <ProjectHub
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onUpdate={handleUpdate}
                        allPeople={people}
                    />
                )}
            </div>
        </div>
    );
}