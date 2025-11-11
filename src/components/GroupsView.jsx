import React, { useState, useMemo } from 'react';
import { PlusIcon, TrashIcon, UsersIcon, UserMinusIcon } from './Icons';

// This is the new component for the "Groups" tab
export const GroupsView = ({ allPeople, allGroups, onUpdate }) => {
    const [newGroupName, setNewGroupName] = useState('');

    const handleAddGroup = () => {
        if (!newGroupName.trim()) return;
        onUpdate({ type: 'ADD_GROUP', name: newGroupName.trim() });
        setNewGroupName('');
    };

    // Create a quick lookup map for person details
    const peopleMap = useMemo(() => {
        return new Map(allPeople.map(p => [p.id, p]));
    }, [allPeople]);

    return (
        <div className="space-y-6">
            {/* 1. Create New Group Form */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Create New Group</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g., 'Nike Retained Team' or 'Senior Creatives'"
                        className="flex-grow p-2 border rounded-md"
                    />
                    <button
                        onClick={handleAddGroup}
                        disabled={!newGroupName.trim()}
                        className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" /> Create Group
                    </button>
                </div>
            </div>

            {/* 2. List of Existing Groups */}
            <div className="space-y-4">
                {allGroups.map(group => (
                    <GroupCard 
                        key={group.id} 
                        group={group} 
                        allPeople={allPeople} 
                        peopleMap={peopleMap} 
                        onUpdate={onUpdate} 
                    />
                ))}
            </div>
        </div>
    );
};

// --- Sub-component for each Group ---

const GroupCard = ({ group, allPeople, peopleMap, onUpdate }) => {
    const [selectedPerson, setSelectedPerson] = useState('');

    // Get full person objects for members
    const members = useMemo(() => {
        return (group.members || []).map(id => peopleMap.get(id)).filter(Boolean); // filter(Boolean) removes any undefined
    }, [group.members, peopleMap]);

    // Create a list of people *not* already in this group
    const availablePeople = useMemo(() => {
        const memberIds = new Set(group.members || []);
        return allPeople.filter(p => !memberIds.has(p.id));
    }, [allPeople, group.members]);

    const handleAddMember = () => {
        if (!selectedPerson) return;
        onUpdate({
            type: 'ADD_PERSON_TO_GROUP',
            groupId: group.id,
            personId: selectedPerson
        });
        setSelectedPerson(''); // Reset dropdown
    };

    const handleRemoveMember = (personId) => {
        onUpdate({
            type: 'REMOVE_PERSON_FROM_GROUP',
            groupId: group.id,
            personId: personId
        });
    };

    const handleDeleteGroup = () => {
        if (confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
            onUpdate({ type: 'DELETE_GROUP', groupId: group.id });
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            {/* Group Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <h3 className="text-xl font-bold flex items-center">
                    <UsersIcon className="h-6 w-6 mr-3 text-purple-600" />
                    {group.name}
                </h3>
                <button
                    onClick={handleDeleteGroup}
                    className="p-2 text-gray-500 hover:text-red-600"
                    title="Delete Group"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Add Member Form */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Add a person to this group:</h4>
                <div className="flex gap-2">
                    <select
                        value={selectedPerson}
                        onChange={(e) => setSelectedPerson(e.target.value)}
                        className="flex-grow p-2 border rounded-md bg-gray-50"
                    >
                        <option value="">Select a person...</option>
                        {availablePeople.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.role})</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAddMember}
                        disabled={!selectedPerson}
                        className="px-4 py-2 text-sm font-semibold rounded-md flex items-center bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" /> Add Member
                    </button>
                </div>
            </div>

            {/* Member List */}
            <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Current members:</h4>
                <div className="space-y-2">
                    {members.length > 0 ? members.map(person => (
                        <div key={person.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                            <div>
                                <p className="font-medium">{person.name}</p>
                                <p className="text-xs text-gray-500">{person.role}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveMember(person.id)}
                                className="p-2 text-gray-400 hover:text-red-600"
                                title="Remove member"
                            >
                                <UserMinusIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500 italic">This group has no members yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};