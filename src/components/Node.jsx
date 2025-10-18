import React from 'react';
import { TrashIcon } from './Icons';

export const Node = ({ node, level, onUpdate, onPersonSelect, onProjectSelect }) => {
    const isClient = level === 0;
    const isProgram = level === 1;
    const isProject = level === 2;
    const isPerson = level === 3;

    const handleNodeClick = (e) => {
        e.stopPropagation();
        if (isPerson) onPersonSelect(node.personId);
        if (isProject) onProjectSelect(node);
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
                    <p className={`font-bold text-lg ${isClient ? 'text-purple-800' : isProgram ? 'text-blue-800' : isProject ? 'text-indigo-800' : 'text-green-800'}`}>{node.name}</p>
                    {node.role && <p className="text-sm text-gray-600">{node.role}</p>}
                </div>
                {!isClient && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdate({ type: 'DELETE_NODE', id: node.id, nodeType: node.type });
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete item"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
            {node.children && node.children.length > 0 && (
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


