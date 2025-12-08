import React, { useState, useMemo } from 'react';
import { ArrowUpDownIcon, TrashIcon, EditIcon, PlusIcon, UsersIcon, SearchIcon, ListTreeIcon, CalendarDaysIcon } from './Icons';
import { GlobalResourceView } from './GlobalResourceView';
import { GroupsView } from './GroupsView'; 

const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
};

const getWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))); 
    const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
    return { start: startOfWeek, end: endOfWeek };
};

// ▼▼▼ KEY CHANGE: Added 'clientFilter' to props ▼▼▼
export const TeamManagementView = ({ people, tasks, groups, onUpdate, onPersonSelect, clientFilter }) => { 
    const [view, setView] = useState('list'); 
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');

    const peopleWithUtilization = useMemo(() => {
        const { start, end } = getWeekRange();
        return (people || []).map(person => {
            const weeklyTasks = (tasks || []).filter(t => 
                t.assignedTo === person.id && 
                new Date(t.startDate) <= end && 
                new Date(t.endDate) >= start
            );
            const weeklyHours = weeklyTasks.reduce((sum, t) => sum + (parseFloat(t.allocation) || 0), 0);
            const utilization = Math.min(100, (weeklyHours / 40) * 100); 

            return {
                ...person,
                utilization: Math.round(utilization)
            };
        });
    }, [people, tasks]);

    const sortedPeople = useMemo(() => {
        let sortablePeople = [...peopleWithUtilization];
        if (sortConfig.key) {
            sortablePeople.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortablePeople;
    }, [peopleWithUtilization, sortConfig]);

    const filteredPeople = useMemo(() => {
        return sortedPeople.filter(person => {
            // 1. Search Filter
            const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (person.role || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            // 2. Client Filter (The Fix)
            // We check if the person.client (Name) OR person.clientId (ID) matches the filter
            const matchesClient = 
                clientFilter === 'All' || 
                !clientFilter || 
                person.client === clientFilter || 
                person.clientId === clientFilter;

            return matchesSearch && matchesClient;
        });
    }, [sortedPeople, searchTerm, clientFilter]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    if (view === 'timeline') {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Resource Timeline</h2>
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-300 rounded-md flex items-center transition-colors">
                            <ListTreeIcon className="h-5 w-5 mr-2" /> List View
                        </button>
                        <button onClick={() => setView('timeline')} className="px-4 py-2 text-sm font-semibold bg-white text-purple-700 shadow rounded-md flex items-center transition-colors">
                            <CalendarDaysIcon className="h-5 w-5 mr-2" /> Timeline View
                        </button>
                        <button onClick={() => setView('groups')} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-300 rounded-md flex items-center transition-colors">
                            <UsersIcon className="h-5 w-5 mr-2" /> Groups
                        </button>
                    </div>
                </div>
                <GlobalResourceView people={filteredPeople} tasks={tasks} />
            </div>
        );
    }

    if (view === 'groups') {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Groups Management</h2>
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        <button onClick={() => setView('list')} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-300 rounded-md flex items-center transition-colors">
                            <ListTreeIcon className="h-5 w-5 mr-2" /> List View
                        </button>
                        <button onClick={() => setView('timeline')} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-300 rounded-md flex items-center transition-colors">
                            <CalendarDaysIcon className="h-5 w-5 mr-2" /> Timeline View
                        </button>
                        <button onClick={() => setView('groups')} className="px-4 py-2 text-sm font-semibold bg-white text-purple-700 shadow rounded-md flex items-center transition-colors">
                            <UsersIcon className="h-5 w-5 mr-2" /> Groups
                        </button>
                    </div>
                </div>
                <GroupsView 
                    groups={groups} 
                    people={people} 
                    onUpdate={onUpdate}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Team Management</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {filteredPeople.length} people 
                        {clientFilter !== 'All' && <span className="font-semibold text-purple-600"> • Client: {clientFilter}</span>}
                    </p>
                </div>

                <div className="flex bg-gray-200 rounded-lg p-1">
                    <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${view === 'list' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                        <ListTreeIcon className="h-5 w-5 mr-2" /> List View
                    </button>
                    <button onClick={() => setView('timeline')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${view === 'timeline' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                        <CalendarDaysIcon className="h-5 w-5 mr-2" /> Timeline View
                    </button>
                    <button onClick={() => setView('groups')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${view === 'groups' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                        <UsersIcon className="h-5 w-5 mr-2" /> Groups
                    </button>
                </div>

                <button onClick={() => onUpdate({ type: 'ADD_PERSON' })} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Person
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search people by name or role..."
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => requestSort('name')}
                            >
                                <div className="flex items-center">
                                    Name <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Region
                            </th>
                            {/* ▼▼▼ KEY CHANGE: Added Client Column Header ▼▼▼ */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Client
                            </th>
                             <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => requestSort('utilization')}
                            >
                                <div className="flex items-center">
                                    Utilization <ArrowUpDownIcon className="ml-1 h-4 w-4" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredPeople.map((person) => (
                            <tr key={person.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center cursor-pointer" onClick={() => onPersonSelect(person)}>
                                        <img className="h-10 w-10 rounded-full" src={person.avatar} alt="" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{person.name}</div>
                                            <div className="text-sm text-gray-500">{person.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{person.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {person.region || 'Global'}
                                    </span>
                                </td>
                                {/* ▼▼▼ KEY CHANGE: Added Client Data Cell ▼▼▼ */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${person.client ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {person.client || 'Unassigned'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                                            <div 
                                                className={`h-2 rounded-full ${person.utilization > 100 ? 'bg-red-500' : person.utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                                style={{ width: `${Math.min(person.utilization, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-600">{person.utilization}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onUpdate({ type: 'UPDATE_PERSON', item: person })}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => onUpdate({ type: 'DELETE_PERSON', id: person.id })}
                                        className="text-red-600 hover:text-red-900"
                                    >
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
