import React, { useState, useMemo } from 'react';
// Import SearchIcon (it was missing in your context file)
import { PlusIcon, MessageSquareIcon, EditIcon, BriefcaseIcon, UserCheckIcon, SearchIcon } from './Icons';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- MAIN WORK HUB COMPONENT ---
// Add currentUser as a prop
export const WorkHub = ({ clients, programs, projects, tasks, allPeople, onUpdate, currentUser }) => {
    const [hubView, setHubView] = useState('allProjects'); // 'allProjects' or 'myTasks'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // ▼▼▼ DYNAMIC USER LOGIC ▼▼▼
    const currentUserProfile = useMemo(() => {
        if (!currentUser) return null; // No one is logged in
        return allPeople.find(p => p.email === currentUser.email); 
    }, [allPeople, currentUser]);

    // This logic now uses the dynamic currentUserProfile and filters
    const myTasks = useMemo(() => {
        if (!currentUserProfile) return []; 
        
        let filtered = tasks.filter(t => t.assigneeId === currentUserProfile.id);
        
        if (statusFilter !== 'All') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return filtered;
    }, [tasks, currentUserProfile, searchTerm, statusFilter]);
    // ▲▲▲ END DYNAMIC USER LOGIC ▲▲▲

    const projectsWithTasks = useMemo(() => {
        return projects.map(project => ({
            ...project,
            tasks: tasks.filter(t => t.projectId === project.id)
        }));
    }, [projects, tasks]);

    // Filter projects and tasks based on search and status
    const displayedProjects = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();

        const projectsWithFilteredTasks = projectsWithTasks.map(project => ({
            ...project,
            tasks: project.tasks.filter(task => {
                const searchMatch = !searchTerm || task.name.toLowerCase().includes(lowercasedSearchTerm);
                const statusMatch = statusFilter === 'All' || task.status === statusFilter;
                return searchMatch && statusMatch;
            })
        }));

        // Show a project if its name matches OR it has tasks that match
        return projectsWithFilteredTasks.filter(project => {
            const projectNameMatch = !searchTerm || project.name.toLowerCase().includes(lowercasedSearchTerm);
            return projectNameMatch || project.tasks.length > 0;
        });

    }, [projectsWithTasks, searchTerm, statusFilter]);

    const renderAllProjects = () => (
        <div className="space-y-6">
            {displayedProjects.map(project => (
                <ProjectCard key={project.id} project={project} allPeople={allPeople} onUpdate={onUpdate} />
            ))}
            {displayedProjects.length === 0 && <p className="text-center text-gray-500 py-10">No projects or tasks match your filters.</p>}
        </div>
    );

    const renderMyTasks = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">
                Tasks for {currentUserProfile ? currentUserProfile.name : (currentUser?.email || 'Me')}
            </h3>
            <div className="space-y-3">
                {myTasks.length > 0 ? (
                    myTasks.map(task => (
                        <TaskItem key={task.id} task={task} allPeople={allPeople} onUpdate={onUpdate} showProject />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">
                        {currentUserProfile ? 'You have no tasks matching the current filters.' : 'Could not find your user profile. Make sure your login email matches a user in the Team list.'}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Work Hub</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                        <button onClick={() => setHubView('allProjects')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'allProjects' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                            <BriefcaseIcon className="h-5 w-5 mr-2" /> All Projects
                        </button>
                        <button onClick={() => setHubView('myTasks')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'myTasks' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                            <UserCheckIcon className="h-5 w-5 mr-2" /> My Tasks
                        </button>
                    </div>
                    <button 
                        onClick={() => onUpdate({ type: 'ADD_TASK' })} 
                        className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" /> New Task
                    </button>
                </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={hubView === 'allProjects' ? "Search projects or tasks..." : "Search my tasks..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 border rounded-md"
                    />
                </div>
                <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                    <span className="text-sm font-semibold text-gray-600 px-2">Status:</span>
                    {['All', 'To Do', 'In Progress', 'Done'].map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 text-sm font-semibold rounded-md ${statusFilter === status ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {hubView === 'allProjects' ? renderAllProjects() : renderMyTasks()}
        </div>
    );
};

// --- PROJECT CARD COMPONENT ---
const ProjectCard = ({ project, allPeople, onUpdate }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">{project.name}</h3>
            <div className="space-y-3">
                {project.tasks.length > 0 ? (
                    project.tasks.map(task => (
                        <TaskItem key={task.id} task={task} allPeople={allPeople} onUpdate={onUpdate} />
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No tasks for this project yet.</p>
                )}
            </div>
        </div>
    );
};

// --- TASK ITEM COMPONENT ---
const TaskItem = ({ task, allPeople, onUpdate, showProject }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const assignee = allPeople.find(p => p.id === task.assigneeId);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        onUpdate({ type: 'ADD_COMMENT', taskId: task.id, commentText: newComment, author: 'User' }); // Assuming 'User' for now
        setNewComment('');
    };
    
    const statusColors = {
        'To Do': 'bg-gray-200 text-gray-800',
        'In Progress': 'bg-blue-200 text-blue-800',
        'Done': 'bg-green-200 text-green-800',
    };

    return (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{task.name}</p>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[task.status] || 'bg-gray-200'}`}>
                            {task.status}
                        </span>
                        <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    {assignee && (
                        <span 
                            title={assignee.name} 
                            className="flex items-center justify-center h-8 w-8 bg-gray-200 rounded-full font-bold text-purple-800 text-sm"
                        >
                            {assignee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                    )}
                    <button onClick={() => onUpdate({ type: 'EDIT_TASK', task: task })} className="p-2 text-gray-500 hover:text-purple-600 ml-2">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="p-2 text-gray-500 hover:text-purple-600">
                        <MessageSquareIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            {showComments && (
                <div className="mt-4 pl-8 border-l-2 border-gray-200">
                    <h4 className="font-semibold mb-2">Comments</h4>
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
                                className="flex-grow p-2 border rounded-md text-sm"
                            />
                            <button onClick={handleAddComment} className="px-3 py-1 text-sm font-semibold rounded-md bg-gray-200 hover:bg-gray-300">Post</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};