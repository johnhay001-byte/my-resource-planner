import React, { useMemo } from 'react';

// --- Date Helper Functions ---
const parseDate = (dateString) => new Date(dateString + 'T00:00:00'); // Ensure consistent date parsing

const diffInDays = (dateA, dateB) => {
    return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
};

const addDays = (date, days) => {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

// --- Main Timeline Component ---
// ▼▼▼ ADD onUpdate PROP ▼▼▼
export const ResourceTimeline = ({ tasks, allPeople, onUpdate }) => {

    const { projectTeam, minDate, maxDate, totalDuration, dateArray } = useMemo(() => {
        if (!tasks || tasks.length === 0) {
            const today = new Date();
            const weekAgo = addDays(today, -7);
            const inTwoWeeks = addDays(today, 14);
            const totalDuration = diffInDays(weekAgo, inTwoWeeks) + 1;
            const dateArray = [];
             for (let i = 0; i < totalDuration; i++) {
                dateArray.push(addDays(weekAgo, i));
            }
            return { projectTeam: [], minDate: weekAgo, maxDate: inTwoWeeks, totalDuration, dateArray };
        }

        // 1. Get all unique people assigned to these tasks
        const assignedIds = new Set(tasks.map(t => t.assigneeId));
        const projectTeam = allPeople.filter(p => assignedIds.has(p.id));

        // 2. Find the project's date range
        const startDates = tasks.map(t => parseDate(t.startDate));
        const endDates = tasks.map(t => parseDate(t.endDate));
        const minDate = new Date(Math.min(...startDates));
        const maxDate = new Date(Math.max(...endDates));
        
        // 3. Calculate total duration in days
        const totalDuration = diffInDays(minDate, maxDate) + 1; // +1 to include the last day

        // 4. Create an array of dates for the header
        const dateArray = [];
        for (let i = 0; i < totalDuration; i++) {
            dateArray.push(addDays(minDate, i));
        }
        
        return { projectTeam, minDate, maxDate, totalDuration, dateArray };

    }, [tasks, allPeople]);

    if (!tasks || tasks.length === 0) {
        return <div className="text-center p-8 text-gray-500">No tasks with assigned people to display in timeline.</div>;
    }

    return (
        <div className="w-full overflow-x-auto p-4 bg-gray-50 rounded-lg border">
            <div style={{ minWidth: `${totalDuration * 40}px` }}> {/* 40px per day */}
                
                {/* --- Timeline Header (Dates) --- */}
                <div className="flex sticky top-0 bg-gray-100 z-10 border-b-2 border-gray-300">
                    <div className="w-48 flex-shrink-0 p-2 font-semibold text-gray-700 border-r">Team Member</div>
                    {dateArray.map(date => (
                        <div key={date.toISOString()} className="w-10 flex-shrink-0 text-center border-r">
                            <div className="text-xs font-medium text-gray-500">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                            <div className="text-sm font-bold text-gray-800">{date.getDate()}</div>
                        </div>
                    ))}
                </div>

                {/* --- Timeline Body (People & Tasks) --- */}
                <div className="divide-y divide-gray-200">
                    {projectTeam.map(person => {
                        const personTasks = tasks.filter(t => t.assigneeId === person.id);
                        
                        return (
                            <div key={person.id} className="flex">
                                {/* Person Name Column */}
                                <div className="w-48 flex-shrink-0 p-3 font-semibold text-gray-800 border-r sticky left-0 bg-white">
                                    {person.name}
                                </div>
                                
                                {/* Task Timeline Column */}
                                <div className="flex-grow relative h-12 border-r" style={{ width: `${totalDuration * 40}px` }}>
                                    {personTasks.map(task => {
                                        const taskStart = parseDate(task.startDate);
                                        const taskEnd = parseDate(task.endDate);

                                        const left = diffInDays(minDate, taskStart) * 40; // 40px per day
                                        const width = (diffInDays(taskStart, taskEnd) + 1) * 40 - 4; // -4 for padding

                                        // Ensure task width is at least 0
                                        if (width < 0) return null;

                                        return (
                                            <div
                                                key={task.id}
                                                // ▼▼▼ ADD onClick AND hover effect ▼▼▼
                                                className="absolute top-2 h-8 bg-purple-600 text-white rounded shadow-sm flex items-center px-2 cursor-pointer hover:bg-purple-800 transition-colors"
                                                style={{ left: `${left}px`, width: `${width}px` }}
                                                title={`${task.name} (${taskStart.toLocaleDateString()} - ${taskEnd.toLocaleDateString()})`}
                                                onClick={() => onUpdate({ type: 'EDIT_TASK', task: task })}
                                            >
                                                <p className="text-xs font-semibold whitespace-nowrap overflow-hidden overflow-ellipsis">{task.name}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};