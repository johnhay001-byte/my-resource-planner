import React, { useState, useMemo } from 'react';
import { PlusIcon, MessageSquareIcon, EditIcon, BriefcaseIcon, UserCheckIcon, SearchIcon } from './Icons';

const formatDate = (dateString) => {
    // ... (no change)
};

// ▼▼▼ Add currentUser as a prop ▼▼▼
export const WorkHub = ({ clients, programs, projects, tasks, allPeople, onUpdate, currentUser }) => {
    const [hubView, setHubView] = useState('allProjects');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // ▼▼▼ CHANGE THIS LOGIC ▼▼▼
    // Find the user's profile from the 'people' list by matching the logged-in user's email
    const currentUserProfile = useMemo(() => {
        if (!currentUser) return null;
        return allPeople.find(p => p.email === currentUser.email);
    }, [allPeople, currentUser]);

    const myTasks = useMemo(() => {
        // Use the found profile to filter tasks
        if (!currentUserProfile) return [];
        let filtered = tasks.filter(t => t.assigneeId === currentUserProfile.id);
        
        if (statusFilter !== 'All') {
            filtered = filtered.filter(t => t.status === statusFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return filtered;
    }, [tasks, currentUserProfile, searchTerm, statusFilter]);
    
    const projectsWithTasks = useMemo(() => {
        // ... (no change)
    }, [projects, tasks]);

    const displayedProjects = useMemo(() => {
        // ... (no change)
    }, [projectsWithTasks, searchTerm, statusFilter]);

    const renderAllProjects = () => (
        // ... (no change)
    );

    const renderMyTasks = () => (
        <div className="bg-white rounded-lg shadow-md p-6">
            {/* ▼▼▼ Update the header to be dynamic ▼▼▼ */}
            <h3 className="text-xl font-bold mb-4">
                Tasks for {currentUserProfile ? currentUserProfile.name : (currentUser?.email || 'Me')}
            </h3>
            <div className="space-y-3">
                {myTasks.map(task => (
                    <TaskItem key={task.id} task={task} allPeople={allPeople} onUpdate={onUpdate} showProject />
                ))}
                {myTasks.length === 0 && <p className="text-center text-gray-500 py-10">
                    {currentUserProfile ? 'You have no tasks matching the current filters.' : 'Could not find your user profile. Make sure your login email matches a user in the Team list.'}
                </p>}
            </div>
        </div>
    );

    return (
        <div className="p-8">
            {/* ... (no change to header or filter controls) ... */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Work Hub</h2>
                    <p className="text-gray-600">A central place to view all ongoing work.</p>
                </div>
                 <div className="flex items-center space-x-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setHubView('allProjects')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'allProjects' ? 'bg-white text-purple-700 shadow' : 'text-transparent text-gray-600'}`}>
                        <BriefcaseIcon className="h-5 w-5 mr-2" /> All Projects
                    </button>
                    <button onClick={() => setHubView('myTasks')} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-colors ${hubView === 'myTasks' ? 'bg-white text-purple-700 shadow' : 'text-transparent text-gray-600'}`}>
                        <UserCheckIcon className="h-5 w-5 mr-2" /> My Tasks
                    </button>
                </div>
            </div>
            <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-grow">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={hubView === 'allProjects' ? "Search projects or tasks..." : "Search my tasks..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 pl-10 border rounded-md"
                    />
                </div>
                <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                    <span className="text-sm font-semibold text-gray-600 px-2">Status:</span>
                    {['All', 'To Do', 'In Progress', 'Done'].map(status => (
                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-3 py-1 text-sm font-semibold rounded-md ${statusFilter === status ? 'bg-white text-purple-700 shadow' : 'text-transparent text-gray-600'}`}>
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {hubView === 'allProjects' ? renderAllProjects() : renderMyTasks()}
        </div>
    );
};

// ... (No change to ProjectCard or TaskItem components) ...

const ProjectCard = ({ project, allPeople, onUpdate }) => {
    // ... (no change)
};

const TaskItem = ({ task, allPeople, onUpdate, showProject }) => {
    // ... (no change)
};
```

---

### How to Test This

1.  **Go to your Firebase Console:**
    * Find your project.
    * Go to the **Authentication** section and enable the **Email/Password** sign-in method.
    * Go to the **Users** tab and click "Add user". Create a new user with an email and password.
2.  **Go to your Firestore Database:**
    * Find the `people` collection.
    * Find the "Adena Phillips" document (or any user you want to test with).
    * Make sure her `email` field matches **exactly** the email of the user you just created in Firebase Authentication.
3.  **Run the app:**
    * You should be redirected to the new Login screen.
    * Log in with the user you created.
    * Go to the "Work Hub" and click "My Tasks". You should now see the tasks assigned to that user.
    * Click the "Sign Out" button to return to the login screen.

---

### Ready to Commit

Here are the `bash` commands to commit this new feature.

```bash
git add .
```
```bash
git commit -m "Feat: Implement Firebase Authentication and dynamic 'My Tasks' view"

