import React, { useState, useMemo } from 'react';
import { PlusIcon, MessageSquareIcon, EditIcon, BriefcaseIcon, UserCheckIcon } from './Icons';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- MAIN WORK HUB COMPONENT ---
export const WorkHub = ({ clients, programs, projects, tasks, allPeople, onUpdate }) => {
    const [hubView, setHubView] = useState('allProjects'); // 'allProjects' or 'myTasks'
    
    // For now, we'll hardcode our "current user" to Adena Phillips for prototyping
    const currentUser = useMemo(() => allPeople.find(p => p.name === 'Adena Phillips'), [allPeople]);

    const myTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.assigneeId === currentUser.id);
    }, [tasks, currentUser]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Work Hub</h2>
                 <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setHubView('allProjects')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'allProjects' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                        <BriefcaseIcon className="h-5 w-5 mr-2" /> All Projects
                    </button>
                    <button onClick={() => setHubView('myTasks')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'myTasks' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                        <UserCheckIcon className="h-5 w-5 mr-2" /> My Tasks
                    </button>
                </div>
            </div>
            {hubView === 'allProjects' ? (
                <AllProjectsView clients={clients} programs={programs} projects={projects} tasks={tasks} allPeople={allPeople} onUpdate={onUpdate} />
            ) : (
                <MyTasksView tasks={myTasks} allPeople={allPeople} onUpdate={onUpdate} projects={projects} />
            )}
        </div>
    );
};


// --- SUB-COMPONENTS FOR WORK HUB ---

const AllProjectsView = ({ clients, programs, projects, tasks, allPeople, onUpdate }) => {
     const workData = useMemo(() => {
        return clients.map(client => ({
            ...client,
            children: programs
                .filter(p => p.clientId === client.id)
                .map(program => ({
                    ...program,
                    children: projects
                        .filter(proj => proj.programId === program.id)
                        .map(project => ({
                            ...project,
                            tasks: tasks.filter(t => t.projectId === project.id)
                        }))
                }))
        }));
    }, [clients, programs, projects, tasks]);
    
    return (
        <div className="space-y-8">
            {workData.map(client => (
                <div key={client.id} className="bg-white p-6 rounded-lg border">
                    <h3 className="text-xl font-bold text-purple-800">{client.name}</h3>
                    <div className="pl-4 mt-4 space-y-6 border-l-2">
                        {client.children.map(program => (
                            <div key={program.id}>
                                <h4 className="text-lg font-semibold text-blue-800">{program.name}</h4>
                                <div className="pl-4 mt-2 space-y-4">
                                    {program.children.map(project => (
                                        <Project key={project.id} project={project} allPeople={allPeople} onUpdate={onUpdate} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const MyTasksView = ({ tasks, allPeople, onUpdate, projects }) => {
    if (!tasks || tasks.length === 0) {
        return <div className="bg-white p-8 rounded-lg border text-center text-gray-500">You have no tasks assigned to you.</div>
    }

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : 'Unknown Project';
    };

    return (
         <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">My Assigned Tasks</h3>
            <div className="divide-y divide-gray-200">
                {tasks.map(task => (
                    <div key={task.id} className="py-3">
                        <p className="font-semibold">{task.name}</p>
                        <p className="text-sm text-gray-500">{getProjectName(task.projectId)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const Project = ({ project, allPeople, onUpdate }) => {
    const [newTaskName, setNewTaskName] = useState('');

    const handleAddTask = () => {
        if (!newTaskName.trim()) return;
        onUpdate({
            type: 'ADD_TASK',
            task: {
                projectId: project.id,
                name: newTaskName,
                status: 'To Do',
                assigneeId: null,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                comments: []
            }
        });
        setNewTaskName('');
    };

    return (
        <div className="bg-gray-50 p-4 rounded-md">
            <h5 className="font-bold text-indigo-800">{project.name}</h5>
            <div className="mt-4 space-y-2">
                 {project.tasks.map(task => (
                    <TaskItem key={task.id} task={task} allPeople={allPeople} onUpdate={onUpdate} />
                ))}
            </div>
            <div className="flex gap-2 mt-4">
                <input 
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow p-2 border rounded-md text-sm"
                />
                <button onClick={handleAddTask} className="px-3 py-1 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Task
                </button>
            </div>
        </div>
    );
};

const TaskItem = ({ task, allPeople, onUpdate }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const assignee = allPeople.find(p => p.id === task.assigneeId);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        onUpdate({ type: 'ADD_COMMENT', taskId: task.id, commentText: newComment, author: 'User' });
        setNewComment('');
    };

    const handleAssigneeChange = (e) => {
        onUpdate({ type: 'UPDATE_TASK_ASSIGNEE', taskId: task.id, assigneeId: e.target.value });
    };

    return (
        <div className="py-2">
            <div className="flex items-center">
                <div className="flex-grow">
                    <p className="font-semibold">{task.name}</p>
                    <div className="text-xs text-gray-500 flex items-center gap-3 mt-1">
                        <span>Status: {task.status}</span>
                        <select value={task.assigneeId || ''} onChange={handleAssigneeChange} className="text-xs bg-transparent border-none p-0 focus:ring-0">
                            <option value="">Unassigned</option>
                            {allPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <span>Dates: {formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                    </div>
                </div>
                <button onClick={() => setShowComments(!showComments)} className="p-2 text-gray-500 hover:text-purple-600">
                    <MessageSquareIcon className="h-5 w-5" />
                </button>
            </div>
            {showComments && (
                <div className="mt-2 pl-6">
                    <div className="space-y-2">
                        {(task.comments || []).map((comment, i) => (
                            <div key={i} className="text-sm">
                                <span className="font-bold">{comment.author}: </span>
                                <span>{comment.text}</span>
                            </div>
                        ))}
                         <div className="flex gap-2 pt-2">
                            <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-grow p-1 border rounded-md text-sm"
                            />
                            <button onClick={handleAddComment} className="px-3 py-1 text-sm font-semibold rounded-md bg-gray-200 hover:bg-gray-300">Post</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

