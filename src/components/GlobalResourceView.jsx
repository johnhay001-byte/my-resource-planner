import React, { useMemo } from 'react';

// --- Date Helper Functions (copied from ResourceTimeline) ---
const parseDate = (dateString) => new Date(dateString + 'T00:00:00');

const diffInDays = (dateA, dateB) => {
    return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
};

const addDays = (date, days) => {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

// --- Main Global Timeline Component ---
export const GlobalResourceView = ({ allPeople, allTasks }) => {

    const { minDate, maxDate, totalDuration, dateArray } = useMemo(() => {
        if (!allTasks || allTasks.length === 0) {
            const today = new Date();
            return { minDate: today, maxDate: today, totalDuration: 1, dateArray: [today] };
        }

        // Find the entire date range of all tasks in the system
        const startDates = allTasks.map(t => parseDate(t.startDate));
        const endDates = allTasks.map(t => parseDate(t.endDate));
        const minDate = new Date(Math.min(...startDates));
        const maxDate = new Date(Math.max(...endDates));
        
        const totalDuration = diffInDays(minDate, maxDate) + 1;

        const dateArray = [];
        for (let i = 0; i < totalDuration; i++) {
            dateArray.push(addDays(minDate, i));
        }
        
        return { minDate, maxDate, totalDuration, dateArray };

    }, [allTasks]);

    // We show all people, regardless of task assignment
    const sortedPeople = useMemo(() => {
        return [...allPeople].sort((a, b) => a.name.localeCompare(b.name));
    }, [allPeople]);

    return (
        <div className="w-full overflow-x-auto p-4 bg-white rounded-lg border shadow-md">
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
                    {sortedPeople.map(person => {
                        const personTasks = allTasks.filter(t => t.assigneeId === person.id);
                        
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

                                        return (
                                            <div
                                                key={task.id}
                                                className="absolute top-2 h-8 bg-purple-600 text-white rounded shadow-sm flex items-center px-2 cursor-pointer"
                                                style={{ left: `${left}px`, width: `${width}px` }}
                                                title={`${task.name} (${taskStart.toLocaleDateString()} - ${taskEnd.toLocaleDateString()})`}
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