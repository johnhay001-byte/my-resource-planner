import React, { useState, useMemo } from 'react';
import { PlusIcon, MessageSquareIcon, EditIcon, BriefcaseIcon, UserCheckIcon, SearchIcon, CheckCircleIcon, UsersIcon } from './Icons'; // Import UsersIcon

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric' });
};

// --- MAIN WORK HUB COMPONENT ---
export const WorkHub = ({ clients, programs, projects, tasks, allPeople, groups, onUpdate, currentUser }) => { // Add groups
    const [hubView, setHubView] = useState('triage'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const currentUserProfile = useMemo(() => {
        if (!currentUser) return null;
        return allPeople.find(p => p.email === currentUser.email);
    }, [allPeople, currentUser]);

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
    
    const projectsWithTasks = useMemo(() => {
        return projects.map(project => ({
            ...project,
            tasks: tasks.filter(t => t.projectId === project.id)
        }));
    }, [projects, tasks]);

    const { pendingProjects, activeProjects } = useMemo(() => {
        const pending = [];
        const active = [];
        projectsWithTasks.forEach(p => {
            if (p.status === 'Pending') {
                pending.push(p);
            } else {
                active.push(p);
            }
        });
        return { pendingProjects: pending, activeProjects: active };
    }, [projectsWithTasks]);


    const displayedProjects = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();

        const projectsWithFilteredTasks = activeProjects.map(project => ({
            ...project,
            tasks: project.tasks.filter(task => {
                const searchMatch = !searchTerm || task.name.toLowerCase().includes(lowercasedSearchTerm);
                const statusMatch = statusFilter === 'All' || task.status === statusFilter;
                return searchMatch && statusMatch;
            })
        }));

        return projectsWithFilteredTasks.filter(project => {
            const projectNameMatch = !searchTerm || project.name.toLowerCase().includes(lowercasedSearchTerm);
            return projectNameMatch || project.tasks.length > 0;
        });
    }, [activeProjects, searchTerm, statusFilter]);

    // --- RENDER FUNCTIONS FOR TABS ---

    const renderTriageQueue = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Project Triage Queue</h3>
            <p className="text-gray-600 mb-6">Review and approve new project requests submitted by the team.</p>
            <div className="space-y-3">
                {pendingProjects.length > 0 ? (
                    pendingProjects.map(project => (
                        <TriageItem 
                            key={project.id} 
                            project={project} 
                            onUpdate={onUpdate} 
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">The triage queue is empty.</p>
                )}
            </div>
        </div>
    );

    const renderAllProjects = () => (
        <div className="space-y-6">
            {displayedProjects.map(project => (
                <ProjectCard key={project.id} project={project} allPeople={allPeople} allGroups={groups} onUpdate={onUpdate} /> 
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
                {myTasks.map(task => (
                    <TaskItem key={task.id} task={task} allPeople={allPeople} allGroups={groups} onUpdate={onUpdate} showProject />
                ))}
                {myTasks.length === 0 && <p className="text-center text-gray-500 py-10">
                    {currentUserProfile ? 'You have no tasks matching the current filters.' : 'Could not find your user profile. Make sure your login email matches a user in the Team list.'}
                </p>}
            </div>
        </div>
    );

    const renderCurrentView = () => {
        switch(hubView) {
            case 'triage':
                return renderTriageQueue();
            case 'allProjects':
                return renderAllProjects();
            case 'myTasks':
                return renderMyTasks();
            default:
                return renderTriageQueue();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Work Hub</h2>
                    <p className="text-gray-600">A central place to view all ongoing work.</p>
                </div>
                 <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setHubView('triage')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'triage' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                        <CheckCircleIcon className="h-5 w-5 mr-2" /> Triage Queue
                    </button>
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
                    title="Add a new task"
                >
                    <PlusIcon className="h-4 w-4 mr-2" /> New Task
                </button>
            </div>

            {/* Filter and Search Controls (Hidden on Triage) */}
            {hubView !== 'triage' && (
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
                        {['All', 'To Do', 'In Progress', 'Blocked', 'Complete'].map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 text-sm font-semibold rounded-md ${statusFilter === status ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {renderCurrentView()}
        </div>
    );
};

// --- SUB-COMPONENTS ---

const TriageItem = ({ project, onUpdate }) => {
    return (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-between">
            <div>
                <p className="font-semibold text-lg">{project.name}</p>
                <p className="text-sm text-gray-600 mt-1 truncate">{project.brief || "No brief provided."}</p>
            </div>
            <button 
                onClick={() => onUpdate({ type: 'OPEN_PROJECT', project: project })}
                className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700"
            >
                Review
            </button>
        </div>
    );
};

const ProjectCard = ({ project, allPeople, allGroups, onUpdate }) => { // Add allGroups
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">{project.name}</h3>
            <div className="space-y-3">
                {project.tasks.map(task => (
                    <TaskItem key={task.id} task={task} allPeople={allPeople} allGroups={allGroups} onUpdate={onUpdate} /> // Pass allGroups
                ))}
                {project.tasks.length === 0 && <p className="text-sm text-gray-500">No tasks match the current filters.</p>}
            </div>
        </div>
    );
};

const TaskItem = ({ task, allPeople, allGroups, onUpdate, showProject }) => { // Add allGroups
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    
    // Find either the person or the group
    const assignee = allPeople.find(p => p.id === task.assigneeId);
    const assigneeGroup = allGroups.find(g => g.id === task.assigneeGroupId);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        onUpdate({ type: 'ADD_COMMENT', taskId: task.id, commentText: newComment, author: 'User' });
        setNewComment('');
    };
    
    const statusColors = { 
        'To Do': 'bg-gray-200', 
        'In Progress': 'bg-blue-200', 
        'Blocked': 'bg-red-200',
        'Complete': 'bg-green-200' 
    };
    
    // --- Assignee Display Logic ---
    const renderAssignee = () => {
        if (assignee) {
            // Person is assigned
            return (
                <span title={assignee.name} className="flex items-center h-8 w-8 justify-center bg-gray-200 rounded-full font-bold text-purple-800 text-sm">
                    {assignee.name.split(' ').map(n => n[0]).join('')}
                </span>
            );
        }
        if (assigneeGroup) {
            // Group is assigned
            return (
                <span title={assigneeGroup.name} className="flex items-center h-8 w-8 justify-center bg-blue-200 rounded-full font-bold text-blue-800 text-sm">
                    <UsersIcon className="h-4 w-4" />
                </span>
            );
        }
        // Unassigned
        return null;
    };

    return (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{task.name}</p>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[task.status]}`}>{task.status}</span>
                        <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    {renderAssignee()}
                    <button onClick={() => onUpdate({ type: 'EDIT_TASK', task: task })} className="p-2 text-gray-500 hover:text-purple-600 ml-2">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="p-2 text-gray-500 hover:text-purple-600">
                        <MessageSquareIcon className="h-5 w-5" />
                    </button>
                </div>
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