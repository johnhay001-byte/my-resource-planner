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
    const [clients, setClients] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [projects, setProjects] = useState([]);
    const [people, setPeople] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('orgChart');
    const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [editingTask, setEditingTask] = useState(null);
    const [detailedPerson, setDetailedPerson] = useState(null);
    
    useEffect(() => {
        // ... (useEffect remains the same)
        const collections = {
            clients: setClients,
            programs: setPrograms,
            projects: setProjects,
            people: setPeople,
            tasks: setTasks,
        };
        const unsubscribers = Object.entries(collections).map(([name, setter]) => 
            onSnapshot(collection(db, name), (snapshot) => {
                setter(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
            })
        );
        const timer = setTimeout(() => setLoading(false), 2500); 
        return () => { unsubscribers.forEach(unsub => unsub()); clearTimeout(timer); };
    }, []);

    const data = useMemo(() => {
        // ... (data memo remains the same)
        if (loading) return [];
        const clientTree = JSON.parse(JSON.stringify(clients));
        clientTree.forEach(client => {
            client.children = programs.filter(p => p.clientId === client.id);
            (client.children || []).forEach(program => {
                program.children = projects.filter(p => p.programId === program.id);
                (program.children || []).forEach(project => {
                    const assignedPeopleIds = new Set(tasks.filter(t => t.projectId === project.id).map(t => t.assigneeId));
                    project.children = people.filter(p => assignedPeopleIds.has(p.id));
                });
            });
        });
        return clientTree;
    }, [clients, programs, projects, people, tasks, loading]);
    
    const projectMap = useMemo(() => {
        const map = new Map();
        projects.forEach(p => map.set(p.id, p));
        return map;
    }, [projects]);

    const handlePersonSelect = (personId) => {
        if (detailedPerson?.id === personId) {
            setDetailedPerson(null);
        } else {
            const personData = people.find(p => p.id === personId);
            setDetailedPerson(personData);
        }
    };

    const handleUpdate = async (action) => {
       switch (action.type) {
            // ... (Person management cases remain the same)
            case 'ADD_PERSON': setEditingPerson(null); setIsPersonModalOpen(true); break;
            case 'EDIT_PERSON': setEditingPerson(action.person); setIsPersonModalOpen(true); break;
            case 'SAVE_PERSON':
                setIsPersonModalOpen(false); setEditingPerson(null);
                if (action.person.id) { 
                    const personRef = doc(db, "people", action.person.id);
                    const { id, ...personData } = action.person;
                    await setDoc(personRef, personData, { merge: true });
                } else { 
                    const newPerson = { ...action.person, personId: `p-${Date.now()}` };
                    await addDoc(collection(db, "people"), newPerson);
                }
                break;
            case 'DELETE_PERSON': if (action.personId) await deleteDoc(doc(db, "people", action.personId)); break;
            
            // New Task Management Cases
            case 'ADD_TASK': if (action.task) await addDoc(collection(db, 'tasks'), action.task); break;
            case 'EDIT_TASK': setEditingTask(action.task); setIsTaskModalOpen(true); break;
            case 'SAVE_TASK':
                setIsTaskModalOpen(false); setEditingTask(null);
                if (action.task.id) {
                    const taskRef = doc(db, 'tasks', action.task.id);
                    const { id, ...taskData } = action.task;
                    await setDoc(taskRef, taskData, { merge: true });
                }
                break;
            case 'UPDATE_TASK_ASSIGNEE':
                if (action.taskId) {
                    const taskRef = doc(db, 'tasks', action.taskId);
                    await updateDoc(taskRef, { assigneeId: action.assigneeId || null });
                }
                break;
            case 'ADD_COMMENT':
                if (action.taskId && action.commentText) {
                    const taskRef = doc(db, 'tasks', action.taskId);
                    await updateDoc(taskRef, {
                        comments: arrayUnion({ id: `comm-${Date.now()}`, author: action.author, text: action.commentText })
                    });
                }
                break;
        }
     };
    
    const displayedData = activeFilter === 'all' ? data : data.filter(client => client.id === activeFilter);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><div className="text-xl font-semibold">Loading Data...</div></div>;
    }

    const renderView = () => {
        switch (viewMode) {
            case 'teamManagement':
                return <TeamManagementView people={people} tasks={tasks} onUpdate={handleUpdate} onPersonSelect={handlePersonSelect} />;
            case 'workHub':
                return <WorkHub clients={clients} programs={programs} projects={projects} tasks={tasks} allPeople={people} onUpdate={handleUpdate} />;
            case 'orgChart':
            default:
                return (
                    <>
                        <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                        <main className="p-8">
                           <div className="max-w-7xl mx-auto">
                               {displayedData.map((client) => (<div key={client.id} className="mb-8"><Node node={client} level={0} onUpdate={()=>{}} onPersonSelect={handlePersonSelect} onProjectSelect={() => {}} /></div>))}
                               {displayedData.length === 0 && !loading && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2></div> )}
                            </div>
                       </main>
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
            </div>
        </div>
    );
}

