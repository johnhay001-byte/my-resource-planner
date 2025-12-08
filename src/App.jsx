import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Users, 
  Calendar as CalendarIcon, 
  Briefcase, 
  Settings, 
  Plus, 
  Search, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LogOut
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Components ---

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'planner', label: 'Resource Planner', icon: CalendarIcon },
    { id: 'workHub', label: 'Work Hub', icon: Briefcase },
    { id: 'resources', label: 'Team & Assets', icon: Users },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full hidden md:flex shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span>PlanFlow</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Storage Used</p>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div className="bg-emerald-500 h-2 rounded-full w-[75%]"></div>
          </div>
          <p className="text-xs text-right text-slate-400">75%</p>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components for Views ---

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className={`text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {change > 0 ? '+' : ''}{change}%
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);

const Dashboard = ({ tasks, resources }) => {
  const activeTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Resources" value={resources.length} change={12} icon={Users} color="bg-blue-500" />
        <StatCard title="Active Tasks" value={activeTasks} change={5} icon={Clock} color="bg-amber-500" />
        <StatCard title="Completed" value={completedTasks} change={24} icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title="Pending Review" value={pendingTasks} change={-2} icon={AlertCircle} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'completed' ? 'bg-emerald-500' : 
                    task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-300'
                  }`} />
                  <div>
                    <p className="font-medium text-slate-800">{task.title}</p>
                    <p className="text-xs text-slate-500">{new Date(task.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                  {task.status}
                </span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-slate-400 text-center py-4">No recent activity</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Team Availability</h3>
          <div className="space-y-4">
            {resources.slice(0, 5).map(res => (
              <div key={res.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                    {res.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{res.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <span className="text-xs text-slate-500">80%</span>
                </div>
              </div>
            ))}
            {resources.length === 0 && <p className="text-slate-400 text-center py-4">No resources added</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkHub = ({ tasks, resources, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('pending');
  const [newTaskResource, setNewTaskResource] = useState('');

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle,
      status: newTaskStatus,
      resourceId: newTaskResource,
      createdAt: serverTimestamp(),
    });
    setNewTaskTitle('');
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Work Hub</h2>
          <p className="text-slate-500 text-sm">Manage and track project tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        {['all', 'pending', 'in-progress', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-sm group">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <LogOut size={16} />
              </button>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2 truncate" title={task.title}>{task.title}</h3>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                   {resources.find(r => r.id === task.resourceId)?.name?.substring(0,2).toUpperCase() || 'NA'}
                </div>
                <span className="text-xs text-slate-500">
                  {resources.find(r => r.id === task.resourceId)?.name || 'Unassigned'}
                </span>
              </div>
              <select
                value={task.status}
                onChange={(e) => onUpdateTask(task.id, { status: e.target.value })}
                className="text-xs border-none bg-transparent text-right font-medium text-blue-600 cursor-pointer focus:ring-0"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
             <Briefcase size={48} className="mb-4 opacity-50" />
             <p>No tasks found in this view.</p>
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Create New Task</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter task description"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={newTaskStatus}
                      onChange={(e) => setNewTaskStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                    <select
                      value={newTaskResource}
                      onChange={(e) => setNewTaskResource(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                 </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ResourceList = ({ resources, onAddResource, onDeleteResource }) => {
  const [newResName, setNewResName] = useState('');
  const [newResRole, setNewResRole] = useState('Developer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newResName.trim()) return;
    onAddResource({ name: newResName, role: newResRole });
    setNewResName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Team & Assets</h2>
           <p className="text-slate-500 text-sm">Manage your available resources</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Add New Resource</h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Name" 
            value={newResName}
            onChange={(e) => setNewResName(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select 
            value={newResRole}
            onChange={(e) => setNewResRole(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option>Developer</option>
            <option>Designer</option>
            <option>Manager</option>
            <option>Analyst</option>
            <option>Equipment</option>
          </select>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Add Resource
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resources.map(res => (
              <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{res.name}</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {res.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2"></div>
                    <span className="text-sm text-slate-600">Available</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDeleteResource(res.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
               <tr>
                 <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                   No resources found. Add one above.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [resources, setResources] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching
  useEffect(() => {
    if (!user) return;

    // Use a single collection based on user ID for data privacy in this demo
    const resourcesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'resources');
    const tasksRef = collection(db, 'artifacts', appId, 'users', user.uid, 'tasks');

    const unsubResources = onSnapshot(query(resourcesRef), 
      (snapshot) => setResources(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Res err:", err)
    );

    const unsubTasks = onSnapshot(query(tasksRef), 
      (snapshot) => setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Task err:", err)
    );

    return () => {
      unsubResources();
      unsubTasks();
    };
  }, [user]);

  // Handlers
  const addResource = async (data) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'resources'), data);
  };

  const deleteResource = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'resources', id));
  };

  const addTask = async (data) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'), data);
  };

  const updateTask = async (id, data) => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', id), data);
  };

  const deleteTask = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', id));
  };

  if (loading) return <LoadingScreen />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} resources={resources} />;
      case 'workHub':
        return (
          <WorkHub 
            tasks={tasks} 
            resources={resources} 
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        );
      case 'resources':
        return (
          <ResourceList 
            resources={resources} 
            onAddResource={addResource} 
            onDeleteResource={deleteResource} 
          />
        );
      case 'planner':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
             <CalendarIcon size={64} className="mb-4 opacity-20" />
             <h3 className="text-xl font-medium text-slate-600">Planner View</h3>
             <p>This module is currently under development.</p>
          </div>
        );
      default:
        return <Dashboard tasks={tasks} resources={resources} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-2 font-bold text-slate-800">
            <Layout className="w-6 h-6 text-blue-600" />
            <span>PlanFlow</span>
          </div>
          <button className="text-slate-500">
            <MoreVertical />
          </button>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
           {[
             { id: 'dashboard', icon: BarChart3 },
             { id: 'workHub', icon: Briefcase },
             { id: 'resources', icon: Users }
           ].map(item => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}
             >
               <item.icon />
             </button>
           ))}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}