import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
// ▼▼▼ ADD FIREBASE AUTH IMPORTS ▼▼▼
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, doc, deleteDoc, setDoc, addDoc, updateDoc, arrayUnion } from "firebase/firestore";

import { Header } from './components/Header';
import { ClientFilter } from './components/ClientFilter';
import { Node } from './components/Node';
import { PersonModal } from './components/PersonModal';
import { TeamManagementView } from './components/TeamManagementView';
import { WorkHub } from './components/WorkHub';
import { PersonDetailCard } from './components/PersonDetailCard';
import { TaskModal } from './components/TaskModal';
import { ProjectHub } from './components/ProjectHub'; // Import ProjectHub
import { Login } from './components/Login'; // Import the new Login component
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
    const [activeFilter, setActiveFilter] =useState('all');
    const [viewMode, setViewMode] = useState('orgChart');
    const [selectedProject, setSelectedProject] = useState(null); // For ProjectHub
    const [detailedPerson, setDetailedPerson] = useState(null);
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    // --- ▼▼▼ NEW AUTH STATE ▼▼▼ ---
    const [auth, setAuth] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Holds the logged-in user object
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Tracks auth check on page load

    // --- Firebase Auth Setup ---
    useEffect(() => {
        const app = db.app; // Get the app instance from the db
        const authInstance = getAuth(app);
        setAuth(authInstance); // Store auth instance

        // Listen for changes in authentication state (login/logout)
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            setCurrentUser(user); // Set the current user (or null if logged out)
            setIsAuthLoading(false); // Auth check is complete
            if(user) {
                // If user logs in, reset view to default
                setViewMode('orgChart'); 
                setActiveFilter('all');
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // --- Firestore Data Fetching ---
    useEffect(() => {
        // This effect now only runs if a user is logged in
        if (!currentUser) {
            setLoading(false);
            return; // Don't fetch data if not logged in
        }

        setLoading(true);
        const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubPrograms = onSnapshot(collection(db, "programs"), (snapshot) => setPrograms(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => setProjects(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubPeople = onSnapshot(collection(db, "people"), (snapshot) => setPeople(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            setLoading(false); // Data loading is complete
        });
        // Cleanup function
        return () => { unsubClients(); unsubPrograms(); unsubProjects(); unsubPeople(); unsubTasks(); };
    }, [currentUser]); // Re-run this effect when the user logs in or out

    // --- handleUpdate (Reducer) ---
    // (This function is the same as the one from our last successful fix)
    const handleUpdate = async (action) => {
        try {
            switch (action.type) {
                case 'DELETE_NODE':
                    const collectionName = action.nodeType === 'client' ? 'clients' : action.nodeType === 'program' ? 'programs' : 'projects';
                    if (action.nodeType !== 'person') {
                        await deleteDoc(doc(db, collectionName, action.id));
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
                    break;
                case 'DELETE_PERSON':
                     if (action.personId) {
                        await deleteDoc(doc(db, "people", action.personId));
                     }
                     break;
                case 'ADD_TASK':
                    if (action.task) { 
                        await addDoc(collection(db, "tasks"), action.task);
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
                            alert("Please select a project for the new task."); // Basic validation
                            return; 
                        }
                        await addDoc(collection(db, "tasks"), action.task);
                    }
                    setIsTaskModalOpen(false);
                    setEditingTask(null); 
                    break;
                 case 'UPDATE_TASK_ASSIGNEE': 
                    if (action.taskId) {
                        const taskRef = doc(db, 'tasks', action.taskId);
                        await updateDoc(taskRef, { assigneeId: action.assigneeId || null });
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
            alert(`An error occurred: ${error.message}`); 
        }
    };

    // --- ▼▼▼ NEW SIGN OUT FUNCTION ▼▼▼ ---
    const handleSignOut = () => {
        if(auth) {
            signOut(auth).catch((error) => console.error("Sign out error", error));
        }
    };
    
    // --- Data Memoization ---
    // (No changes to projectMap or displayedData logic)
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
                // ▼▼▼ Pass currentUser to WorkHub ▼▼▼
                return <WorkHub clients={clients} programs={programs} projects={projects} tasks={tasks} allPeople={people} onUpdate={handleUpdate} currentUser={currentUser} />; 
            case 'network':
                return <div className="h-[calc(100vh-120px)]"><NetworkView data={displayedData} onNodeClick={(node) => console.log('Network node clicked:', node)} /></div>; 
            default: // Fallback to orgChart
                return (
                     <>
                       <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                       <main className="p-8"><div className="space-y-4">{displayedData.map(client => (<div key={client.id} className="bg-white p-6 rounded-lg shadow-md"><Node node={client} level={0} onUpdate={handleUpdate} onPersonSelect={(personId) => setDetailedPerson(people.find(p => p.id === personId))} onProjectSelect={(project) => setSelectedProject(project)} /></div>))}</div></main>
                    </>
                );
        }
    };

    // --- ▼▼▼ NEW TOP-LEVEL RENDER LOGIC ▼▼▼ ---

    // 1. Show a full-page spinner while checking auth status
    if (isAuthLoading) {
         return <FullPageSpinner />;
    }

    // 2. If auth check is done and NO user is logged in, show the Login screen
    if (!currentUser) {
        return <Login />;
    }

    // 3. If user IS logged in, show the main application
    // (Show loading spinner while data is being fetched)
    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                {/* Pass the new handleSignOut function to the Header */}
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
                    projects={projects} // Pass projects for the dropdown
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