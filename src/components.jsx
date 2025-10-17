import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import * as d3 from 'd3';

// --- ICONS ---
const PlusIcon = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const EditIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const MailIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const CalendarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const WandIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L11 10l-1.5 1.5 3.52 3.52L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>);
const ArrowUpDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>);
const UsersIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const Share2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>);
const ListTreeIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 6V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><path d="M21 18v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/><line x1="12" y1="6" x2="12" y2="18"/></svg>);
const AlertTriangleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
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
export const ClientFilter = ({ clients, activeFilter, onFilterChange }) => (
    <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <span className="font-semibold text-gray-600 flex-shrink-0">Filter by Client:</span>
            <button onClick={() => onFilterChange('all')} className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                All Clients
            </button>
            {clients.map(client => (
                <button key={client.id} onClick={() => onFilterChange(client.id)} className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === client.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                    {client.name}
                </button>
            ))}
        </div>
    </div>
);

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
export const PersonDetailCard = () => <div>Person Detail Placeholder</div>;

// --- TEAM MANAGEMENT VIEW COMPONENT ---
export const TeamManagementView = () => <div>Team Management Placeholder</div>;

// --- SIDE PANEL COMPONENT ---
export const SidePanel = () => <div>Side Panel Placeholder</div>;

// --- NETWORK VIEW COMPONENT ---
export const NetworkView = () => <div>Network View Placeholder</div>;

