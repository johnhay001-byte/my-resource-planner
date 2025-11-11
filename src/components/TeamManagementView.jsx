import React, { useState, useMemo } from 'react';
import { ArrowUpDownIcon, TrashIcon, EditIcon, PlusIcon, UsersIcon, SearchIcon, ListTreeIcon, BriefcaseIcon } from './Icons';
import { GlobalResourceView } from './GlobalResourceView';
import { GroupsView } from './GroupsView'; // Import the new GroupsView

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

export const TeamManagementView = ({ people, tasks, groups, onUpdate, onPersonSelect }) => { // Add 'groups' to props
    const [view, setView] = useState('list'); // 'list', 'timeline', or 'groups'
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const [searchTerm, setSearchTerm] = useState('');

    const peopleWithUtilization = useMemo(() => {
        const { start, end } = getWeekRange();
        return (people || []).map(person => {
            const weeklyTasks = (tasks || []).filter(t => {
                const taskStartDate = new Date(t.startDate + 'T00:00:00');
                return t.assigneeId === person.id && taskStartDate >= start && taskStartDate <= end;
            });
            const weeklyHours = weeklyTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
            return { ...person, weeklyHours };
        });
    }, [people, tasks]);

    const sortedPeople = useMemo(() => {
        let sortableItems = [...peopleWithUtilization];
        if (searchTerm) {
            sortableItems = sortableItems.filter(person =>
                person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.role.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        sortableItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [peopleWithUtilization, sortConfig, searchTerm]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const getTeam = (person) => (person.tags?.find(t => t.type === 'Team')?.value || 'N/A');

    // --- RENDER VIEWS ---

    const renderListView = () => (
        <>
            <div className="mb-6">
                <div className="relative w-full md:w-1/3">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 border rounded-md"
                    />
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button onClick={() => requestSort('name')} className="flex items-center">Name <ArrowUpDownIcon className="h-4 w-4 ml-1" /></button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Week's Utilization</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPeople.map((person) => (
                            <tr key={person.id} className="hover:bg-gray-50">
                                <td onClick={() => onPersonSelect(person.id)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:underline">{person.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeam(person)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.weeklyHours} / 40</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onUpdate({ type: 'EDIT_PERSON', person: person })} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => { if(confirm(`Are you sure you want to delete ${person.name}?`)) onUpdate({ type: 'DELETE_PERSON', personId: person.id }) }} className="text-red-600 hover:text-red-900">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderCurrentView = () => {
        switch(view) {
            case 'list':
                return renderListView();
            case 'timeline':
                return <GlobalResourceView allPeople={people} allTasks={tasks} onUpdate={onUpdate} />;
            case 'groups':
                return <GroupsView allPeople={people} allGroups={groups} onUpdate={onUpdate} />;
            default:
                return renderListView();
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center"><UsersIcon className="h-7 w-7 mr-3 text-purple-600" /> Manage Team</h2>
                
                {/* --- View Toggle --- */}
                <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setView('list')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${view === 'list' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                        <ListTreeIcon className="h-5 w-5 mr-2" /> List View
                    </button>
                    <button onClick={() => setView('timeline')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${view === 'timeline' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                        <BriefcaseIcon className="h-5 w-5 mr-2" /> Timeline View
                    </button>
                    {/* ▼▼▼ ADD THIS NEW BUTTON ▼▼▼ */}
                    <button onClick={() => setView('groups')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${view === 'groups' ? 'bg-white text-purple-700 shadow' : 'text-gray-600 hover:bg-gray-300'}`}>
                        <UsersIcon className="h-5 w-5 mr-2" /> Groups
                    </button>
                </div>

                <button onClick={() => onUpdate({ type: 'ADD_PERSON' })} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Person
                </button>
            </div>
            
            {/* Render the selected view */}
            {renderCurrentView()}

        </div>
    );
};