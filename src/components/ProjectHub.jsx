import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, MessageSquareIcon } from './Icons';
import * as d3 from 'd3';

// --- Helper Functions ---
const formatDate = (dateString) => new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// --- Gantt Chart Component (now inside ProjectHub) ---
const GanttView = ({ tasks }) => {
    const svgRef = useRef();
    const tooltipRef = useRef();

    useEffect(() => {
        if (!tasks || tasks.length === 0 || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const tooltip = d3.select(tooltipRef.current);
        svg.selectAll("*").remove();

        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const containerWidth = svgRef.current.parentElement.clientWidth;
        const width = containerWidth > 0 ? containerWidth - margin.left - margin.right : 600;
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
            .attr("width", d => Math.max(0, x(d.endDate) - x(d.startDate)))
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                       .html(`<strong>${d.name}</strong><br/>Start: ${d.startDate.toLocaleDateString()}<br/>End: ${d.endDate.toLocaleDateString()}`)
                       .style("left", `${event.pageX + 15}px`)
                       .style("top", `${event.pageY - 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

    }, [tasks]);

    return (
        <div className="gantt-container">
            <svg ref={svgRef}></svg>
            <div ref={tooltipRef} className="gantt-tooltip"></div>
        </div>
    );
};


// --- Main Project Hub Component ---
export const ProjectHub = ({ project, onClose, onUpdate, allPeople }) => {
    const [view, setView] = useState('list');
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        setTasks(project.tasks || []);
    }, [project]);

    if (!project) return null;

    const renderCurrentView = () => {
        switch (view) {
            case 'list':
                return <ListView tasks={tasks} allPeople={allPeople} onUpdate={onUpdate} projectId={project.id} />;
            case 'board':
                return <div className="text-center p-8 text-gray-500">Kanban Board View Coming Soon!</div>;
            case 'gantt':
                return <GanttView tasks={tasks} />;
            default:
                return null;
        }
    };

    return (
        <>
            {/* --- All CSS for the Gantt Chart is now included here --- */}
            <style>{`
                .gantt-container {
                    overflow-x: auto;
                    padding: 1rem;
                    background-color: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                }
                .bar {
                    fill: #6d28d9;
                    rx: 4;
                    ry: 4;
                    transition: fill 0.2s ease-in-out;
                }
                .bar:hover {
                    fill: #4c1d95;
                }
                .y-axis-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #374151;
                }
                .gantt-tooltip {
                    position: absolute;
                    opacity: 0;
                    background-color: #111827;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    pointer-events: none;
                    transition: opacity 0.2s ease-in-out;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
            `}</style>

            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-6xl h-5/6 flex flex-col" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    <div className="flex-shrink-0">
                        <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
                        <p className="text-gray-600 mb-4">{project.brief}</p>
                        <div className="flex border-b mb-4">
                            <button onClick={() => setView('list')} className={`px-4 py-2 font-semibold ${view === 'list' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>List</button>
                            <button onClick={() => setView('board')} className={`px-4 py-2 font-semibold ${view === 'board' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>Board</button>
                            <button onClick={() => setView('gantt')} className={`px-4 py-2 font-semibold ${view === 'gantt' ? 'border-b-2 border-purple-600 text-purple-700' : 'text-gray-500'}`}>Gantt</button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        {renderCurrentView()}
                    </div>
                </div>
            </div>
        </>
    );
};

// --- Sub-components for List View ---
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
        <div className="space-y-4">
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

