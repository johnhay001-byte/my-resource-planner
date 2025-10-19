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


export const PersonDetailCard = ({ person, onClose, projectMap, tasks }) => {
    if (!person) return null;

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
                <div className="flex items-center text-gray-700 mb-4"><MailIcon className="h-5 w-5 mr-3" /><a href={`mailto:${person.email}`} className="hover:underline">{person.email}</a></div>
                
                 <div className="mb-6"><h3 className="font-semibold text-gray-700 mb-2">Financials</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                        <div>
                            <p className="text-sm text-gray-500">Monthly Cost</p>
                            <p className="text-lg font-semibold">{formatCurrency(person.totalMonthlyCost)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Billable Rate</p>
                            <p className="text-lg font-semibold">{formatCurrency(person.billableRatePerHour)}/hr</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Current Assignments</h3>
                    <div className="space-y-3">
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

