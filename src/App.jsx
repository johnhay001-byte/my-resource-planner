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
import { AddItemModal } from './components/AddItemModal';
import './index.css';

export default function App() {
    // ... (all state variables remain unchanged) ...

    // --- Auth Setup ---
    useEffect(() => {
        // ... (no changes)
    }, []);

    // --- Data Fetching ---
    useEffect(() => {
        // ... (no changes)
    }, [currentUser]);

    // --- Notification Timer ---
    useEffect(() => {
        // ... (no changes)
    }, [notification]);

    // --- handleUpdate (Reducer) ---
    const handleUpdate = async (action) => {
        setIsSaving(true);
        try {
            switch (action.type) {
                case 'ADD_ITEM':
                    // ... (no change)
                    break;
                case 'ADD_CLIENT':
                    // ... (no change)
                    break;
                case 'ADD_PROGRAM':
                    // ... (no change)
                    break;
                case 'ADD_PROJECT':
                    // ▼▼▼ ADD brief and status from modal ▼▼▼
                    const newProject = { 
                        ...action.item, 
                        brief: action.item.brief || '',
                        status: 'Pending' // Default status
                    };
                    await addDoc(collection(db, "projects"), newProject);
                    setNotification({ message: 'Project Request submitted!', type: 'success' });
                    setIsAddItemModalOpen(false);
                    break;
                case 'ADD_TASK_FROM_GLOBAL': 
                    // ... (no change)
                    break;
                
                // ▼▼▼ NEW ACTION: Open ProjectHub from Triage ▼▼▼
                case 'OPEN_PROJECT':
                    setSelectedProject(action.project);
                    setIsSaving(false);
                    break;
                
                // ▼▼▼ NEW ACTION: Approve a project ▼▼▼
                case 'UPDATE_PROJECT_STATUS':
                    const projectRef = doc(db, "projects", action.projectId);
                    await updateDoc(projectRef, {
                        status: action.newStatus
                    });
                    setNotification({ message: `Project status updated to ${action.newStatus}`, type: 'success' });
                    break;

                case 'DELETE_NODE':
                    // ... (no change)
                    break;
                case 'ADD_PERSON':
                    // ... (no change)
                    break;
                case 'EDIT_PERSON':
                    // ... (no change)
                    break;
                case 'SAVE_PERSON':
                    // ... (no change)
                    break;
                case 'DELETE_PERSON':
                     // ... (no change)
                     break;
                case 'ADD_TASK':
                    // ... (no change)
                    break;
                case 'EDIT_TASK':
                    // ... (no change)
                    break;
                case 'SAVE_TASK':
                    // ... (no change)
                    break;
                case 'ADD_COMMENT':
                    // ... (no change)
                    break;
                default:
                    console.warn('Unknown action type:', action.type);
                    setIsSaving(false);
            }
        } catch (error) {
            console.error("Error handling update:", error);
            setNotification({ message: `Error: ${error.message}`, type: 'error' });
        } finally {
             // ... (finally block logic remains unchanged, but we add our new actions) ...
             if (!['ADD_PERSON', 'EDIT_PERSON', 'ADD_TASK', 'EDIT_TASK', 'ADD_ITEM', 'OPEN_PROJECT'].includes(action.type)) {
                setIsSaving(false);
            }
            if (['SAVE_PERSON', 'SAVE_TASK', 'ADD_CLIENT', 'ADD_PROGRAM', 'ADD_PROJECT', 'ADD_TASK_FROM_GLOBAL', 'UPDATE_PROJECT_STATUS'].includes(action.type)) {
                setIsSaving(false);
            }
        }
    };
    
    // --- Sign Out Handler ---
    const handleSignOut = () => {
        // ... (no changes)
    };

    // --- Data Memoization ---
    const projectMap = useMemo(() => {
        // ... (no changes)
    }, [projects]);

    const displayedData = useMemo(() => {
        // ... (no changes to this function's logic)
        // BUT it will now automatically filter out 'Pending' projects
        // because of the logic in `projectsWithTasks`
        const clientList = activeFilter === 'all' ? clients : clients.filter(c => c.id === activeFilter);
        const peopleById = new Map(people.map(p => [p.id, p]));
        
        // ▼▼▼ Filter out Pending projects from Org Chart view ▼▼▼
        const activeProjects = projects.filter(p => p.status !== 'Pending');

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
                // ▼▼▼ Use activeProjects ▼▼▼
                children: (activeProjects || []).filter(p => p.programId === program.id).map(project => ({
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
    }, [activeFilter, clients, programs, projects, people, tasks]); // 'projects' is still a dependency


    // --- View Renderer ---
    const renderView = () => {
        // ... (no changes)
    };
    
    // --- Auth-Based Return Logic ---
    if (isAuthLoading || (currentUser && loading)) {
        // ... (no change)
    }
    if (!currentUser) {
        // ... (no change)
    }

    // --- Main App Return ---
    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            {/* ... (Notification component remains unchanged) ... */}
            
            <div className="flex flex-col h-screen">
                <Header 
                    // ... (Header props remain unchanged)
                />
                <div className="flex-1 overflow-y-auto">
                    {renderView()}
                </div>
                
                {/* --- Modals --- */}
                 <PersonModal 
                    // ... (PersonModal props remain unchanged)
                />
                 <TaskModal 
                    // ... (TaskModal props remain unchanged)
                />
                <AddItemModal
                    // ... (AddItemModal props remain unchanged)
                />
                
                {/* --- Detail Cards / Overlays --- */}
                {detailedPerson && (
                    <PersonDetailCard 
                        // ... (PersonDetailCard props remain unchanged)
                    />
                )}
                
                {selectedProject && (
                    <ProjectHub
                        // ... (ProjectHub props remain unchanged)
                    />
                )}
            </div>
        </div>
    );
}