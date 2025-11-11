import React, { useMemo } from 'react';
import { MailIcon } from './Icons'; // Assuming MailIcon is in your Icons.jsx

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Add T00:00:00 to ensure date is parsed as local time, not UTC
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

// Helper to get the start and end of the current week (Monday to Sunday)
const getWeekRange = () => {
    const now = new Date();
    // Adjust to get Monday as start of week (getDay() returns 0 for Sun, 1 for Mon...)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); 
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return { start: startOfWeek, end: endOfWeek };
};

export const PersonDetailCard = ({ person, onClose, projectMap, tasks }) => {
    if (!person) return null;

    // Calculate weekly utilization
    const { weeklyHours, utilizationPercentage } = useMemo(() => {
        const { start, end } = getWeekRange();
        const weeklyTasks = (tasks || []).filter(t => {
            if (!t.startDate || !t.assigneeId) return false;
            const taskStartDate = new Date(t.startDate + 'T00:00:00');
            return t.assigneeId === person.id && taskStartDate >= start && taskStartDate <= end;
        });
        // Assuming 'estimatedHours' is a property on tasks. Defaulting to 0.
        const totalHours = weeklyTasks.reduce((sum, task) => sum + (Number(task.estimatedHours) || 0), 0);
        // Assuming a 40 hour week.
        const utilization = Math.min((totalHours / 40) * 100, 100); 
        return { weeklyHours: totalHours, utilizationPercentage: utilization };
    }, [tasks, person.id]);

    // Get all assignments for the person
    const personAssignments = useMemo(() => {
        return (tasks || [])
            .filter(t => t.assigneeId === person.id)
            .map(t => {
                const project = projectMap.get(t.projectId);
                return {
                    ...t,
                    projectName: project ? project.name : 'Unknown Project',
                };
            })
            // Optional: sort by start date
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }, [tasks, person.id, projectMap]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in-fast" 
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    &times;
                </button>
                
                {/* Header */}
                <h2 className="text-3xl font-bold">{person.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{person.role}</p>
                {person.email && (
                    <a href={`mailto:${person.email}`} className="text-sm text-purple-600 hover:text-purple-800 flex items-center mb-4">
                        <MailIcon className="h-4 w-4 mr-2" />
                        {person.email}
                    </a>
                )}
                
                {/* Utilization */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">This Week's Utilization</h3>
                    <div className="bg-gray-200 rounded-full h-4">
                        <div 
                            className="bg-purple-600 h-4 rounded-full transition-all duration-500" 
                            style={{ width: `${utilizationPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{weeklyHours} / 40 hours assigned this week</p>
                </div>
                
                {/* Assignments List */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Current Assignments</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {personAssignments.length > 0 ? personAssignments.map((task) => (
                            <div key={task.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                <p className="font-medium">{task.projectName}: {task.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(task.startDate)} - {formatDate(task.endDate)}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500">No active assignments found.</p>
                        )}
                    </div>
                </div>

                 {/* Financials */}
                 <div className="pt-4 border-t">
                    <h3 className="font-semibold text-gray-700 mb-2">Financials</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs font-medium text-gray-500">Monthly Cost</p>
                            <p className="text-lg font-semibold">{formatCurrency(person.totalMonthlyCost)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-xs font-medium text-gray-500">Billable Rate (p/hr)</p>
                            <p className="text-lg font-semibold">{formatCurrency(person.billableRatePerHour)}</p>
                        </div>
                     </div>
                </div>

            </div>
        </div>
    );
};