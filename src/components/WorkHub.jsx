import React, { useState } from 'react';

export const WorkHub = ({ programs, projects, tasks, allPeople, onUpdate }) => {
    // We will build out the interactive features here in the next steps.
    // For now, it will just show placeholder text.

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Work Hub</h2>
            <div className="bg-white p-8 rounded-lg border">
                <p className="text-gray-500">This page will contain all the tools for managing programs, projects, and tasks.</p>
            </div>
        </div>
    );
};
