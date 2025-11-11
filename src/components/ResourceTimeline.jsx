import React, { useMemo, useState } from 'react';

// --- Date Helper Functions (copied from GlobalResourceView) ---
const parseDate = (dateString) => new Date(dateString + 'T00:00:00');

const diffInDays = (dateA, dateB) => {
    return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
};

const addDays = (date, days) => {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

const getStartOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const addWeeks = (date, weeks) => {
    return addDays(date, weeks * 7);
};

const formatHeader = (date, granularity) => {
    if (granularity === 'day') {
        return (
            <>
                <div className="text-xs font-medium text-gray-500">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                <div className="text-sm font-bold text-gray-800">{date.getDate()}</div>
            </>
        );
    }
    if (granularity === 'week') {
        const endDate = addDays(date, 6);
        return (
            <>
                <div className="text-xs font-medium text-gray-500">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                <div className="text-sm font-bold text-gray-800">{date.getDate()} - {endDate.getDate()}</div>
            </>
        );
    }
    if (granularity === 'month') {
        return (
            <div className="text-sm font-bold text-gray-800 pt-2">{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        );
    }
};

const useTimeline = (tasks, granularity) => {
    return useMemo(() => {
        if (!tasks || tasks.length === 0) {
            const minDate = getStartOfWeek(addDays(new Date(), -7));
            const maxDate = getStartOfWeek(addDays(new Date(), 28));
            return { minDate, maxDate, dateArray: [], totalDuration: 35 };
        }

        const startDates = tasks.map(t => parseDate(t.startDate));
        const endDates = tasks.map(t => parseDate(t.endDate));
        let minDate = new Date(Math.min(...startDates));
        let maxDate = new Date(Math.max(...endDates));

        let dateArray = [];
        let totalDuration = 0;
        let getUnit, addUnit;

        if (granularity === 'day') {
            minDate = addDays(minDate, -2);
            maxDate = addDays(maxDate, 2);
            totalDuration = diffInDays(minDate, maxDate) + 1;
            getUnit = (date) => date;
            addUnit = (date, i) => addDays(date, i);
        } else if (granularity === 'week') {
            minDate = getStartOfWeek(minDate);
            maxDate = getStartOfWeek(maxDate);
            totalDuration = Math.ceil(diffInDays(minDate, maxDate) / 7) + 1;
            getUnit = (date) => getStartOfWeek(date);
            addUnit = (date, i) => addWeeks(date, i);
        } else { // month
            minDate = getStartOfMonth(minDate);
            maxDate = getStartOfMonth(maxDate);
            totalDuration = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
            getUnit = (date) => getStartOfMonth(date);
            addUnit = (date, i) => addMonths(date, i);
        }

        for (let i = 0; i < totalDuration; i++) {
            dateArray.push(addUnit(minDate, i));
        }
        
        const realMaxDate = addUnit(minDate, totalDuration);

        return { minDate, maxDate: realMaxDate, dateArray, totalDuration, getUnit };

    }, [tasks, granularity]);
};


// --- Main Timeline Component ---
export const ResourceTimeline = ({ tasks, allPeople, onUpdate }) => {
    const [granularity, setGranularity] = useState('day'); // 'day', 'week', 'month'
    const { minDate, maxDate, dateArray, totalDuration, getUnit } = useTimeline(tasks, granularity);

    const projectTeam = useMemo(() => {
        const assignedIds = new Set(tasks.map(t => t.assigneeId));
        return allPeople.filter(p => assignedIds.has(p.id));
    }, [tasks, allPeople]);

    if (!tasks || tasks.length === 0) {
        return <div className="text-center p-8 text-gray-500">No tasks with assigned people to display in timeline.</div>;
    }
    
    const getPosition = (taskStart, taskEnd) => {
        const unitWidth = granularity === 'day' ? 40 : (granularity === 'week' ? 100 : 200);
        let diffFn;

        if (granularity === 'day') {
            diffFn = (a, b) => diffInDays(a, b);
        } else if (granularity === 'week') {
            diffFn = (a, b) => diffInDays(a, b) / 7;
        } else { // month
            diffFn = (a, b) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
        }

        const start = getUnit(parseDate(taskStart));
        const end = getUnit(parseDate(taskEnd));
        
        const left = Math.max(0, diffFn(minDate, start)) * unitWidth;
        const width = Math.max(1, diffFn(start, addDays(parseDate(taskEnd), 1))) * unitWidth - 4; // +1 to include end day, -4 padding

        return { left, width };
    };
    
    const unitWidth = granularity === 'day' ? 40 : (granularity === 'week' ? 100 : 200);
    const totalWidth = totalDuration * unitWidth;

    return (
        <div className="w-full bg-gray-50 rounded-lg border">
            {/* --- Toggle Header --- */}
            <div className="p-2 flex justify-end">
                <div className="flex items-center space-x-1 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setGranularity('day')} className={`px-3 py-1 text-sm font-semibold rounded-md ${granularity === 'day' ? 'bg-white text-purple-700 shadow' : 'text-gray-600'}`}>Day</button>
                    <button onClick={() => setGranularity('week')} className={`px-3 py-1 text-sm font-semibold rounded-md ${granularity === 'week' ? 'bg-white text-purple-700 shadow' : 'text-gray-600'}`}>Week</button>
                    <button onClick={() => setGranularity('month')} className={`px-3 py-1 text-sm font-semibold rounded-md ${granularity === 'month' ? 'bg-white text-purple-700 shadow' : 'text-gray-600'}`}>Month</button>
                </div>
            </div>
            
            <div className="w-full overflow-x-auto p-4">
                <div style={{ minWidth: `${totalWidth}px` }}>
                    
                    {/* --- Timeline Header (Dates) --- */}
                    <div className="flex sticky top-0 bg-gray-100 z-10 border-b-2 border-gray-300">
                        <div className="w-48 flex-shrink-0 p-2 font-semibold text-gray-700 border-r">Team Member</div>
                        {dateArray.map(date => (
                            <div key={date.toISOString()} className="flex-shrink-0 text-center border-r" style={{ width: `${unitWidth}px` }}>
                                {formatHeader(date, granularity)}
                            </div>
                        ))}
                    </div>

                    {/* --- Timeline Body (People & Tasks) --- */}
                    <div className="divide-y divide-gray-200">
                        {projectTeam.map(person => {
                            const personTasks = tasks.filter(t => t.assigneeId === person.id);
                            
                            return (
                                <div key={person.id} className="flex">
                                    <div className="w-48 flex-shrink-0 p-3 font-semibold text-gray-800 border-r sticky left-0 bg-white">
                                        {person.name}
                                    </div>
                                    <div className="flex-grow relative h-12 border-r" style={{ width: `${totalWidth}px` }}>
                                        {personTasks.map(task => {
                                            const { left, width } = getPosition(task.startDate, task.endDate);
                                            if (width < 0) return null;

                                            return (
                                                <div
                                                    key={task.id}
                                                    className="absolute top-2 h-8 bg-purple-600 text-white rounded shadow-sm flex items-center px-2 cursor-pointer hover:bg-purple-800 transition-colors"
                                                    style={{ left: `${left}px`, width: `${width}px` }}
                                                    title={`${task.name} (${parseDate(task.startDate).toLocaleDateString()} - ${parseDate(task.endDate).toLocaleDateString()})`}
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
        </div>
    );
};