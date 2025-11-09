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
import { Login } from './components/Login';
import { Notification } from './components/Notification'; // Import the new Notification component
import './index.css';

// We will bring this back in a future step
const NetworkView = () => null; 

// Simple full-page loading spinner
const FullPageSpinner = () => (
    <div className="flex items-center justify-center h-screen text-xl font-semibold">
        Loading Application...
    </div>
);

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
    const [editingPerson, setEditingPerson] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    
    // --- ▼▼▼ NEW NOTIFICATION STATE ▼▼▼ ---
    const [notification, setNotification] = useState({ message: '', type: '' });

    // --- Auth State ---
    const [auth, setAuth] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); 
    const [isAuthLoading, setIsAuthLoading] = useState(true); 

    // --- Auth Setup ---
    useEffect(() => {
        const app = db.app;
        const authInstance = getAuth(app);
        setAuth(authInstance); 

        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setCurrentUser(user); 
            setIsAuthLoading(false); 
            if(user) {
                setViewMode('orgChart'); 
                setActiveFilter('all');
            }
        });
        return () => unsubscribe();
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return; 
        }
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

    // --- ▼▼▼ NEW NOTIFICATION TIMER ▼▼▼ ---
    useEffect(() => {
        if (notification.message) {
            // Set a timer to hide the notification after 3 seconds
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
            // Clear the timer if the component unmounts
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- handleUpdate (Reducer) ---
    const handleUpdate = async (action) => {
        try {
            switch (action.type) {
                case 'DELETE_NODE':
                    const collectionName = action.nodeType === 'client' ? 'clients' : action.nodeType === 'program' ? 'programs' : 'projects';
                    if (action.nodeType !== 'person') {
                        await deleteDoc(doc(db, collectionName, action.id));
                        setNotification({ message: `${action.nodeType} deleted.`, type: 'success' }); // Add notification
                    }
                    break;
                case 'ADD_PERSON':
                    setEditingPerson(null); 
                    setIsPersonModalOpen(true);
                    break;
                case 'EDIT_PERSON':
                    setEditingPerson(action.person); 
                    setIsPersonModalOpen(true);
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
                    setNotification({ message: 'Person saved successfully!', type: 'success' }); // Add notification
                    break;
                case 'DELETE_PERSON':
                     if (action.personId) {
                        await deleteDoc(doc(db, "people", action.personId));
                        setNotification({ message: 'Person deleted.', type: 'success' }); // Add notification
                     }
                     break;
                case 'ADD_TASK':
                    if (action.task) { 
                        await addDoc(collection(db, "tasks"), action.task);
                        // This case is from ProjectHub, let's not show a toast for this one
                    } else {
                        setEditingTask(null); 
                        setIsTaskModalOpen(true);
                    }
                    break;
                case 'EDIT_TASK':
                    setEditingTask(action.task); 
                    setIsTaskModalOpen(true);
                    break;
                case 'SAVE_TASK':
                    if (action.task.id) { 
                         const taskRef = doc(db, "tasks", action.task.id);
                         await setDoc(taskRef, action.task, { merge: true }); 
                    } else { 
                        if (!action.task.projectId) {
                            setNotification({ message: 'Please select a project for the new task.', type: 'error' }); // Show error
                            return; 
                        }
                        await addDoc(collection(db, "tasks"), action.task);
                    }
                    setIsTaskModalOpen(false);
                    setEditingTask(null); 
                    setNotification({ message: 'Task saved successfully!', type: 'success' }); // Add notification
                    break;
                 case 'UPDATE_TASK_ASSIGNEE': 
                    if (action.taskId) {
                        const taskRef = doc(db, 'tasks', action.taskId);
                        await updateDoc(taskRef, { assigneeId: action.assigneeId || null });
                        // No notification for this to avoid clutter
                    }
                    break;
                case 'ADD_COMMENT':
                    if (action.taskId && action.commentText) {
                        const taskRef = doc(db, "tasks", action.taskId);
                        await updateDoc(taskRef, {
                            comments: arrayUnion({ author: action.author || 'User', text: action.commentText, date: new Date().toISOString() })
                        });
                    }
                    break;
                default:
                    console.warn('Unknown action type:', action.type);
            }
        } catch (error) {
            console.error("Error handling update:", error);
            setNotification({ message: `An error occurred: ${error.message}`, type: 'error' }); // Show error notification
        }
    };

    // --- Sign Out Function ---
    const handleSignOut = () => {
        if(auth) {
            signOut(auth).catch((error) => console.error("Sign out error", error));
        }
    };
    
    // --- Data Memoization ---
    // (No changes)
    const projectMap = useMemo(() => {
        const map = new Map();
        projects.forEach(p => map.set(p.id, p));
        return map;
    }, [projects]);

    const displayedData = useMemo(() => {
        const clientList = activeFilter === 'all' ? clients : clients.filter(c => c.id === activeFilter);
        const peopleById = new Map(people.map(p => [p.id, p]));
        const tasksByProjectId = tasks.reduce((acc, task) => {
            if (!acc[task.projectId]) {
                acc[task.projectId] = [];
            }
            acc[task.projectId].push(task);
            return acc;
        }, {});
        return clientList.map(client => ({
            ...client,
            type: 'client',
            children: programs.filter(p => p.clientId === client.id).map(program => ({
                ...program,
                type: 'program',
                children: projects.filter(p => p.programId === program.id).map(project => ({
                    ...project,
                    type: 'project',
                    tasks: tasksByProjectId[project.id] || [], 
                    children: (project.team || []) 
                        .map(personId => peopleById.get(personId)) 
                        .filter(Boolean) 
                        .map(person => ({ ...person, type: 'person', personId: person.id })) 
                }))
            }))
        }));
    }, [activeFilter, clients, programs, projects, people, tasks]);


    // --- View Renderer ---
    // (No changes)
    const renderView = () => {
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
            default: 
                return (
                     <>
                       <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                       <main className="p-8"><div className="space-y-4">{displayedData.map(client => (<div key={client.id} className="bg-white p-6 rounded-lg shadow-md"><Node node={client} level={0} onUpdate={handleUpdate} onPersonSelect={(personId) => setDetailedPerson(people.find(p => p.id === personId))} onProjectSelect={(project) => setSelectedProject(project)} /></div>))}</div></main>
                    </>
                );
        }
    };

    // --- Top-Level Render Logic ---

    // 1. Show spinner while checking auth
    if (isAuthLoading) {
         return <FullPageSpinner />;
    }

    // 2. Show Login screen if not authenticated
    if (!currentUser) {
        return <Login />;
    }

    // 3. Show main app if authenticated
    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            {/* ▼▼▼ RENDER THE NOTIFICATION COMPONENT ▼▼▼ */}
            <Notification 
                message={notification.message} 
                type={notification.type} 
                onClose={() => setNotification({ message: '', type: '' })} 
            />
            <div className="flex flex-col h-screen">
                <Header viewMode={viewMode} setViewMode={setViewMode} handleSignOut={handleSignOut} /> 
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-8 text-center">Loading data...</div> : renderView()}
                </div>
                 <PersonModal 
                    isOpen={isPersonModalOpen}
                    onClose={() => { setIsPersonModalOpen(false); setEditingPerson(null); }} 
                    onSave={(person) => handleUpdate({ type: 'SAVE_PERSON', person })}
                    personData={editingPerson}
                />
                 <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} 
                    onSave={(task) => handleUpdate({ type: 'SAVE_TASK', task })}
                    taskData={editingTask}
                    allPeople={people}
                    projects={projects} 
                />
                {detailedPerson && <PersonDetailCard person={detailedPerson} onClose={() => setDetailedPerson(null)} projectMap={projectMap} tasks={tasks} />}
                
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