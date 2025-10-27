import React, { useState, useEffect } from 'react';

// Make sure SpinnerIcon is imported if you add saving state later
// import { SpinnerIcon } from './Icons'; 

export const TaskModal = ({ isOpen, onClose, onSave, taskData, allPeople, projects, isSaving }) => { // Add projects prop
    const [task, setTask] = useState({});
    const [errorMessage, setErrorMessage] = useState(''); // State for validation errors

    useEffect(() => {
        setErrorMessage(''); // Clear errors when modal opens or taskData changes
        if (isOpen) {
            if (taskData) {
                // Editing existing task
                setTask(taskData);
            } else {
                // Adding new task - set defaults
                setTask({
                    name: '',
                    projectId: '', // Default projectId to empty
                    status: 'To Do',
                    assigneeId: null, // Default assignee
                    startDate: new Date().toISOString().split('T')[0], // Default dates
                    endDate: new Date().toISOString().split('T')[0],
                    comments: []
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
        setErrorMessage(''); // Clear previous errors
        // Basic Validation
        if (!task.name.trim()) {
            setErrorMessage('Task Name cannot be empty.');
            return;
        }
        if (!taskData && !task.projectId) { // Only require project for NEW tasks
             setErrorMessage('Please select a project for the new task.');
             return;
        }
        // Add more validation as needed (e.g., dates)

        onSave(task); // Proceed to save if validation passes
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast">
                 {/* Title changes based on add/edit mode */}
                <h2 className="text-2xl font-bold mb-6">{taskData ? 'Edit Task' : 'Add New Task'}</h2>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        name="name" 
                        value={task.name || ''} 
                        onChange={handleChange} 
                        placeholder="Task Name" 
                        className="w-full p-2 border rounded-md" 
                    />
                    {/* ▼▼▼ ADD PROJECT DROPDOWN (only for NEW tasks) ▼▼▼ */}
                    {!taskData && ( 
                        <select 
                            name="projectId" 
                            value={task.projectId || ''} 
                            onChange={handleChange} 
                            className="w-full p-2 border rounded-md bg-gray-50"
                        >
                            <option value="">Select Project...</option>
                            {(projects || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    )}
                     {/* ▲▲▲ END PROJECT DROPDOWN ▲▲▲ */}
                    <textarea 
                        name="brief" 
                        value={task.brief || ''} 
                        onChange={handleChange} 
                        placeholder="Task Description (Optional)" 
                        className="w-full p-2 border rounded-md" 
                        rows="3"
                    ></textarea>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="text-xs text-gray-500">Start Date</label>
                             <input type="date" name="startDate" value={task.startDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                         <div>
                             <label className="text-xs text-gray-500">End Date</label>
                            <input type="date" name="endDate" value={task.endDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                     <select 
                        name="assigneeId" 
                        value={task.assigneeId || ''} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option value="">Unassigned</option>
                        {(allPeople || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select 
                        name="status" 
                        value={task.status || 'To Do'} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded-md bg-gray-50"
                    >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                    </select>
                     {/* Display validation error message */}
                     {errorMessage && (
                        <div className="text-center p-3 bg-red-100 text-red-800 rounded-md text-sm">
                            {errorMessage}
                        </div>
                    )}
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving} 
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {/* Add spinner icon if isSaving is true */}
                        {/* {isSaving ? <SpinnerIcon className="h-5 w-5 mr-2" /> : null} */}
                        {isSaving ? 'Saving...' : (taskData ? 'Save Changes' : 'Add Task')} 
                    </button>
                </div>
            </div>
        </div>
    );
};

