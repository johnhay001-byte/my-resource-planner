import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './Icons';

export const PersonModal = ({ isOpen, onClose, onSave, personData, isSaving }) => {
    const [person, setPerson] = useState({});
    const [skills, setSkills] = useState(''); // State for skills as a string
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setErrorMessage(''); 
            if (personData) {
                setPerson(personData);
                // Convert skills array (from Firestore) to a comma-separated string for the input
                setSkills(personData.skills ? personData.skills.join(', ') : '');
            } else {
                // Default for a new person
                setPerson({
                    name: '',
                    role: '',
                    email: '',
                    clientPrimary: 'unassigned',
                    resourceType: 'Full-Time',
                    tags: [{ type: 'Team', value: 'Account Management' }, { type: 'Location', value: 'London' }],
                    totalMonthlyCost: 5000,
                    billableRatePerHour: 100,
                    skills: [], // Default to empty array
                });
                setSkills(''); // Default to empty string
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

    const handleSkillsChange = (e) => {
        setSkills(e.target.value);
    };

    const handleSave = () => {
        if (!person.name || !person.role || !person.email) {
            setErrorMessage('Please fill in Name, Role, and Email before saving.');
            return;
        }
        
        // Convert the comma-separated string back into an array for Firestore
        const skillsArray = skills.split(',')
                                  .map(s => s.trim())
                                  .filter(s => s.length > 0);
                                  
        onSave({ ...person, skills: skillsArray });
    };

    const getTagValue = (type) => (person.tags?.find(t => t.type === type)?.value || '');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast">
                <h2 className="text-2xl font-bold mb-6">{personData ? 'Edit Person' : 'Add New Person'}</h2>
                <div className="space-y-4">
                    <input type="text" name="name" value={person.name || ''} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded-md" />
                    <input type="email" name="email" value={person.email || ''} onChange={handleChange} placeholder="Email Address" className="w-full p-2 border rounded-md" />
                    <input type="text" name="role" value={person.role || ''} onChange={handleChange} placeholder="Business Title / Role" className="w-full p-2 border rounded-md" />
                    <input type="text" name="Team" value={getTagValue('Team')} onChange={handleTagChange} placeholder="Team / Function" className="w-full p-2 border rounded-md" />
                    
                    {/* --- NEW SKILLS FIELD --- */}
                    <input 
                        type="text" 
                        name="skills" 
                        value={skills} 
                        onChange={handleSkillsChange} 
                        placeholder="Skills (e.g. Figma, Copywriting, Strategy)" 
                        className="w-full p-2 border rounded-md" 
                    />
                    
                     <select name="resourceType" value={person.resourceType || 'Full-Time'} onChange={handleChange} className="w-full p-2 border rounded-md bg-gray-50">
                        <option>Full-Time</option>
                        <option>Contractor</option>
                        <option>Vendor</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="totalMonthlyCost" value={person.totalMonthlyCost || ''} onChange={handleChange} placeholder="Monthly Cost" className="w-full p-2 border rounded-md" />
                        <input type="number" name="billableRatePerHour" value={person.billableRatePerHour || ''} onChange={handleChange} placeholder="Billable Rate (/hr)" className="w-full p-2 border rounded-md" />
                    </div>
                </div>

                {errorMessage && (
                    <div className="mt-4 text-center p-3 bg-red-100 text-red-800 rounded-md text-sm">
                        {errorMessage}
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} disabled={isSaving} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSaving ? <SpinnerIcon className="h-5 w-5 mr-2" /> : null}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};