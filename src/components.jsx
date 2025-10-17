import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import * as d3 from 'd3';

// --- ICONS ---
const PlusIcon = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const EditIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const MailIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const CalendarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const WandIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L11 10l-1.5 1.5 3.52 3.52L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>);
const ArrowUpDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>);
const UsersIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const Share2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>);
const ListTreeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 6V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 18v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><line x1="12" y1="6" x2="12" y2="18"/></svg>);
const AlertTriangleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const CheckCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const MessageSquareIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>);

// --- Helper Functions ---
const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

// --- HEADER COMPONENT ---
export const Header = ({ viewMode, setViewMode, onUpload, isDataEmpty }) => (
    <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Project & Resource Visualizer</h1>
            <p className="mt-1 text-gray-600">Explore your organization's structure and connections.</p>
        </div>
        <div className="flex items-center gap-4">
            {isDataEmpty && (
                <button onClick={onUpload} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-green-600 text-white hover:bg-green-700">
                    Upload Initial Data
                </button>
            )}
            <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                <button onClick={() => setViewMode('orgChart')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'orgChart' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <ListTreeIcon className="h-5 w-5 mr-2" /> Org Chart View
                </button>
                <button onClick={() => setViewMode('network')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${viewMode === 'network' ? 'bg-white text-purple-700 shadow' : 'bg-transparent text-gray-600'}`}>
                    <Share2Icon className="h-5 w-5 mr-2" /> Network View
                </button>
            </div>
        </div>
    </div>
);

// --- CLIENT FILTER COMPONENT ---
export const ClientFilter = ({ clients, activeFilter, onFilterChange }) => ( <div className="px-8 py-4 bg-gray-50 border-b border-gray-200"> <div className="flex items-center space-x-2 overflow-x-auto pb-2"> <span className="font-semibold text-gray-600 flex-shrink-0">Filter by Client:</span> <button onClick={() => onFilterChange('all')} className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>All Clients</button> {clients.map(client => ( <button key={client.id} onClick={() => onFilterChange(client.id)} className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === client.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>{client.name}</button>))} </div> </div> );

// --- NODE COMPONENT (for Org Chart) ---
export const Node = ({ node, level, onUpdate, path, onPersonSelect, onProjectSelect }) => {
    const isClient = level === 0; const isProgram = level === 1; const isProject = level === 2; const isPerson = level === 3;
    
    const handleNodeClick = (e) => { 
        e.stopPropagation(); 
        if(isPerson) onPersonSelect(node.personId);
        if(isProject) onProjectSelect(node);
    };

    const nodeStyles = {
        base: 'relative group p-4 rounded-lg border-2 flex items-center min-w-[280px] shadow-sm transition-all duration-300',
        client: 'bg-purple-50 border-purple-500', 
        program: 'bg-blue-50 border-blue-500', 
        project: 'bg-indigo-50 border-indigo-500 cursor-pointer', 
        person: 'bg-green-50 border-green-500 cursor-pointer',
    };
    let nodeTypeClasses = isClient ? nodeStyles.client : isProgram ? nodeStyles.program : isProject ? nodeStyles.project : nodeStyles.person;

    return (
        <div className="relative pl-8 py-2">
            <div className="absolute top-0 left-4 w-px h-full bg-gray-300"></div>
            <div className="absolute top-1/2 left-4 w-4 h-px bg-gray-300"></div>
            <div className={`${nodeStyles.base} ${nodeTypeClasses}`} onClick={handleNodeClick}>
                <div className="flex-grow">
                    <p className={`font-bold text-lg ${ isClient ? 'text-purple-800' : isProgram ? 'text-blue-800' : isProject ? 'text-indigo-800' : 'text-green-800'}`}>{node.name}</p>
                    {node.role && <p className="text-sm text-gray-600">{node.role}</p>}
                </div>
                {!isClient && <button onClick={(e) => { e.stopPropagation(); onUpdate({ type: 'DELETE_NODE', path, id: node.id, nodeType: node.type }); }} className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete item"><TrashIcon className="h-4 w-4" /></button>}
            </div>
            {node.children && node.children.length > 0 && (<div className="mt-2">{node.children.map((child, index) => ( <Node key={child.id || `child-${index}`} node={child} level={level + 1} onUpdate={onUpdate} path={`${path}.children.${index}`} onPersonSelect={onPersonSelect} onProjectSelect={onProjectSelect} /> ))}</div>)}
        </div>
    );
};

// --- PROJECT HUB COMPONENT ---
export const ProjectHub = () => <div>Project Hub Placeholder</div>;

// --- PERSON DETAIL CARD COMPONENT ---
export const PersonDetailCard = ({ person, onClose, projectMap, tasks }) => {
    if (!person) return null;
    
    const personAssignments = useMemo(() => {
        return tasks
            .filter(t => t.assigneeId === person.personId)
            .map(t => ({
                projectId: t.projectId,
                projectName: projectMap.get(t.projectId)?.name || 'Unknown Project',
                startDate: t.startDate,
                endDate: t.endDate,
            }));
    }, [tasks, person.personId, projectMap]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                <h2 className="text-3xl font-bold">{person.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{person.role}</p>
                <div className="flex items-center text-gray-700 mb-4"><MailIcon className="h-5 w-5 mr-3" /><a href={`mailto:${person.email}`} className="hover:underline">{person.email}</a></div>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Current Assignments</h3>
                    <div className="space-y-3">
                        {personAssignments.length > 0 ? personAssignments.map((ass, i) => (
                            <div key={i}>
                                <p className="font-medium">{ass.projectName}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(ass.startDate)} - {formatDate(ass.endDate)}</p>
                            </div>
                        )) : <p className="text-sm text-gray-500">No active assignments.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- TEAM MANAGEMENT VIEW COMPONENT ---
export const TeamManagementView = ({ people, onPersonSelect, onUpdate }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const sortedPeople = useMemo(() => {
        let sortableItems = [...people];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = sortConfig.key === 'team' ? (a.tags.find(t => t.type === 'Team')?.value || '') : a[sortConfig.key];
                const bVal = sortConfig.key === 'team' ? (b.tags.find(t => t.type === 'Team')?.value || '') : b[sortConfig.key];
                
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
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Person
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
                            <tr key={person.personId}>
                                <td onClick={() => onPersonSelect(person.personId)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:underline">{person.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeam(person)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(person.totalMonthlyCost)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(person.billableRatePerHour)}/hr</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onUpdate({ type: 'EDIT_PERSON', person })} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => onUpdate({ type: 'DELETE_PERSON', personId: person.personId })} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- SIDE PANEL COMPONENT ---
export const SidePanel = ({ data, allPeople, onPersonSelect, onUpdate, viewMode, networkFocus, setNetworkFocus }) => {
    const [activeTab, setActiveTab] = useState('team');

    useEffect(() => {
        if(viewMode === 'network') setActiveTab('visualize');
    }, [viewMode]);

    return (
        <div className="w-full lg:w-[48rem] bg-white p-6 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('visualize')} className={`py-2 px-4 font-semibold ${activeTab === 'visualize' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Visualize</button>
                    <button onClick={() => setActiveTab('team')} className={`py-2 px-4 font-semibold ${activeTab === 'team' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Team</button>
                    <button onClick={() => setActiveTab('manage')} className={`py-2 px-4 font-semibold ${activeTab === 'manage' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Manage</button>
                </nav>
            </div>

            {activeTab === 'visualize' && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Visualization Controls</h2>
                    {viewMode === 'network' && (
                         <div className="space-y-4 mb-6">
                             <div>
                                <label htmlFor="network-focus" className="block text-sm font-medium text-gray-700">Focus Network On:</label>
                                <select id="network-focus" value={networkFocus?.id || 'all'} onChange={(e) => setNetworkFocus(e.target.value === 'all' ? null : { type: 'client', id: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="all">Entire Organization</option>
                                    {data.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                                </select>
                            </div>
                         </div>
                    )}
                </div>
            )}
            {activeTab === 'team' && ( <TeamManagementView people={allPeople} onPersonSelect={onPersonSelect} onUpdate={onUpdate} /> )}
            {activeTab === 'manage' && (
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Management</h2>
                    <div className="space-y-4">
                        <button onClick={() => onUpdate({ type: 'ADD_CLIENT' })} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Add Client</button>
                        <button onClick={() => onUpdate({ type: 'ADD_PROGRAM' })} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Add Program</button>
                        <button onClick={() => onUpdate({ type: 'ADD_PROJECT' })} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Add Project</button>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- NETWORK VIEW COMPONENT ---
export const NetworkView = () => <div>Network View Placeholder</div>;

