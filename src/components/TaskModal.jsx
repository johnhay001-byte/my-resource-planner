import React, { useState, useEffect } from 'react';

export const TaskModal = ({ isOpen, onClose, onSave, taskData, allPeople }) => {
    const [task, setTask] = useState({});

    useEffect(() => {
        if (isOpen && taskData) {
            setTask(taskData);
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
                <h2 className="text-2xl font-bold mb-6">Edit Task</h2>
                <div className="space-y-4">
                    <input type="text" name="name" value={task.name || ''} onChange={handleChange} placeholder="Task Name" className="w-full p-2 border rounded-md" />
                    <textarea name="brief" value={task.brief || ''} onChange={handleChange} placeholder="Task Description" className="w-full p-2 border rounded-md" rows="3"></textarea>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" name="startDate" value={task.startDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        <input type="date" name="endDate" value={task.endDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                    </div>
                     <select name="assigneeId" value={task.assigneeId || ''} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50">
                        <option value="">Unassigned</option>
                        {allPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select name="status" value={task.status || 'To Do'} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50">
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                    </select>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-md">Save Changes</button>
                </div>
            </div>
        </div>
    );
};
