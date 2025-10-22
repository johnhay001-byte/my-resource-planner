import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
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
import { ProjectHub } from './components/ProjectHub';
import { FinancialsDashboard } from './components/FinancialsDashboard';
import { Login } from './components/Login'; 
import { LoadingSpinner } from './components/LoadingSpinner'; // Import the new spinner
import './index.css';

const NetworkView = () => null; 

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
    const [isSaving, setIsSaving] = useState(false); // State for save operations

    // --- Auth State ---
    const [auth, setAuth] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // --- Firebase Auth Setup ---
    useEffect(() => {
        // ... (no change in this useEffect)
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

    // --- Firestore Data Fetching ---
    useEffect(() => {
        // ... (no change in this useEffect)
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
    }, []);

    // --- handleUpdate (Reducer) ---
    const handleUpdate = async (action) => {
        setIsSaving(true); // Set saving state to true
        try {
            switch (action.type) {
                case 'DELETE_NODE':
                    const collectionName = action.nodeType === 'client' ? 'clients' : action.nodeType === 'program' ? 'programs' : action.nodeType === 'project' ? 'projects' : 'people';
                    if (action.nodeType === 'person') {
                        await deleteDoc(doc(db, "people", action.personId));
                    } else {
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
                        await setDoc(doc(db, "people", action.person.id), action.person, { merge: true });
                    } else {
                        await addDoc(collection(db, "people"), action.person);
                    }
                    setIsPersonModalOpen(false);
                    setEditingPerson(null);
                    break;
                case 'DELETE_PERSON':
                     await deleteDoc(doc(db, "people", action.personId));
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
                        await setDoc(doc(db, "tasks", action.task.id), action.task, { merge: true });
                    } else {
                        await addDoc(collection(db, "tasks"), action.task);
                    }
                    setIsTaskModalOpen(false);
                    setEditingTask(null);
                    break;
                case 'ADD_COMMENT':
                    const taskRef = doc(db, "tasks", action.taskId);
                    await updateDoc(taskRef, {
                        comments: arrayUnion({ author: action.author, text: action.commentText, date: new Date().toISOString() })
                    });
                    break;
                default:
                    console.warn('Unknown action type:', action.type);
            }
        } catch (error) {
            console.error("Error handling update:", error);
            // Here we could add a toast notification for the error
        } finally {
            // Set saving state to false, unless it's just opening a modal
            if (action.type !== 'ADD_PERSON' && action.type !== 'EDIT_PERSON' && action.type !== 'ADD_TASK' && action.type !== 'EDIT_TASK') {
                 setIsSaving(false);
            }
            // For modal saves, we set saving to false inside the modal component's onSave
            if(action.type === 'SAVE_PERSON' || action.type === 'SAVE_TASK') {
                 setIsSaving(false);
            }
        }
    };
    
    const handleSignOut = () => {
        // ... (no change)
    };

    // --- Data Memoization ---
    const projectMap = useMemo(() => {
        // ... (no change)
    }, [projects]);

    const displayedData = useMemo(() => {
        // ... (no change)
    }, [activeFilter, clients, programs, projects, people, tasks]);

    // --- View Renderer ---
    const renderView = () => {
        // ... (no change to this function)
    };
    
    // --- Auth-Based Return Logic ---
    
    // Show loading spinner while checking auth OR fetching data
    if (isAuthLoading || loading) {
        return <LoadingSpinner />;
    }

    // If NOT logged in, show Login screen
    if (!currentUser) {
        return <Login />;
    }

    // If logged in, show the main application
    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                <Header viewMode={viewMode} setViewMode={setViewMode} handleSignOut={handleSignOut} />
                <div className="flex-1 overflow-y-auto">{renderView()}</div>
                 <PersonModal 
                    isOpen={isPersonModalOpen}
                    onClose={() => setIsPersonModalOpen(false)}
                    onSave={(person) => handleUpdate({ type: 'SAVE_PERSON', person })}
                    personData={editingPerson}
                    isSaving={isSaving} // Pass saving state
                />
                 <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={(task) => handleUpdate({ type: 'SAVE_TASK', task })}
                    taskData={editingTask}
                    allPeople={people}
                    isSaving={isSaving} // Pass saving state
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

