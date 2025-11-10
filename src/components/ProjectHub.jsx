import React, { useState, useEffect } from 'react';
// ▼▼▼ Import new icons ▼▼▼
import { PlusIcon, MessageSquareIcon, SparklesIcon, SpinnerIcon } from './Icons';
import * as d3 from 'd3';

const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// --- Board View Component (Kanban) ---
// ... (This component is unchanged)
const BoardView = ({ tasks, allPeople, onUpdate }) => {
    const [columns, setColumns] = useState({
        'To Do': [],
        'In Progress': [],
        'Done': [],
    });

    useEffect(() => {
        const newColumns = { 'To Do': [], 'In Progress': [], 'Done': [] };
        (tasks || []).forEach(task => {
            if (newColumns[task.status]) {
                newColumns[task.status].push(task);
            } else {
                newColumns['To Do'].push(task);
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
    
    const getAssignee = (assigneeId) => allPeople.find(p => p.id === assigneeId);

    return (
        <div className="flex gap-6 p-4">
            {Object.entries(columns).map(([status, tasksInColumn]) => (
                <div 
                    key={status} 
                    className="flex-1 bg-gray-100 rounded-lg p-3"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    <h3 className="font-bold text-lg mb-4 px-2">{status} ({tasksInColumn.length})</h3>
                    <div className="space-y-3 h-full">
                        {tasksInColumn.map(task => {
                            const assignee = getAssignee(task.assigneeId);
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
                                        {assignee && (
                                            <span title={assignee.name} className="flex items-center h-6 w-6 justify-center bg-gray-200 rounded-full font-bold text-purple-800">
                                                {assignee.name.charAt(0)}
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


// --- Gantt View Component ---
// ... (This component is unchanged)
const GanttView = ({ tasks }) => {
    const svgRef = React.useRef();
    const tooltipRef = React.useRef();

    React.useEffect(() => {
        if (!tasks || tasks.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        svg.selectAll("*").remove(); 

        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const width = 800 - margin.left - margin.right;
        const height = tasks.length * 40; 

        svg.attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const parsedTasks = tasks.map(d => ({
            ...d,
            startDate: new Date(d.startDate),
            endDate: new Date(d.endDate)
        }));

        const x = d3.scaleTime()
            .domain([d3.min(parsedTasks, d => d.startDate), d3.max(parsedTasks, d => d.endDate)])
            .range([0, width])
            .nice();

        const y = d3.scaleBand()
            .domain(parsedTasks.map(d => d.name))
            .range([0, height])
            .padding(0.2);

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));

        g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("class", "y-axis-label");

        g.selectAll(".bar")
            .data(parsedTasks)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("y", d => y(d.name))
            .attr("x", d => x(d.startDate))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.endDate) - x(d.startDate))
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                       .html(`
                           <strong>${d.name}</strong><br/>
                           Start: ${d.startDate.toLocaleDateString()}<br/>
                           End: ${d.endDate.toLocaleDateString()}
                       `)
                       .style("left", `${event.pageX + 15}px`)
                       .style("top", `${event.pageY - 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

    }, [tasks]);

    const ganttStyles = `
        .gantt-container { overflow-x: auto; padding: 1rem; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; }
        .bar { fill: #6d28d9; rx: 4; ry: 4; transition: fill 0.2s ease-in-out; }
        .bar:hover { fill: #4c1d95; }
        .y-axis-label { font-size: 12px; font-weight: 500; color: #374151; }
        .gantt-tooltip { position: absolute; opacity: 0; background-color: #111827; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; pointer-events: none; transition: opacity 0.2s ease-in-out; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    `;

    return (
        <div className="gantt-container">
            <style>{ganttStyles}</style>
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} className="gantt-tooltip"></div>
        </div>
    );
};

// --- Main Project Hub Component ---
export const ProjectHub = ({ project, onClose, onUpdate, allPeople }) => {
    const [view, setView] = useState('list');
    const [tasks, setTasks] = useState([]);
    
    // ▼▼▼ NEW AI FEATURE STATE ▼▼▼
    const [aiInsights, setAiInsights] = useState('');
    const [isEnriching, setIsEnriching] = useState(false);
    // ▲▲▲ END NEW AI FEATURE STATE ▲▲▲

    useEffect(() => {
        const projectTasks = project.tasks || [];
        setTasks(projectTasks);
        // Reset AI insights when project changes
        setAiInsights(''); 
    }, [project]);

    if (!project) return null;

    // ▼▼▼ NEW AI FEATURE FUNCTION ▼▼▼
    const handleEnrichBrief = async () => {
        if (!project.brief) {
            setAiInsights('<p class="text-red-500">Project brief is empty. Cannot enrich.</p>');
            return;
        }
        
        setIsEnriching(true);
        setAiInsights('');

        const systemPrompt = "You are a senior creative agency producer. Analyze the following project brief and provide 3 key risks, 3 creative opportunities, and a list of recommended team roles (e.g., Creative Director, Senior Copywriter). Format your response in clean, semantic HTML using <h4> for titles and <ul>/<li> for lists.";
        
        const userQuery = `Project Brief: "${project.brief}"`;
        const apiKey = ""; // API key is handled by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                setAiInsights(text);
            } else {
                setAiInsights('<p class="text-red-500">Failed to generate insights. No content returned.</p>');
            }
        } catch (error) {
            console.error("AI enrichment failed:", error);
            setAiInsights(`<p class="text-red-500">Error: ${error.message}</p>`);
        } finally {
            setIsEnriching(false);
        }
    };
    // ▲▲▲ END NEW AI FEATURE FUNCTION ▲▲▲

    const renderCurrentView = () => {
        switch (view) {
            case 'list':
                return <ListView tasks={tasks} allPeople={allPeople} onUpdate={onUpdate} projectId={project.id} />;
            case 'board':
                return <BoardView tasks={tasks} allPeople={allPeople} onUpdate={onUpdate} />;
            case 'gantt':
                return <GanttView tasks={tasks} />;
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-6xl h-5/6 flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                <div className="flex-shrink-0">
                    <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
                    
                    {/* ▼▼▼ PROJECT BRIEF & AI BUTTON ▼▼▼ */}
                    <div className="relative p-4 bg-gray-50 rounded-lg border">
                        <p className="text-gray-600 mb-0">{project.brief || 'No brief available for this project.'}</p>
                        <button 
                            onClick={handleEnrichBrief} 
                            disabled={isEnriching}
                            className="absolute top-3 right-3 px-3 py-1.5 text-xs font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isEnriching ? (
                                <SpinnerIcon className="h-4 w-4 mr-2" />
                            ) : (
                                <SparklesIcon className="h-4 w-4 mr-2" />
                            )}
                            {isEnriching ? 'Analyzing...' : 'Enrich Brief (AI)'}
                        </button>
                    </div>
                    {/* ▲▲▲ END PROJECT BRIEF & AI BUTTON ▲▲▲ */}

                    {/* ▼▼▼ AI INSIGHTS SECTION ▼▼▼ */}
                    {(isEnriching || aiInsights) && (
                        <div className="mt-4 p-4 border rounded-lg bg-white">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">AI Insights</h3>
                            {isEnriching && (
                                <div className="flex items-center text-gray-500">
                                    <SpinnerIcon className="h-5 w-5 mr-2" />
                                    <span>Generating insights...</span>
                                </div>
                            )}
                            {/* Render the HTML response from the AI */}
                            <div 
                                className="prose prose-sm max-w-none text-gray-700" 
                                dangerouslySetInnerHTML={{ __html: aiInsights }} 
                            />
                        </div>
                    )}
                    {/* ▲▲▲ END AI INSIGHTS SECTION ▲▲▲ */}

                    <div className="flex border-b mt-4 mb-4">
                        <button onClick={() => setView('list')} className={`px-4 py-2 font-semibold ${view === 'list' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>List</button>
                        <button onClick={() => setView('board')} className={`px-4 py-2 font-semibold ${view === 'board' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>Board</button>
                        <button onClick={() => setView('gantt')} className={`px-4 py-2 font-semibold ${view === 'gantt' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>Gantt</button>
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
// ... (This component is unchanged)
const ListView = ({ tasks, allPeople, onUpdate, projectId }) => {
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
                    <TaskItem key={task.id} task={task} allPeople={allPeople} onUpdate={onUpdate} />
                ))}
            </div>
        </div>
    );
};

// --- Task Item Component (already existed) ---
// ... (This component is unchanged)
const TaskItem = ({ task, allPeople, onUpdate }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const assignee = allPeople.find(p => p.id === task.assigneeId);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        onUpdate({ type: 'ADD_COMMENT', taskId: task.id, commentText: newComment, author: 'User' });
        setNewComment('');
    };

    return (
        <div className="py-4">
            <div className="flex items-center">
                <div className="flex-grow">
                    <p className="font-semibold text-lg">{task.name}</p>
                    <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                        <span>Status: {task.status}</span>
                        <span>Assignee: {assignee ? assignee.name : 'Unassigned'}</span>
                        <span>Dates: {formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                    </div>
                </div>
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