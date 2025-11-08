import React, { useState, useMemo } from 'react';
// Added PlusIcon back for the "New Task" button
import { PlusIcon, MessageSquareIcon, EditIcon, BriefcaseIcon, UserCheckIcon } from './Icons';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- MAIN WORK HUB COMPONENT ---
// Add currentUser as a prop
export const WorkHub = ({ clients, programs, projects, tasks, allPeople, onUpdate, currentUser }) => {
    const [hubView, setHubView] = useState('allProjects'); // 'allProjects' or 'myTasks'
    
    // ▼▼▼ DYNAMIC USER LOGIC ▼▼▼
    // Find the user's profile from the 'people' list by matching the logged-in user's email
    const currentUserProfile = useMemo(() => {
        if (!currentUser) return null; // No one is logged in
        // We link the Firebase Auth user (currentUser) to our app's user data (allPeople) via their email
        return allPeople.find(p => p.email === currentUser.email); 
    }, [allPeople, currentUser]);

    // This logic now uses the dynamic currentUserProfile
    const myTasks = useMemo(() => {
        if (!currentUserProfile) return []; // No matching profile found in 'people' collection
        return tasks.filter(t => t.assigneeId === currentUserProfile.id);
    }, [tasks, currentUserProfile]);
    // ▲▲▲ END DYNAMIC USER LOGIC ▲▲▲

    const projectsWithTasks = useMemo(() => {
        return projects.map(project => ({
            ...project,
            tasks: tasks.filter(t => t.projectId === project.id)
        }));
    }, [projects, tasks]);

    const renderAllProjects = () => (
        <div className="space-y-6">
            {projectsWithTasks.map(project => (
                <ProjectCard key={project.id} project={project} allPeople={allPeople} onUpdate={onUpdate} />
            ))}
        </div>
    );

    const renderMyTasks = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header is now dynamic */}
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
                        {currentUserProfile ? 'You have no tasks assigned.' : 'Could not find your user profile. Make sure your login email matches a user in the Team list.'}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Work Hub</h2>
                {/* Button bar on the right */}
                <div className="flex items-center space-x-4">
                    {/* View toggles */}
                    <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                        <button onClick={() => setHubView('allProjects')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'allProjects' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                            <BriefcaseIcon className="h-5 w-5 mr-2" /> All Projects
                        </button>
                        <button onClick={() => setHubView('myTasks')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'myTasks' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                            <UserCheckIcon className="h-5 w-5 mr-2" /> My Tasks
                        </button>
                    </div>
                    {/* "New Task" button (from our last fix) */}
                    <button 
                        onClick={() => onUpdate({ type: 'ADD_TASK' })} 
                        className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" /> New Task
                    </button>
                </div>
            </div>

            {/* Render the selected view */}
            {hubView === 'allProjects' ? renderAllProjects() : renderMyTasks()}
        </div>
    );
};

// --- PROJECT CARD COMPONENT (for All Projects view) ---
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

// --- TASK ITEM COMPONENT (used by both views) ---
const TaskItem = ({ task, allPeople, onUpdate, showProject }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const assignee = allPeople.find(p => p.id === task.assigneeId);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        // Pass all necessary info for the comment update
        onUpdate({ type: 'ADD_COMMENT', taskId: task.id, commentText: newComment, author: 'User' }); // Assuming 'User' for now
        setNewComment('');
    };
    
    // Color-coding for task status
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
                            {/* Initials */}
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
            {/* Comments section */}
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