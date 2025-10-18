import React, { useState, useEffect } from 'react';

export const PersonModal = ({ isOpen, onClose, onSave, personData }) => {
    const [person, setPerson] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (personData) {
                setPerson(personData);
            } else {
                // Default for a new person
                setPerson({
                    name: '',
                    role: '',
                    email: '',
                    clientPrimary: 'unassigned',
                    resourceType: 'Full-Time', // Default resource type
                    tags: [{ type: 'Team', value: 'Account Management' }, { type: 'Location', value: 'London' }],
                    totalMonthlyCost: 5000,
                    billableRatePerHour: 100,
                });
            }
        }
    }, [personData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPerson(prev => ({ ...prev, [name]: value }));
    };

    const handleTagChange = (e) => {
        const { name, value } = e.target;
        setPerson(prev => ({
            ...prev,
            tags: (prev.tags || []).map(tag => tag.type === name ? { ...tag, value } : tag)
        }));
    };

    const handleSave = () => {
        if (!person.name || !person.role || !person.email) {
            alert('Please fill in Name, Role, and Email.');
            return;
        }
        onSave(person);
    };

    const team = (person.tags || []).find(t => t.type === 'Team')?.value || '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast">
                <h2 className="text-2xl font-bold mb-6">{personData ? 'Edit Person' : 'Add New Person'}</h2>
                <div className="space-y-4">
                    <input type="text" name="name" value={person.name || ''} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded-md" />
                    <input type="email" name="email" value={person.email || ''} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded-md" />
                    <input type="text" name="role" value={person.role || ''} onChange={handleChange} placeholder="Business Title / Role" className="w-full p-2 border rounded-md" />
                    <input type="text" name="Team" value={team} onChange={handleTagChange} placeholder="Team / Function" className="w-full p-2 border rounded-md" />
                     <select name="resourceType" value={person.resourceType || 'Full-Time'} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50">
                        <option>Full-Time</option>
                        <option>Contractor</option>
                        <option>Vendor</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="totalMonthlyCost" value={person.totalMonthlyCost || 0} onChange={handleChange} placeholder="Monthly Cost" className="w-full p-2 border rounded-md" />
                        <input type="number" name="billableRatePerHour" value={person.billableRatePerHour || 0} onChange={handleChange} placeholder="Billable Rate (/hr)" className="w-full p-2 border rounded-md" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-md">Save</button>
                </div>
            </div>
        </div>
    );
};

