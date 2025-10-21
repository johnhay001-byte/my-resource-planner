import React, { useMemo } from 'react';
import { MailIcon } from './Icons';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

// Helper to get the start and end of the current week (Monday to Sunday)
const getWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); 
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { start: startOfWeek, end: endOfWeek };
};

export const PersonDetailCard = ({ person, onClose, projectMap, tasks }) => {
    if (!person) return null;

    const { weeklyHours, utilizationPercentage } = useMemo(() => {
        const { start, end } = getWeekRange();
        const weeklyTasks = (tasks || []).filter(t => {
            if (!t.startDate) return false;
            const taskStartDate = new Date(t.startDate + 'T00:00:00');
            return t.assigneeId === person.id && taskStartDate >= start && taskStartDate <= end;
        });
        const totalHours = weeklyTasks.reduce((sum, task) => sum + (Number(task.estimatedHours) || 0), 0);
        return { weeklyHours: totalHours, utilizationPercentage: Math.min((totalHours / 40) * 100, 100) };
    }, [tasks, person.id]);

    const personAssignments = useMemo(() => {
        return (tasks || [])
            .filter(t => t.assigneeId === person.id)
            .map(t => {
                const project = projectMap.get(t.projectId);
                return {
                    ...t,
                    projectName: project ? project.name : 'Unknown Project',
                };
            });
    }, [tasks, person.id, projectMap]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                <h2 className="text-3xl font-bold">{person.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{person.role}</p>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">This Week's Utilization</h3>
                    <div className="bg-gray-200 rounded-full h-4">
                        <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${utilizationPercentage}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{weeklyHours} / 40 hours assigned</p>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Current Assignments</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {personAssignments.length > 0 ? personAssignments.map((ass, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-md">
                                <p className="font-medium">{ass.projectName}: {ass.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(ass.startDate)} - {formatDate(ass.endDate)}</p>
                            </div>
                        )) : <p className="text-sm text-gray-500">No active assignments.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

