import React, { useState, useMemo } from 'react';
import { PlusIcon, MessageSquareIcon, EditIcon, BriefcaseIcon, UserCheckIcon, SearchIcon } from './Icons';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleString('en-US', { month: 'short', day: 'numeric' });
};

export const WorkHub = ({ clients, programs, projects, tasks, allPeople, onUpdate, currentUser }) => {
    const [hubView, setHubView] = useState('allProjects');
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
                {myTasks.map(task => (
                    <TaskItem key={task.id} task={task} allPeople={allPeople} onUpdate={onUpdate} showProject />
                ))}
                {myTasks.length === 0 && <p className="text-center text-gray-500 py-10">
                    {currentUserProfile ? 'You have no tasks matching the current filters.' : 'Could not find your user profile. Make sure your login email matches a user in the Team list.'}
                </p>}
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Work Hub</h2>
                    <p className="text-gray-600">A central place to view all ongoing work.</p>
                </div>
                 <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setHubView('allProjects')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'allProjects' ? 'bg-white text-purple-700 shadow' : 'text-transparent text-gray-600'}`}>
                        <BriefcaseIcon className="h-5 w-5 mr-2" /> All Projects
                    </button>
                    <button onClick={() => setHubView('myTasks')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'myTasks' ? 'bg-white text-purple-700 shadow' : 'text-transparent text-gray-600'}`}>
                        <UserCheckIcon className="h-5 w-5 mr-2" /> My Tasks
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
                        onChange={(e) => setSearchTerm(e.g...

