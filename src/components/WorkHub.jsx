import React, { useState, useMemo } from 'react';
import { PlusIcon, MessageSquareIcon, EditIcon, BriefcaseIcon, UserCheckIcon, SearchIcon, CheckCircleIcon } from './Icons'; // Add CheckCircleIcon

const formatDate = (dateString) => {
    // ... (no change)
};

// --- MAIN WORK HUB COMPONENT ---
export const WorkHub = ({ clients, programs, projects, tasks, allPeople, onUpdate, currentUser }) => {
    // ▼▼▼ Add 'triage' view ▼▼▼
    const [hubView, setHubView] = useState('triage'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const currentUserProfile = useMemo(() => {
        // ... (no change)
    }, [allPeople, currentUser]);

    const myTasks = useMemo(() => {
        // ... (no change)
    }, [tasks, currentUserProfile, searchTerm, statusFilter]);
    
    // ▼▼▼ NEW: Filter for 'Pending' projects ▼▼▼
    const pendingProjects = useMemo(() => {
        return projects.filter(p => p.status === 'Pending');
    }, [projects]);
    
    const projectsWithTasks = useMemo(() => {
        // ▼▼▼ Filter out 'Pending' projects from the main list ▼▼▼
        return projects
            .filter(p => p.status !== 'Pending') 
            .map(project => ({
                ...project,
                tasks: tasks.filter(t => t.projectId === project.id)
            }));
    }, [projects, tasks]);

    const displayedProjects = useMemo(() => {
        // ... (no change to this function's logic)
    }, [projectsWithTasks, searchTerm, statusFilter]);

    // --- RENDER FUNCTIONS ---

    const renderAllProjects = () => (
        // ... (no change)
    );

    const renderMyTasks = () => (
        // ... (no change)
    );

    // ▼▼▼ NEW: Render function for Triage Queue ▼▼▼
    const renderTriageQueue = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Project Triage Queue</h3>
            <div className="space-y-3">
                {pendingProjects.length > 0 ? (
                    pendingProjects.map(project => (
                        <TriageItem 
                            key={project.id} 
                            project={project} 
                            onUpdate={onUpdate}
                            // We need to open the ProjectHub, which is handled in App.jsx
                            // So we'll pass an action to App.jsx to handle
                            onOpenProject={() => onUpdate({ type: 'OPEN_PROJECT', project: project })}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-10">
                        No projects are pending review.
                    </p>
                )}
            </div>
        </div>
    );
    // ▲▲▲ END NEW RENDER FUNCTION ▲▲▲

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Work Hub</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                        {/* ▼▼▼ ADD TRIAGE BUTTON ▼▼▼ */}
                        <button onClick={() => setHubView('triage')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'triage' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                            <CheckCircleIcon className="h-5 w-5 mr-2" /> Triage Queue
                            {pendingProjects.length > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {pendingProjects.length}
                                </span>
                            )}
                        </button>
                        <button onClick={() => setHubView('allProjects')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'allProjects' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                            <BriefcaseIcon className="h-5 w-5 mr-2" /> All Projects
                        </button>
                        <button onClick={() => setHubView('myTasks')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'myTasks' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                            <UserCheckIcon className="h-5 w-5 mr-2" /> My Tasks
                        </button>
                    </div>
                    {/* This button now only opens the TASK modal */}
                    <button 
                        onClick={() => onUpdate({ type: 'ADD_TASK' })} 
                        className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" /> New Task
                    </button>
                </div>
            </div>

            {/* Filter and Search Controls */}
            {hubView !== 'triage' && ( // Hide filters on Triage view
                <div className="mb-6 flex items-center gap-4">
                    {/* ... (filter/search controls remain unchanged) ... */}
                </div>
            )}

            {/* ▼▼▼ UPDATE VIEW RENDERER ▼▼▼ */}
            {hubView === 'allProjects' ? renderAllProjects() 
             : hubView === 'myTasks' ? renderMyTasks()
             : renderTriageQueue() 
            }
        </div>
    );
};

// --- PROJECT CARD COMPONENT ---
const ProjectCard = ({ project, allPeople, onUpdate }) => {
    // ... (no change)
};

// --- TASK ITEM COMPONENT ---
const TaskItem = ({ task, allPeople, onUpdate, showProject }) => {
    // ... (no change)
};

// ▼▼▼ NEW: TRIAGE ITEM COMPONENT ▼▼▼
const TriageItem = ({ project, onOpenProject }) => {
    return (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-md">{project.brief || 'No brief provided.'}</p>
                </div>
                <button 
                    onClick={onOpenProject} 
                    className="px-3 py-1.5 text-sm font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700"
                >
                    Review
                </button>
            </div>
        </div>
    );
};