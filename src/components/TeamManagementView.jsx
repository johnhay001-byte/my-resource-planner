import React, { useState, useMemo } from 'react';
import { ArrowUpDownIcon, TrashIcon, EditIcon, PlusIcon, UsersIcon } from './Icons';

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

export const TeamManagementView = ({ people, onPersonSelect, onUpdate }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const sortedPeople = useMemo(() => {
        let sortableItems = Array.isArray(people) ? [...people] : [];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = sortConfig.key === 'team' ? ((a.tags || []).find(t => t.type === 'Team')?.value || '') : a[sortConfig.key];
                const bVal = sortConfig.key === 'team' ? ((b.tags || []).find(t => t.type === 'Team')?.value || '') : b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [people, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getTeam = (person) => (person.tags || []).find(t => t.type === 'Team')?.value || 'N/A';
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-800 flex items-center"><UsersIcon className="h-6 w-6 mr-3" />Team Overview</h2>
                 <button onClick={() => onUpdate({ type: 'ADD_PERSON' })} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Resource
                </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['name', 'role', 'team', 'totalMonthlyCost', 'billableRatePerHour'].map(key => (
                                <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => requestSort(key)} className="flex items-center">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        <ArrowUpDownIcon className="h-4 w-4 ml-2 text-gray-400" />
                                    </button>
                                </th>
                            ))}
                             <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPeople.map((person) => (
                            <tr key={person.id}>
                                <td onClick={() => onPersonSelect(person.personId)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:underline">{person.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeam(person)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(person.totalMonthlyCost)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(person.billableRatePerHour)}/hr</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onUpdate({ type: 'EDIT_PERSON', person: person })} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => { if(window.confirm(`Are you sure you want to delete ${person.name}?`)) onUpdate({ type: 'DELETE_PERSON', personId: person.id }) }} className="text-red-600 hover:text-red-900">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

