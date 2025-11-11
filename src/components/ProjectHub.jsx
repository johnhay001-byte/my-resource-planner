// v7 - Final Sync
import React, { useState, useEffect, useMemo } from 'react';
import { PlusIcon, MessageSquareIcon, SparklesIcon, CheckCircleIcon, SpinnerIcon, CalendarDaysIcon, UsersIcon, EditIcon, UserPlusIcon, UserMinusIcon } from './Icons'; // Import new icons
import { GanttView } from './GanttView';
import { ResourceTimeline } from './ResourceTimeline';

const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// --- Board View Component (Kanban) ---
const BoardView = ({ tasks, allPeople, allGroups, onUpdate }) => { 
    const [columns, setColumns] = useState({
        'To Do': [],
        'In Progress': [],
        'Blocked': [],
        'Complete': [],
    });

    useEffect(() => {
        const newColumns = { 'To Do': [], 'In Progress': [], 'Blocked': [], 'Complete': [] };
        (tasks || []).forEach(task => {
            if (newColumns[task.status]) {
                newColumns[task.status].push(task);
            } else {
                newColumns['To Do'].push(task); // Fallback
            }
        });
        setColumns(newColumns);
    }, [tasks]);

    const handleDragStart = (e, task) => {
        e.dataTransfer.setData("taskId", task.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, newStatus) => {
        const taskId = e.dataTransfer.getData("taskId");
        const taskToMove = tasks.find(t => t.id === taskId);

        if (taskToMove && taskToMove.status !== newStatus) {
            onUpdate({
                type: 'SAVE_TASK',
                task: { ...taskToMove, status: newStatus }
            });
        }
    };
    
    // Find either the person or the group
    const getAssignee = (task) => {
        if (task.assigneeId) {
            const person = allPeople.find(p => p.id === task.assigneeId);
            return { type: 'person', data: person };
        }
        if (task.assigneeGroupId) {
            const group = allGroups.find(g => g.id === task.assigneeGroupId);
            return { type: 'group', data: group };
        }
        return { type: 'unassigned' };
    };

    return (
        <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
            {Object.entries(columns).map(([status, tasksInColumn]) => (
                <div 
                    key={status} 
                    className="flex-1 bg-gray-100 rounded-lg p-3 min-h-[400px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    <h3 className="font-bold text-lg mb-4 px-2">{status} ({tasksInColumn.length})</h3>
                    <div className="space-y-3 h-full">
                        {tasksInColumn.map(task => {
                            const assignee = getAssignee(task);
                            return (
                                <div
                                    key={task.id}
                                    className="bg-white p-4 rounded-md shadow-sm cursor-grab active:cursor-grabbing"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task)}
                                >
                                    <p className="font-semibold">{task.name}</p>
                                    <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                                        <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                                        {assignee.type === 'person' && assignee.data && (
                                            <span title={assignee.data.name} className="flex items-center h-6 w-6 justify-center bg-gray-200 rounded-full font-bold text-purple-800">
                                                {assignee.data.name.charAt(0)}
                                            </span>
                                        )}
                                        {assignee.type === 'group' && assignee.data && (
                                            <span title={assignee.data.name} className="flex items-center h-6 w-6 justify-center bg-blue-200 rounded-full font-bold text-blue-800">
                                                <UsersIcon className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- TEAM VIEW (Project Casting) ---
const TeamView = ({ project, allPeople, allGroups, onUpdate }) => {
    const [selectedPerson, setSelectedPerson] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');

    // Create a quick lookup map for person details
    const peopleMap = useMemo(() => new Map(allPeople.map(p => [p.id, p])), [allPeople]);
    
    // Get full person objects for the project's team
    const currentTeam = useMemo(() => {
        return (project.team || []).map(id => peopleMap.get(id)).filter(Boolean);
    }, [project.team, peopleMap]);
    
    // Create a list of people *not* already on the team
    const availablePeople = useMemo(() => {
        const teamIds = new Set(project.team || []);
        return allPeople.filter(p => !teamIds.has(p.id));
    }, [project.team, allPeople]);

    const handleAddPerson = () => {
        if (!selectedPerson) return;
        onUpdate({
            type: 'ADD_TEAM_MEMBER',
            projectId: project.id,
            personId: selectedPerson
        });
        setSelectedPerson(''); // Reset dropdown
    };

    const handleRemovePerson = (personId) => {
        onUpdate({
            type: 'REMOVE_TEAM_MEMBER',
            projectId: project.id,
            personId: personId
        });
    };
    
    const handleAssignGroup = () => {
        if (!selectedGroup) return;
        onUpdate({
            type: 'ASSIGN_GROUP_TO_PROJECT',
            projectId: project.id,
            groupId: selectedGroup
        });
        setSelectedGroup(''); // Reset dropdown
    };

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* --- Left Column: Assign Team --- */}
            <div className="space-y-6">
                {/* Assign Group */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3">Assign a Group</h3>
                    <div className="flex gap-2">
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="flex-grow p-2 border rounded-md bg-white"
                        >
                            <option value="">Select a group...</option>
                            {allGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAssignGroup}
                            disabled={!selectedGroup}
                            className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            <UsersIcon className="h-4 w-4 mr-2" /> Assign
                        </button>
                    </div>
                </div>
                
                {/* Add Individual */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3">Add a Person</h3>
                    <div className="flex gap-2">
                        <select
                            value={selectedPerson}
                            onChange={(e) => setSelectedPerson(e.target.value)}
                            className="flex-grow p-2 border rounded-md bg-white"
                        >
                            <option value="">Select a person to add...</option>
                            {availablePeople.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddPerson}
                            disabled={!selectedPerson}
                            className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <UserPlusIcon className="h-4 w-4 mr-2" /> Add
                        </button>
                    </div>
                </div>
            </div>
            
            {/* --- Right Column: Current Team --- */}
            <div className="bg-white rounded-lg">
                <h3 className="text-xl font-bold mb-4">Current Project Team ({currentTeam.length})</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {currentTeam.length > 0 ? currentTeam.map(person => (
                        <div key={person.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                            <div>
                                <p className="font-medium">{person.name}</p>
                                <p className="text-xs text-gray-500">{person.role}</p>
                            </div>
                            <button
                                onClick={() => handleRemovePerson(person.id)}
                                className="p-2 text-gray-400 hover:text-red-600"
                                title="Remove from project"
                            >
                                <UserMinusIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500 italic">No one is assigned to this project yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Project Hub Component ---
export const ProjectHub = ({ project, onClose, onUpdate, allPeople, allGroups }) => { // Add allGroups
    const [view, setView] = useState('list');
    const [tasks, setTasks] = useState([]);
    
    // AI Enrichment State
    const [aiInsights, setAiInsights] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);

    useEffect(() => {
        // This makes sure the tasks in the hub are always up-to-date with the main app state
        setTasks(project.tasks || []);
        setAiInsights(''); // Clear insights when project changes
        setIsEnriching(false);
    }, [project]);

    if (!project) return null;
    
    const isPending = project.status === 'Pending';

    // --- AI Enrichment Function ---
    const handleEnrichBrief = async () => {
        if (!project.brief) {
            setAiInsights('<p class="text-red-600">Project brief is empty. Cannot enrich.</p>');
            return;
        }
        setIsEnriching(true);
        setAiInsights('');

        const systemPrompt = "You are a senior creative agency producer. Analyze the following project brief and provide 3 key risks, 3 creative opportunities, and a list of recommended team roles (e.g., Creative Director, Sr. Copywriter, Project Manager). Format your response in clean HTML with <h3> tags for headers and <ul>/<li> for lists.";
        const userQuery = `Project Brief: """${project.brief}"""`;
        const apiKey = ""; // Leave empty
        
        // This is the CORRECTED API URL
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userQuery }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) {
                throw new Error(`API error! status: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
                setAiInsights(text);
            } else {
                setAiInsights('<p class="text-red-600">Could not generate insights. No text returned.</p>');
            }
        } catch (error) {
            console.error("AI Enrichment Error:", error);
            setAiInsights(`<p class="text-red-600">Failed to fetch AI insights: ${error.message}</p>`);
        } finally {
            setIsEnriching(false);
        }
    };

    // --- View Renderer ---
    const renderCurrentView = () => {
        switch (view) {
            case 'list':
                return <ListView tasks={tasks} allPeople={allPeople} allGroups={allGroups} onUpdate={onUpdate} projectId={project.id} />;
            case 'board':
                return <BoardView tasks={tasks} allPeople={allPeople} allGroups={allGroups} onUpdate={onUpdate} />;
            case 'gantt':
                return <GanttView tasks={tasks} />;
            case 'resources':
                return <ResourceTimeline tasks={tasks} allPeople={allPeople} onUpdate={onUpdate} />;
            case 'team': // ▼▼▼ NEW CASE ▼▼▼
                return <TeamView project={project} allPeople={allPeople} allGroups={allGroups} onUpdate={onUpdate} />;
            default:
                return null;
        }
    };
    
    const handleApproveProject = () => {
        onUpdate({ 
            type: 'UPDATE_PROJECT_STATUS', 
            projectId: project.id, 
            newStatus: 'Active' 
        });
        onClose(); // Close the modal after approving
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-6xl h-5/6 flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                
                {/* --- Header & Brief Section --- */}
                <div className="flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
                        {isPending && (
                             <button 
                                onClick={handleApproveProject}
                                className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-green-600 text-white hover:bg-green-700"
                            >
                                <CheckCircleIcon className="h-5 w-5 mr-2" /> Approve Project
                            </button>
                        )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border flex justify-between items-start">
                        <p className="text-gray-600">{project.brief || 'No brief provided for this project.'}</p>
                        <button 
                            onClick={handleEnrichBrief}
                            disabled={isEnriching}
                            className="ml-4 px-3 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isEnriching ? (
                                <SpinnerIcon className="h-5 w-5" />
                            ) : (
                                <SparklesIcon className="h-5 w-5 mr-2" />
                            )}
                            {isEnriching ? 'Analyzing...' : 'Enrich Brief (AI)'}
                        </button>
                    </div>

                    {/* AI Insights Section */}
                    {aiInsights && (
                        <div 
                            className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg"
                            dangerouslySetInnerHTML={{ __html: aiInsights }} 
                        />
                    )}
                    {isEnriching && !aiInsights && (
                         <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                            <p className="text-purple-700">Generating AI insights, please wait...</p>
                         </div>
                    )}

                    {/* --- TAB NAVIGATION --- */}
                    <div className="flex border-b mt-4 mb-4">
                        <button onClick={() => setView('list')} className={`px-4 py-2 font-semibold ${view === 'list' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>List</button>
                        <button onClick={() => setView('board')} className={`px-4 py-2 font-semibold ${view === 'board' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>Board</button>
                        <button onClick={() => setView('gantt')} className={`px-4 py-2 font-semibold ${view === 'gantt' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>Gantt</button>
                        <button onClick={() => setView('resources')} className={`px-4 py-2 font-semibold flex items-center ${view === 'resources' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>
                           <CalendarDaysIcon className="h-5 w-5 mr-2" /> Resources
                        </button>
                        {/* ▼▼▼ NEW TEAM TAB ▼▼▼ */}
                        <button onClick={() => setView('team')} className={`px-4 py-2 font-semibold flex items-center ${view === 'team' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>
                           <UsersIcon className="h-5 w-5 mr-2" /> Team
                        </button>
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
const ListView = ({ tasks, allPeople, allGroups, onUpdate, projectId }) => { // Add allGroups
    const [newTaskName, setNewTaskName] = useState('');

    const handleAddTask = () => {
        if (!newTaskName.trim()) return;
        onUpdate({
            type: 'ADD_TASK',
            task: {
                projectId,
                name: newTaskName,
                status: 'To Do',
                assigneeId: null,
                assigneeGroupId: null, // Add new field
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                comments: []
            }
        });
        setNewTaskName('');
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow p-2 border rounded-md"
                />
                <button onClick={handleAddTask} className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Task
                </button>
            </div>
            <div className="divide-y divide-gray-200">
                {tasks.map(task => (
                    <TaskItem key={task.id} task={task} allPeople={allPeople} allGroups={allGroups} onUpdate={onUpdate} /> // Pass allGroups
                ))}
            </div>
        </div>
    );
};

const TaskItem = ({ task, allPeople, allGroups, onUpdate }) => { // Add allGroups
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    
    // Find either the person or the group
    const assignee = allPeople.find(p => p.id === task.assigneeId);
    const assigneeGroup = allGroups.find(g => g.id === task.assigneeGroupId);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        onUpdate({ type: 'ADD_COMMENT', taskId: task.id, commentText: newComment, author: 'User' });
        setNewComment('');
    };
    
    // --- Assignee Display Logic ---
    const renderAssigneeName = () => {
        if (assignee) {
            return assignee.name;
        }
        if (assigneeGroup) {
            return (
                <span className="flex items-center font-semibold text-blue-700">
                    <UsersIcon className="h-4 w-4 mr-1.5" />
                    {assigneeGroup.name}
                </span>
            );
        }
        return 'Unassigned';
    };

    return (
        <div className="py-4">
            <div className="flex items-center">
                <div className="flex-grow">
                    <p className="font-semibold text-lg">{task.name}</p>
                    <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                        <span>Status: {task.status}</span>
                        <span>Assignee: {renderAssigneeName()}</span>
                        <span>Dates: {formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                    </div>
                </div>
                {/* Edit button now opens the full task modal */}
                <button 
                    onClick={() => onUpdate({ type: 'EDIT_TASK', task: task })}
                    className="p-2 text-gray-500 hover:text-purple-600"
                >
                    <EditIcon className="h-5 w-5" />
                </button>
                <button onClick={() => setShowComments(!showComments)} className="p-2 text-gray-500 hover:text-purple-600">
                    <MessageSquareIcon className="h-5 w-5" />
                </button>
            </div>
            {showComments && (
                <div className="mt-4 pl-8 border-l-2 border-gray-200">
                    <h4 className="font-semibold mb-2">Comments</h4>
                    <div className="space-y-2">
                        {(task.comments || []).map((comment, i) => (
                            <div key={i} className="text-sm">
                                <span className="font-bold">{comment.author}: </span>
                                <span>{comment.text}</span>
                            </div>
                        ))}
                         <div className="flex gap-2 pt-2">
                            <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="flex-grow p-2 border rounded-md text-sm"
                            />
                            <button onClick={handleAddComment} className="px-3 py-1 text-sm font-semibold rounded-md bg-gray-200 hover:bg-gray-300">Post</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};