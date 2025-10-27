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
    const [selectedProject, setSelectedProject] = useState(null);
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
            setLoading(false);
        });
        return () => { unsubClients(); unsubPrograms(); unsubProjects(); unsubPeople(); unsubTasks(); };
    }, []);

    // --- handleUpdate (Reducer) ---
    const handleUpdate = async (action) => {
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
S                    }
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
        const tasksByProjectId = new Map();
        tasks.forEach(task => {
            if (!tasksByProjectId.has(task.projectId)) tasksByProjectId.set(task.projectId, []);
            tasksByProjectId.get(task.projectId).push(task);
        });

        return clientList.map(client => ({
            ...client,
            type: 'client',
            children: programs.filter(p => p.clientId === client.id).map(program => ({
                ...program,
                type: 'program',
                children: projects.filter(p => p.programId === program.id).map(project => ({
                    ...project,
                    type: 'project',
                    tasks: tasksByProjectId.get(project.id) || [],
                    children: (project.team || []).map(personId => ({
                        ...peopleById.get(personId),
                        id: personId, 
                        personId: personId,
                        type: 'person'
                    })).filter(p => p.name) 
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
                                            onProjectSelect={setSelectedProject}
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
                return <WorkHub clients={clients} programs={programs} projects={projects} tasks={tasks} allPeople={people} onUpdate={handleUpdate} />;
            case 'network':
                return <div className="h-[calc(100vh-120px)]"><NetworkView data={displayedData} onNodeClick={(node) => console.log(node)} /></div>;
            default:
                return (
                     <>
                       <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                       <main className="p-8"><div className="space-y-4">{displayedData.map(client => (<div key={client.id} className="bg-white p-6 rounded-lg shadow-md"><Node node={client} level={0} onUpdate={() => {}} onPersonSelect={() => {}} onProjectSelect={() => {}} /></div>))}</div></main>
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
                 <TaskModal 
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    onSave={(task) => handleUpdate({ type: 'SAVE_TASK', task })}
                    taskData={editingTask}
                    allPeople={people}
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

