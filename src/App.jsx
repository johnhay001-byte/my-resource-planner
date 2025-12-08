// Forcing a new build - v5 - Full Sync
import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase'; 
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, doc, deleteDoc, setDoc, addDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; // Import arrayRemove

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
import { AdminDataUpload } from './components/AdminDataUpload';
import './index.css';

export default function App() {
    // --- App State (Data) ---
    const [clients, setClients] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [groups, setGroups] = useState([]); 
    const [loading, setLoading] = useState(true);

    // --- UI State ---
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('orgChart');
    const [selectedProject, setSelectedProject] = useState(null); 
    const [detailedPerson, setDetailedPerson] = useState(null);
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isAdminUploadOpen, setIsAdminUploadOpen] = useState(false);
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
        const unsubGroups = onSnapshot(collection(db, "groups"), (snapshot) => setGroups(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))); 
        
        const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            setLoading(false); 
        });
        return () => { unsubClients(); unsubPrograms(); unsubProjects(); unsubPeople(); unsubTasks(); unsubGroups(); }; 
    }, [currentUser]);

    // --- Notification Timer ---
    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- handleUpdate (Reducer) ---
    const handleUpdate = async (action) => {
        setIsSaving(true);
        try {
            switch (action.type) {
                // --- Global Add Item Modal ---
                case 'ADD_ITEM':
                    setIsSaving(false);
                    setIsAddItemModalOpen(true);
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
                    const newProject = { 
                        ...action.item, 
                        brief: action.item.brief || '',
                        status: 'Pending', 
                        team: [],
                    };
                    await addDoc(collection(db, "projects"), newProject);
                    setNotification({ message: 'Project Request submitted!', type: 'success' });
                    setIsAddItemModalOpen(false);
                    break;
                case 'ADD_TASK_FROM_GLOBAL': 
                    if (!action.item.projectId) {
                         setNotification({ message: 'A Parent Project must be selected.', type: 'error' });
                         setIsSaving(false);
                         return;
                    }
                    await addDoc(collection(db, "tasks"), action.item);
                    setNotification({ message: 'Task added!', type: 'success' });
                    setIsAddItemModalOpen(false);
                    break;
                
                // --- Triage / ProjectHub Actions ---
                case 'OPEN_PROJECT':
                    // Find the most up-to-date version of the project from state
                    const liveProject = projects.find(p => p.id === action.project.id);
                    setSelectedProject(liveProject || action.project);
                    setIsSaving(false);
                    break;
                case 'UPDATE_PROJECT_STATUS':
                    const projectRef_status = doc(db, "projects", action.projectId);
                    await updateDoc(projectRef_status, {
                        status: action.newStatus
                    });
                    setNotification({ message: `Project status updated to ${action.newStatus}`, type: 'success' });
                    // Update selectedProject state if it's the one being approved
                    if (selectedProject && selectedProject.id === action.projectId) {
                        setSelectedProject(prev => ({ ...prev, status: action.newStatus }));
                    }
                    break;

                // --- Node/Org Chart Actions ---
                case 'DELETE_NODE':
                    const collectionName = action.nodeType === 'client' ? 'clients' : action.nodeType === 'program' ? 'programs' : 'projects';
                    if (action.nodeType !== 'person') {
                        await deleteDoc(doc(db, collectionName, action.id));
                        setNotification({ message: `${action.nodeType} deleted.`, type: 'success' });
                    }
                    break;

                // --- Person Modal ---
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
                
                // --- Task Modal ---
                case 'ADD_TASK':
                    if (action.task) { // From ProjectHub ListView
                        await addDoc(collection(db, 'tasks'), action.task);
                        setNotification({ message: 'Task added.', type: 'success' });
                    } else { // From WorkHub "New Task" button
                        setEditingTask(null); 
                        setIsTaskModalOpen(true);
                        setIsSaving(false);
                    }
                    break;
                case 'EDIT_TASK':
                    setEditingTask(action.task); 
                    setIsTaskModalOpen(true);
                    setIsSaving(false);
                    break;
                case 'SAVE_TASK':
                    if (!action.task.projectId) {
                         setNotification({ message: 'A project must be selected.', type: 'error' });
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
                    const taskRef_comment = doc(db, "tasks", action.taskId);
                    await updateDoc(taskRef_comment, {
                        comments: arrayUnion({ author: action.author, text: action.commentText, date: new Date().toISOString() })
                    });
                    setNotification({ message: 'Comment added!', type: 'success' });
                    break;
                
                // --- GROUP ACTIONS (TeamManagementView) ---
                case 'ADD_GROUP':
                    await addDoc(collection(db, "groups"), {
                        name: action.name,
                        members: []
                    });
                    setNotification({ message: 'Group created!', type: 'success' });
                    break;
                case 'DELETE_GROUP':
                    await deleteDoc(doc(db, "groups", action.groupId));
                    setNotification({ message: 'Group deleted.', type: 'success' });
                    break;
                case 'ADD_PERSON_TO_GROUP':
                    const groupAddRef = doc(db, "groups", action.groupId);
                    await updateDoc(groupAddRef, {
                        members: arrayUnion(action.personId)
                    });
                    setNotification({ message: 'Member added to group.', type: 'success' });
                    break;
                case 'REMOVE_PERSON_FROM_GROUP':
                    const groupRemoveRef = doc(db, "groups", action.groupId);
                    await updateDoc(groupRemoveRef, {
                        members: arrayRemove(action.personId)
                    });
                    setNotification({ message: 'Member removed from group.', type: 'success' });
                    break;

                // --- PROJECT CASTING ACTIONS (ProjectHub) ---
                case 'ADD_TEAM_MEMBER':
                    const projectRef_add = doc(db, "projects", action.projectId);
                    await updateDoc(projectRef_add, {
                        team: arrayUnion(action.personId)
                    });
                    setNotification({ message: 'Team member added.', type: 'success' });
                    // Update selectedProject state to reflect new team
                    if (selectedProject && selectedProject.id === action.projectId) {
                        setSelectedProject(prev => ({
                            ...prev,
                            team: [...(prev.team || []), action.personId]
                        }));
                    }
                    break;
                case 'REMOVE_TEAM_MEMBER':
                    const projectRef_remove = doc(db, "projects", action.projectId);
                    await updateDoc(projectRef_remove, {
                        team: arrayRemove(action.personId)
                    });
                    setNotification({ message: 'Team member removed.', type: 'success' });
                    // Update selectedProject state to reflect new team
                    if (selectedProject && selectedProject.id === action.projectId) {
                        setSelectedProject(prev => ({
                            ...prev,
                            team: (prev.team || []).filter(id => id !== action.personId)
                        }));
                    }
                    break;
                case 'ASSIGN_GROUP_TO_PROJECT':
                    const groupToAssign = groups.find(g => g.id === action.groupId);
                    if (groupToAssign && groupToAssign.members.length > 0) {
                        const projectRef_assign = doc(db, "projects", action.projectId);
                        await updateDoc(projectRef_assign, {
                            team: arrayUnion(...groupToAssign.members) // Add all members from group
                        });
                        setNotification({ message: `Group "${groupToAssign.name}" assigned to project.`, type: 'success' });
                        // Update selectedProject state to reflect new team
                        if (selectedProject && selectedProject.id === action.projectId) {
                            const newTeam = Array.from(new Set([...(selectedProject.team || []), ...groupToAssign.members]));
                            setSelectedProject(prev => ({ ...prev, team: newTeam }));
                        }
                    }
                    break;

                default:
                    console.warn('Unknown action type:', action.type);
                    setIsSaving(false);
            }
        } catch (error) {
            console.error("Error handling update:", error);
            setNotification({ message: `Error: ${error.message}`, type: 'error' });
            setIsSaving(false);
        } finally {
            // This logic ensures spinners stop correctly
            const nonModalOpens = ['ADD_PERSON', 'EDIT_PERSON', 'ADD_TASK', 'EDIT_TASK', 'ADD_ITEM', 'OPEN_PROJECT'];
            if (nonModalOpens.includes(action.type)) {
                setIsSaving(false);
            }
            
            const modalSaves = [
                'SAVE_PERSON', 'SAVE_TASK', 'ADD_CLIENT', 'ADD_PROGRAM', 'ADD_PROJECT', 
                'ADD_TASK_FROM_GLOBAL', 'UPDATE_PROJECT_STATUS', 'ADD_GROUP', 'DELETE_GROUP', 
                'ADD_PERSON_TO_GROUP', 'REMOVE_PERSON_FROM_GROUP', 'ADD_TEAM_MEMBER', 
                'REMOVE_TEAM_MEMBER', 'ASSIGN_GROUP_TO_PROJECT'
            ];
            if (modalSaves.includes(action.type)) {
                setIsSaving(false);
            }
            
            // Special case for simple deletes
            if(action.type === 'DELETE_NODE' || action.type === 'DELETE_PERSON') {
                setIsSaving(false);
            }
        }
    };
    
    // --- Sign Out Handler ---
    const handleSignOut = () => {
        if(auth) {
            signOut(auth).catch((error) => console.error("Sign out error", error));
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
                                            onProjectSelect={(project) => handleUpdate({ type: 'OPEN_PROJECT', project })}
                                        />
                                    </div>
                                ))}
                                {displayedData.length === 0 && !loading && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2></div> )}
                            </div>
                        </main>
                    </>
                );
         case 'teamManagement': // or case 'team': depending on your exact string
                return (
                    <TeamManagementView 
                        people={people} 
                        tasks={tasks}                       // Ensures Timeline works
                        groups={groups}
                        projects={projects}
                        clientFilter={clientFilter}         // <--- ADDS FILTERING (Fixes "Unassigned")
                        onEditPerson={setEditingPerson}
                        onPersonSelect={setDetailedPerson}  // <--- Updates handler to accept Person Object
                        onUpdate={handleUpdate}
                    />
                ); 
                        />;
            case 'workHub':
                return <WorkHub 
                            clients={clients} 
                            programs={programs} 
                            projects={projects} 
                            tasks={tasks} 
                            allPeople={people} 
                            groups={groups}
                            onUpdate={handleUpdate} 
                            currentUser={currentUser} 
                        />;
            case 'network':
                return <div className="h-[calc(100vh-120px)]"><NetworkView data={displayedData} onNodeClick={(node) => console.log(node)} /></div>;
            case 'financials':
                return <FinancialsDashboard people={people} projects={projects} />;
            default:
                return (
                     <>
                        <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                        <main className="p-8"><div className="space-y-4">{displayedData.map(client => (<div key={client.id} className="bg-white p-6 rounded-lg shadow-md"><Node node={client} level={0} onUpdate={()=>{}} onPersonSelect={()=>{}} onProjectSelect={() => {}} /></div>))}</div></main>
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
               {/* Admin Toolbar */}
<div className="bg-gray-800 text-gray-300 text-xs py-1 px-4 flex justify-end items-center">
    <button 
        onClick={() => setIsAdminUploadOpen(true)}
        className="hover:text-white transition-colors flex items-center gap-1"
    >
        <span>⚙️ Admin: Update Global Rates</span>
    </button>
</div> 
                <Header 
                    viewMode={viewMode} 
                    setViewMode={setViewMode} 
                    handleSignOut={handleSignOut}
                    onUpdate={handleUpdate}
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
                    groups={groups}
                    isSaving={isSaving}
                />
                <AddItemModal
                    isOpen={isAddItemModalOpen}
                    onClose={() => setIsAddItemModalOpen(false)}
                    onSave={handleUpdate}
                    clients={clients}
                    programs={programs}
                    projects={projects}
                    isSaving={isSaving}
                />
                {/* ▼▼▼ KEY FIX: Pass 'clients' prop here ▼▼▼ */}
            <AdminDataUpload 
                isOpen={isAdminUploadOpen}
                onClose={() => setIsAdminUploadOpen(false)}
                clients={clients} 
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
                        project={projects.find(p => p.id === selectedProject.id) || selectedProject} // Use live data from state
                        onClose={() => setSelectedProject(null)}
                        onUpdate={handleUpdate}
                        allPeople={people}
                        allGroups={groups}
                    />
                )}
            </div>
        </div>
    );
}