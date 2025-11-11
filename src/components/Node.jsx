import React, { useState } from 'react';
import { TrashIcon, ChevronRightIcon } from './Icons'; // Import ChevronRightIcon

export const Node = ({ node, level, onUpdate, onPersonSelect, onProjectSelect }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Default expanded for Clients/Programs

    const isClient = level === 0;
    const isProgram = level === 1;
    const isProject = level === 2;
    const isPerson = level === 3;

    const hasChildren = node.children && node.children.length > 0;

    const handleToggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleNodeClick = (e) => {
        e.stopPropagation();
        if (isPerson) {
            onPersonSelect(node.personId);
        } else if (isProject) {
            onProjectSelect(node);
        } else {
            // If not a person or project, toggle expand
            setIsExpanded(!isExpanded);
        }
    };

    const nodeStyles = {
        base: 'relative group p-4 rounded-lg border-2 flex items-center min-w-[280px] shadow-sm transition-all duration-300',
        client: 'bg-purple-50 border-purple-500',
        program: 'bg-blue-50 border-blue-500',
        project: 'bg-indigo-50 border-indigo-500 cursor-pointer hover:bg-indigo-100',
        person: 'bg-green-50 border-green-500 cursor-pointer hover:bg-green-100',
    };
    
    let nodeTypeClasses = isClient ? nodeStyles.client : isProgram ? nodeStyles.program : isProject ? nodeStyles.project : nodeStyles.person;

    return (
        <div className="relative pl-8 py-2">
            {/* Hierarchy lines */}
            <div className="absolute top-0 left-4 w-px h-full bg-gray-300"></div>
            <div className="absolute top-1/2 left-4 w-4 h-px bg-gray-300"></div>
            
            <div className={`${nodeStyles.base} ${nodeTypeClasses}`} onClick={handleNodeClick}>
                {/* Chevron Toggle Button */}
                {hasChildren && (
                    <button onClick={handleToggleExpand} className="p-1 -ml-2 mr-1 rounded-full hover:bg-gray-200">
                        <ChevronRightIcon className={`h-5 w-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
                    </button>
                )}
                
                <div className={`flex-grow ${!hasChildren ? 'ml-7' : ''}`}>
                    <p className={`font-bold text-lg ${isClient ? 'text-purple-800' : isProgram ? 'text-blue-800' : isProject ? 'text-indigo-800' : 'text-green-800'}`}>{node.name}</p>
                    {node.role && <p className="text-sm text-gray-600">{node.role}</p>}
                </div>

                {/* Delete Button */}
                {!isClient && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
                                onUpdate({ type: 'DELETE_NODE', id: node.id, nodeType: node.type });
                            }
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete item"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            {/* Children Nodes (Recursive) */}
            {hasChildren && isExpanded && (
                <div className="mt-2">
                    {node.children.map((child, index) => (
                        <Node
                            key={child.id || `child-${index}`}
                            node={child}
                            level={level + 1}
                            onUpdate={onUpdate}
                            onPersonSelect={onPersonSelect}
                            onProjectSelect={onProjectSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};