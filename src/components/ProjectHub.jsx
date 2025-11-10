import React, { useState, useEffect } from 'react';
// ▼▼▼ Add CheckCircleIcon ▼▼▼
import { PlusIcon, MessageSquareIcon, SparklesIcon, SpinnerIcon, UsersIcon, CheckCircleIcon } from './Icons';
import { ResourceTimeline } from './ResourceTimeline'; 
import * as d3 from 'd3';

const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// --- Board View Component (Kanban) ---
const BoardView = ({ tasks, allPeople, onUpdate }) => {
    // ... (no change)
};


// --- Gantt View Component ---
const GanttView = ({ tasks }) => {
    // ... (no change)
};

// --- Main Project Hub Component ---
export const ProjectHub = ({ project, onClose, onUpdate, allPeople }) => {
    const [view, setView] =useState('list');
    const [tasks, setTasks] = useState([]);
    
    const [aiInsights, setAiInsights] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);

    useEffect(() => {
        // ... (no change)
    }, [project]);

    if (!project) return null;

    const handleEnrichBrief = async () => {
        // ... (no change)
    };

    // ▼▼▼ NEW: Handle project approval ▼▼▼
    const handleApproveProject = () => {
        onUpdate({
            type: 'UPDATE_PROJECT_STATUS',
            projectId: project.id,
            newStatus: 'Active'
        });
        onClose(); // Close the modal after approval
    };
    
    const renderCurrentView = () => {
        // ... (no change)
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-6xl h-5/6 flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                <div className="flex-shrink-0">
                    
                    {/* ▼▼▼ ADD APPROVAL HEADER ▼▼▼ */}
                    {project.status === 'Pending' && (
                        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 flex justify-between items-center">
                            <p className="font-semibold text-yellow-800">This project is pending approval.</p>
                            <button 
                                onClick={handleApproveProject}
                                className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-green-600 text-white hover:bg-green-700"
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                Approve Project
                            </button>
                        </div>
                    )}

                    <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
                    
                    <div className="relative p-4 bg-gray-50 rounded-lg border">
                         {/* ... (brief and AI button remain unchanged) ... */}
                    </div>

                    {(isEnriching || aiInsights) && (
                        <div className="mt-4 p-4 border rounded-lg bg-white">
                           {/* ... (AI insights section remains unchanged) ... */}
                        </div>
                    )}

                    <div className="flex border-b mt-4 mb-4">
                         {/* ... (tabs remain unchanged) ... */}
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto -mx-8 px-8">
                    {renderCurrentView()}
                </div>
            </div>
        </div>
    );
};

// --- List View Components (already existed) ---
const ListView = ({ tasks, allPeople, onUpdate, projectId }) => {
    // ... (no change)
};

// --- Task Item Component (already existed) ---
const TaskItem = ({ task, allPeople, onUpdate }) => {
    // ... (no change)
};