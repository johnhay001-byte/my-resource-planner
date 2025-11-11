import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './Icons';

export const TaskModal = ({ isOpen, onClose, onSave, taskData, allPeople, projects, isSaving }) => {
    const [task, setTask] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (taskData) {
                setTask(taskData);
            } else {
                // Default for a new task
                setTask({
                    name: '',
                    status: 'To Do',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    projectId: '', // Default no project
                    assigneeId: null,
                });
            }
        }
    }, [taskData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(task);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast">
                <h2 className="text-2xl font-bold mb-6">{taskData ? 'Edit Task' : 'Add New Task'}</h2>
                <div className="space-y-4">
                    
                    {/* Project Selector (Show if adding new task, or read-only if editing) */}
                    {taskData ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Project</label>
                            <input 
                                type="text"
                                value={projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}
                                disabled
                                className="w-full p-2 border rounded-md bg-gray-100"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Project</label>
                            <select name="projectId" value={task.projectId || ''} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50">
                                <option value="">Select a project...</option>
                                {projects.filter(p => p.status !== 'Pending').map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}

                    <input type="text" name="name" value={task.name || ''} onChange={handleChange} placeholder="Task Name" className="w-full p-2 border rounded-md" />
                    <textarea name="brief" value={task.brief || ''} onChange={handleChange} placeholder="Task Description" className="w-full p-2 border rounded-md" rows="3"></textarea>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" name="startDate" value={task.startDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" name="endDate" value={task.endDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assignee</label>
                         <select name="assigneeId" value={task.assigneeId || ''} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="">Unassigned</option>
                            {allPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" value={task.status || 'To Do'} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50">
                            <option>To Do</option>
                            <option>In Progress</option>
                            <option>Blocked</option>
                            <option>Complete</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSaving ? <SpinnerIcon className="h-5 w-5 mr-2" /> : null}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};