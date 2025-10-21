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
import { ProjectHub } from './components/ProjectHub';
import './index.css';

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
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
            const fetchedClients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'client' }));
            setClients(fetchedClients);
            setLoading(false);
        });
        const unsubPrograms = onSnapshot(collection(db, "programs"), (snapshot) => {
            setPrograms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'program' })));
        });
        const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'project' })));
        });
        const unsubPeople = onSnapshot(collection(db, "people"), (snapshot) => {
            setPeople(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'person' })));
        });
         const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'task' })));
        });

        return () => {
            unsubClients();
            unsubPrograms();
            unsubProjects();
            unsubPeople();
            unsubTasks();
        };
    }, []);

    const handleUpdate = async (action) => {
        switch (action.type) {
             case 'SAVE_PERSON': {
                const { id, ...personData } = action.person;
                if (id) {
                    await setDoc(doc(db, "people", id), personData, { merge: true });
                } else {
                    await addDoc(collection(db, "people"), personData);
                }
                setIsPersonModalOpen(false);
                break;
            }
            case 'EDIT_PERSON': {
                setEditingPerson(action.person);
                setIsPersonModalOpen(true);
                break;
            }
             case 'DELETE_PERSON': {
                await deleteDoc(doc(db, "people", action.personId));
                break;
            }
             case 'SAVE_TASK': {
                const { id, ...taskData } = action.task;
                if (id) {
                    await setDoc(doc(db, "tasks", id), taskData, { merge: true });
                } else {
                    await addDoc(collection(db, "tasks"), taskData);
                }
                setIsTaskModalOpen(false);
                break;
            }
             case 'ADD_TASK': {
                await addDoc(collection(db, "tasks"), action.task);
                const projectRef = doc(db, "projects", action.task.projectId);
                await updateDoc(projectRef, {
                    tasks: arrayUnion(action.task) // This might need adjustment based on how tasks are stored
                });
                break;
            }
            case 'EDIT_TASK': {
                setEditingTask(action.task);
                setIsTaskModalOpen(true);
                break;
            }
            case 'ADD_COMMENT': {
                const taskRef = doc(db, "tasks", action.taskId);
                await updateDoc(taskRef, {
                    comments: arrayUnion({ text: action.commentText, author: action.author, date: new Date().toISOString() })
                });
                break;
            }
             case 'DELETE_NODE': {
                const collectionName = `${action.nodeType}s`;
                await deleteDoc(doc(db, collectionName, action.id));
                break;
            }
            default:
                console.warn("Unknown action type:", action.type);
        }
    };
    
     const projectMap = useMemo(() => {
        return projects.reduce((acc, proj) => {
            acc[proj.id] = proj.name;
            return acc;
        }, {});
    }, [projects]);

    const displayedData = useMemo(() => {
        const hierarchy = clients.map(client => ({
            ...client,
            children: programs.filter(p => p.clientId === client.id).map(program => ({
                ...program,
                children: projects.filter(proj => proj.programId === program.id).map(project => ({
                    ...project,
                    tasks: tasks.filter(t => t.projectId === project.id),
                    children: people.filter(p => p.projectId === project.id).map(person => ({
                        ...person,
                        id: `${project.id}-${person.id}`, 
                        personId: person.id,
                        type: 'person'
                    }))
                }))
            }))
        }));

        if (activeFilter === 'all') return hierarchy;
        return hierarchy.filter(client => client.id === activeFilter);
    }, [clients, programs, projects, people, tasks, activeFilter]);


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

