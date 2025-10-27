import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, setDoc, addDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Header } from './components/Header';
import { ClientFilter } from './components/ClientFilter';
import { Node } from './components/Node';
import { PersonModal } from './components/PersonModal';
import { TeamManagementView } from './components/TeamManagementView';
import { WorkHub } from './components/WorkHub';
import { PersonDetailCard } from './components/PersonDetailCard';
import { TaskModal } from './components/TaskModal';
import { ProjectHub } from './components/ProjectHub'; // Ensure ProjectHub is imported if used elsewhere
import './index.css';

// We will bring this back in a future step
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
    const [selectedProject, setSelectedProject] = useState(null); // State for ProjectHub
    const [detailedPerson, setDetailedPerson] = useState(null);
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    
    // --- Firestore Data Fetching ---
    useEffect(() => {
        setLoading(true);
        const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubPrograms = onSnapshot(collection(db, "programs"), (snapshot) => setPrograms(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => setProjects(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubPeople = onSnapshot(collection(db, "people"), (snapshot) => setPeople(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))));
        const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            setLoading(false); // Set loading false after tasks are fetched
        });
        // Cleanup function
        return () => { unsubClients(); unsubPrograms(); unsubProjects(); unsubPeople(); unsubTasks(); };
    }, []);

    // --- handleUpdate (Reducer) ---
    const handleUpdate = async (action) => {
        try {
            switch (action.type) {
                case 'DELETE_NODE':
                    const collectionName = action.nodeType === 'client' ? 'clients' : action.nodeType === 'program' ? 'programs' : 'projects';
                    // Deleting people is handled by DELETE_PERSON
                    if (action.nodeType !== 'person') {
                        await deleteDoc(doc(db, collectionName, action.id));
                    }
                    break;
                case 'ADD_PERSON':
                    setEditingPerson(null); // Clear editing state for adding new
                    setIsPersonModalOpen(true);
                    break;
                case 'EDIT_PERSON':
                    setEditingPerson(action.person); // Set person data for editing
                    setIsPersonModalOpen(true);
                    break;
                case 'SAVE_PERSON':
                    if (action.person.id) { // Editing existing person
                        const personRef = doc(db, "people", action.person.id);
                        await setDoc(personRef, action.person, { merge: true }); // Use setDoc with merge for updates
                    } else { // Adding new person
                        await addDoc(collection(db, "people"), action.person);
                    }
                    setIsPersonModalOpen(false);
                    setEditingPerson(null); // Clear editing state after save
                    break;
                case 'DELETE_PERSON':
                     if (action.personId) {
                        await deleteDoc(doc(db, "people", action.personId));
                     }
                     break;
                case 'ADD_TASK':
                    // ▼▼▼ FIX HERE ▼▼▼
                    if (action.task) { 
                        // This case is for saving a task created *within* ProjectHub's ListView
                        await addDoc(collection(db, "tasks"), action.task);
                    } else {
                        // This case is for opening the modal to add a *new* task (from WorkHub)
                        setEditingTask(null); // Explicitly clear editing task state
                        setIsTaskModalOpen(true);
                    }
                    // ▲▲▲ END FIX ▲▲▲
                    break;
                case 'EDIT_TASK':
                    setEditingTask(action.task); // Set task data for editing
                    setIsTaskModalOpen(true);
                    break;
                case 'SAVE_TASK':
                    if (action.task.id) { // Editing existing task
                         const taskRef = doc(db, "tasks", action.task.id);
                         await setDoc(taskRef, action.task, { merge: true }); // Use setDoc with merge for updates
                    } else { // Adding new task (from modal)
                        if (!action.task.projectId) {
                            alert("Please select a project for the new task."); // Basic validation
                            return; // Prevent saving without a project
                        }
                        await addDoc(collection(db, "tasks"), action.task);
                    }
                    setIsTaskModalOpen(false);
                    setEditingTask(null); // Clear editing state after save
                    break;
                 case 'UPDATE_TASK_ASSIGNEE': // Added for inline assignment in WorkHub
                    if (action.taskId) {
                        const taskRef = doc(db, 'tasks', action.taskId);
                        await updateDoc(taskRef, { assigneeId: action.assigneeId || null });
                    }
                    break;
                case 'ADD_COMMENT':
                    if (action.taskId && action.commentText) {
                        const taskRef = doc(db, "tasks", action.taskId);
                        await updateDoc(taskRef, {
                            // Ensure comments array exists before trying to add to it
                            comments: arrayUnion({ author: action.author || 'User', text: action.commentText, date: new Date().toISOString() })
                        });
                    }
                    break;
                default:
                    console.warn('Unknown action type:', action.type);
            }
        } catch (error) {
            console.error("Error handling update:", error);
            alert(`An error occurred: ${error.message}`); // Show error to user
        }
    };
    
    // --- Data Memoization ---
    const projectMap = useMemo(() => {
        const map = new Map();
        projects.forEach(p => map.set(p.id, p));
        return map;
    }, [projects]);

    const displayedData = useMemo(() => {
        const clientList = activeFilter === 'all' ? clients : clients.filter(c => c.id === activeFilter);
        const peopleById = new Map(people.map(p => [p.id, p]));
        
        // Pre-calculate tasks grouped by project ID for efficiency
        const tasksByProjectId = tasks.reduce((acc, task) => {
            if (!acc[task.projectId]) {
                acc[task.projectId] = [];
            }
            acc[task.projectId].push(task);
            return acc;
        }, {});

        // Build the nested structure
        return clientList.map(client => ({
            ...client,
            type: 'client',
            children: programs.filter(p => p.clientId === client.id).map(program => ({
                ...program,
                type: 'program',
                children: projects.filter(p => p.programId === program.id).map(project => ({
                    ...project,
                    type: 'project',
                    tasks: tasksByProjectId[project.id] || [], // Assign tasks from pre-calculated map
                    children: (project.team || []) // Get people IDs from project.team
                        .map(personId => peopleById.get(personId)) // Map IDs to actual people objects
                        .filter(Boolean) // Filter out any undefined if an ID doesn't match
                        .map(person => ({ ...person, type: 'person', personId: person.id })) // Add type and ensure personId exists
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
                                            onProjectSelect={(project) => setSelectedProject(project)} // Pass the whole project object
                                        />
                                   </div>
                               ))}
                               {displayedData.length === 0 && !loading && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2></div> )}
                            </div>
                       </main>
                    </>
                );
            case 'teamManagement':
                 // Pass the correct onPersonSelect function
                 return <TeamManagementView people={people} tasks={tasks} onUpdate={handleUpdate} onPersonSelect={(personId) => setDetailedPerson(people.find(p => p.id === personId))} />;
            case 'workHub':
                 // Pass currentUser if needed later, currently WorkHub derives it
                return <WorkHub clients={clients} programs={programs} projects={projects} tasks={tasks} allPeople={people} onUpdate={handleUpdate} />; 
            case 'network':
                // Pass data if NetworkView needs it
                return <div className="h-[calc(100vh-120px)]"><NetworkView data={displayedData} onNodeClick={(node) => console.log('Network node clicked:', node)} /></div>; 
            // Add Financials case if FinancialsDashboard exists
            // case 'financials':
            //     return <FinancialsDashboard people={people} projects={projects} />;
            default: // Fallback to orgChart
                return (
                     <>
                       <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                       <main className="p-8"><div className="space-y-4">{displayedData.map(client => (<div key={client.id} className="bg-white p-6 rounded-lg shadow-md"><Node node={client} level={0} onUpdate={handleUpdate} onPersonSelect={(personId) => setDetailedPerson(people.find(p => p.id === personId))} onProjectSelect={(project) => setSelectedProject(project)} /></div>))}</div></main>
                    </>
                );
        }
    };

    // Show loading state
    if (loading) {
         return <div className="flex items-center justify-center h-screen text-xl font-semibold">Loading Data...</div>; // Simple loading indicator
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                {/* Ensure setViewMode is passed to Header */}
                <Header viewMode={viewMode} setViewMode={setViewMode} /> 
                <div className="flex-1 overflow-y-auto">{renderView()}</div>
                 <PersonModal 
                    isOpen={isPersonModalOpen}
                    onClose={() => { setIsPersonModalOpen(false); setEditingPerson(null); }} // Clear editing state on close
                    onSave={(person) => handleUpdate({ type: 'SAVE_PERSON', person })}
                    personData={editingPerson}
                />
                 <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }} // Clear editing state on close
                    onSave={(task) => handleUpdate({ type: 'SAVE_TASK', task })}
                    taskData={editingTask}
                    allPeople={people}
                    projects={projects} // Pass projects to the modal
                />
                {detailedPerson && <PersonDetailCard person={detailedPerson} onClose={() => setDetailedPerson(null)} projectMap={projectMap} tasks={tasks} />}
                
                {/* Render ProjectHub when a project is selected */}
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

