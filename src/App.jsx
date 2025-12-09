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
  LogOut,
  Database,
  DollarSign,
  Building2,
  Folder,
  FileText,
  CheckSquare,
  Flag,
  List,
  Kanban,
  GanttChart
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
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

// --- Firebase Initialization ---

const getFirebaseConfig = () => {
  try {
    if (typeof __firebase_config !== 'undefined') {
      return JSON.parse(__firebase_config);
    }
    if (import.meta.env?.VITE_FIREBASE_API_KEY) {
      return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
      };
    }
  } catch (e) {
    console.warn("Error parsing firebase config", e);
  }
  return null;
};

const firebaseConfig = getFirebaseConfig();
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

let rawAppId = 'default-app-id';
if (typeof __app_id !== 'undefined' && __app_id) {
  rawAppId = __app_id;
}
const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, '_');

// --- Helper Data for Seeding (DISABLED FOR SPRINT 1) ---

const SAMPLE_ROLES = [
  { title: 'Senior Developer', rate: 150 },
  { title: 'Mid-Level Developer', rate: 100 },
  // ... existing roles hidden to prevent pollution
];

// --- Components ---

const ConfigurationHelp = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white max-w-lg w-full p-8 rounded-xl shadow-xl border border-red-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="text-red-600 w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Connection Error</h2>
      </div>
      <p className="text-slate-600 mb-6 leading-relaxed">
        The application could not connect to Firebase. This usually happens because the configuration keys are missing.
      </p>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <h3 className="font-semibold text-slate-700 mb-2 text-sm">How to fix:</h3>
        <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
          <li>Create a <code>.env.local</code> file in your project root.</li>
          <li>Add your Firebase keys (VITE_FIREBASE_API_KEY, etc).</li>
          <li>Or update <code>App.jsx</code> with your config object directly.</li>
        </ul>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'workHub', label: 'Work Hub', icon: Briefcase },
    { id: 'resources', label: 'Team & Assets', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
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
          <p className="text-xs text-slate-400 mb-1">Sprint 1: Recovery</p>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div className="bg-blue-500 h-2 rounded-full w-[25%]"></div>
          </div>
          <p className="text-xs text-right text-slate-400">Phase 1/3</p>
        </div>
      </div>
    </div>
  );
};

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
  const programs = tasks.filter(t => t.type === 'program').length;
  const projects = tasks.filter(t => t.type === 'project').length;
  
  // Calculate average rate simply for dashboard metric
  const totalBurnRate = resources.reduce((acc, curr) => acc + (parseInt(curr.hourlyRate) || 0), 0);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Resources" value={resources.length} change={0} icon={Users} color="bg-blue-500" />
        <StatCard title="Active Projects" value={projects} change={0} icon={FileText} color="bg-amber-500" />
        <StatCard title="Programs" value={programs} change={0} icon={Folder} color="bg-purple-500" />
        <StatCard title="Total Burn Rate/Hr" value={`$${totalBurnRate}`} change={0} icon={DollarSign} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Work Hierarchy Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
               <div className="flex items-center space-x-3">
                  <Folder className="text-purple-600" size={20}/>
                  <span className="font-medium text-slate-700">Programs</span>
               </div>
               <span className="text-lg font-bold text-slate-800">{programs}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
               <div className="flex items-center space-x-3">
                  <FileText className="text-amber-600" size={20}/>
                  <span className="font-medium text-slate-700">Projects</span>
               </div>
               <span className="text-lg font-bold text-slate-800">{projects}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
               <div className="flex items-center space-x-3">
                  <CheckSquare className="text-blue-600" size={20}/>
                  <span className="font-medium text-slate-700">Tasks</span>
               </div>
               <span className="text-lg font-bold text-slate-800">{tasks.filter(t => !t.type || t.type === 'task').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Work Hub Components ---

const WorkItemIcon = ({ type, isMilestone }) => {
  if (isMilestone) return <Flag size={16} className="text-red-500" />;
  switch (type) {
    case 'program': return <Folder size={16} className="text-purple-600" />;
    case 'project': return <FileText size={16} className="text-amber-600" />;
    default: return <CheckSquare size={16} className="text-blue-600" />;
  }
};

const AddWorkItemModal = ({ isOpen, onClose, onAdd, resources, items }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('task');
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState('pending');
  const [resourceId, setResourceId] = useState('');
  const [isMilestone, setIsMilestone] = useState(false);
  const [clientName, setClientName] = useState('');

  // Filter potential parents based on selected type
  const potentialParents = useMemo(() => {
    if (type === 'project') return items.filter(i => i.type === 'program');
    if (type === 'task') return items.filter(i => i.type === 'project' || i.type === 'program');
    return [];
  }, [type, items]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      title,
      type,
      parentId: parentId || null,
      status,
      resourceId,
      isMilestone,
      clientName,
      createdAt: serverTimestamp()
    });
    onClose();
    // Reset form
    setTitle('');
    setType('task');
    setParentId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-slate-800">Add Work Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Item Type</label>
              <select 
                value={type} 
                onChange={(e) => { setType(e.target.value); setParentId(''); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="program">Program</option>
                <option value="project">Project</option>
                <option value="task">Task</option>
              </select>
            </div>
            
            {(type === 'task' || type === 'project') && (
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Flag As</label>
                  <label className="flex items-center space-x-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={isMilestone} 
                      onChange={(e) => setIsMilestone(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">Milestone</span>
                  </label>
               </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder={`Enter ${type} name`}
              required
            />
          </div>

          {/* Parent Selector - Only show if valid parents exist */}
          {potentialParents.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Parent (Optional)</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- No Parent (Top Level) --</option>
                {potentialParents.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.type === 'program' ? '[Prg] ' : '[Prj] '} {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Client (Optional)</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Acme Corp"
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Assignee</label>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Unassigned</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkHub = ({ tasks, resources, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [viewMode, setViewMode] = useState('list'); // list, board, calendar, gantt
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Views ---

  const ListView = () => {
    // 1. Build Tree Hierarchy in Memory
    const rootItems = tasks.filter(t => !t.parentId);
    
    const renderRow = (item, level = 0) => {
       const children = tasks.filter(t => t.parentId === item.id);
       const hasChildren = children.length > 0;
       
       return (
         <React.Fragment key={item.id}>
           <tr className="hover:bg-slate-50 border-b border-slate-100 last:border-0 group">
             <td className="py-3 px-4">
               <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
                 {/* Visual connector lines could go here */}
                 <div className="mr-2 opacity-70">
                   <WorkItemIcon type={item.type || 'task'} isMilestone={item.isMilestone} />
                 </div>
                 <span className={`text-sm ${item.type === 'program' ? 'font-bold text-slate-800' : item.type === 'project' ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>
                   {item.title}
                 </span>
               </div>
             </td>
             <td className="py-3 px-4">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                  {item.type || 'task'}
                </span>
             </td>
             <td className="py-3 px-4 text-xs text-slate-500">{item.clientName || '-'}</td>
             <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                   {item.resourceId && (
                     <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-bold text-blue-700">
                       {resources.find(r => r.id === item.resourceId)?.name?.substring(0,2).toUpperCase()}
                     </div>
                   )}
                   <span className="text-xs text-slate-600">{resources.find(r => r.id === item.resourceId)?.name || '-'}</span>
                </div>
             </td>
             <td className="py-3 px-4">
                <select
                  value={item.status}
                  onChange={(e) => onUpdateTask(item.id, { status: e.target.value })}
                  className="text-xs border-none bg-transparent font-medium text-slate-600 cursor-pointer focus:ring-0 py-0 pl-0"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
             </td>
             <td className="py-3 px-4 text-right">
                <button onClick={() => onDeleteTask(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <LogOut size={14} />
                </button>
             </td>
           </tr>
           {children.map(child => renderRow(child, level + 1))}
         </React.Fragment>
       );
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
            <tr>
              <th className="py-3 px-4 font-semibold w-1/3">Item Name</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Client</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rootItems.length > 0 ? rootItems.map(item => renderRow(item)) : (
              <tr><td colSpan="6" className="py-8 text-center text-slate-400">No work items found. Add a Program or Project to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const BoardView = () => {
    // For Board view, we might flatten the list or just show tasks. 
    // For Sprint 1, let's show everything flattened by status.
    const columns = ['pending', 'in-progress', 'completed'];
    return (
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map(status => (
          <div key={status} className="flex-1 min-w-[300px] bg-slate-100 rounded-xl p-3 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
               <h4 className="font-semibold text-slate-700 capitalize">{status.replace('-', ' ')}</h4>
               <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                 {tasks.filter(t => t.status === status).length}
               </span>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1">
              {tasks.filter(t => t.status === status).map(item => (
                <div key={item.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-2">
                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${
                        item.type === 'program' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        item.type === 'project' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                     }`}>
                       {item.type || 'task'}
                     </span>
                     {item.isMilestone && <Flag size={12} className="text-red-500" />}
                  </div>
                  <h5 className="font-medium text-slate-800 text-sm mb-1">{item.title}</h5>
                  {item.clientName && <div className="flex items-center text-xs text-slate-400 mb-2"><Building2 size={10} className="mr-1"/>{item.clientName}</div>}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
                     <div className="flex items-center space-x-1">
                       {item.resourceId ? (
                         <>
                           <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                             {resources.find(r => r.id === item.resourceId)?.name?.substring(0,1)}
                           </div>
                           <span className="text-[10px] text-slate-500">{resources.find(r => r.id === item.resourceId)?.name}</span>
                         </>
                       ) : <span className="text-[10px] text-slate-400 italic">Unassigned</span>}
                     </div>
                     <button onClick={() => onDeleteTask(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                        <LogOut size={12} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const PlaceholderView = ({ name, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
      <Icon size={48} className="mb-4 opacity-20" />
      <h3 className="text-xl font-medium text-slate-600">{name} View</h3>
      <p>Coming in Sprint 2: Time-based visualization of your data.</p>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Work Hub</h2>
          <p className="text-slate-500 text-sm">Manage Programs, Projects, and Tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={18} />
          <span>Add Item</span>
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit shadow-sm">
        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="List View"><List size={18}/></button>
        <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Board View"><Kanban size={18}/></button>
        <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Calendar View"><CalendarIcon size={18}/></button>
        <button onClick={() => setViewMode('gantt')} className={`p-2 rounded-md transition-all ${viewMode === 'gantt' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Gantt View"><GanttChart size={18}/></button>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' && <ListView />}
        {viewMode === 'board' && <BoardView />}
        {viewMode === 'calendar' && <PlaceholderView name="Calendar" icon={CalendarIcon} />}
        {viewMode === 'gantt' && <PlaceholderView name="Gantt & Timeline" icon={GanttChart} />}
      </div>

      <AddWorkItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddTask} 
        resources={resources}
        items={tasks} // Pass all items to determine potential parents
      />
    </div>
  );
};

// ... ResourceList and SettingsView components remain similar ...
// ... I will render SettingsView but with Seeder disabled logic

const SettingsView = ({ onSeedData, isSeeding }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Settings & Administration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
             <div className="bg-slate-100 p-2 rounded-lg">
                <Database className="text-slate-400 w-6 h-6" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Test Data Seeder</h3>
          </div>
          <p className="text-slate-600 mb-6 text-sm">
            <span className="font-bold text-red-500">DISABLED:</span> The data seeder has been disabled to prevent pollution of your live production data. 
          </p>
          
          <button 
            disabled={true}
            className="w-full py-3 rounded-lg font-medium bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center space-x-2"
          >
             <Database size={18} />
             <span>Generation Disabled</span>
          </button>
        </div>
      </div>
    </div>
  )
};

const ResourceList = ({ resources, onAddResource, onDeleteResource }) => {
  const [newResName, setNewResName] = useState('');
  const [newResRole, setNewResRole] = useState(SAMPLE_ROLES[0].title);
  const [newResRate, setNewResRate] = useState(SAMPLE_ROLES[0].rate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newResName.trim()) return;
    onAddResource({ 
      name: newResName, 
      role: newResRole, 
      hourlyRate: parseInt(newResRate) || 0 
    });
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
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              value={newResName}
              onChange={(e) => setNewResName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="w-full md:w-48">
             <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Role</label>
             <input 
              type="text"
              value={newResRole}
              onChange={(e) => setNewResRole(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              placeholder="Role Title"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Rate ($/hr)</label>
            <input 
              type="number" 
              value={newResRate}
              onChange={(e) => setNewResRate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full md:w-auto">
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
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
                <td className="px-6 py-4 text-slate-600 font-mono">
                  ${res.hourlyRate}/hr
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
                 <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
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
  const [isSeeding, setIsSeeding] = useState(false);

  // Authentication
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
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
    if (!user || !db) return;

    // Use a single collection based on user ID for data privacy in this demo
    const resourcesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'resources');
    // Using orderBy createdAt to keep list stable
    const tasksRef = query(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));

    const unsubResources = onSnapshot(query(resourcesRef), 
      (snapshot) => setResources(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Res err:", err)
    );

    const unsubTasks = onSnapshot(tasksRef, 
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

  // Seeding Logic (REMOVED)
  const seedData = async () => {
    // Disabled
  };

  if (!auth) return <ConfigurationHelp />;
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
      case 'settings':
        return (
          <SettingsView onSeedData={seedData} isSeeding={isSeeding} />
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
             { id: 'resources', icon: Users },
             { id: 'settings', icon: Settings }
           ].map(item => {
             const Icon = item.icon;
             return (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={`${activeTab === item.id ? 'text-blue-600' : 'text-slate-400'}`}
               >
                 <Icon size={24} />
               </button>
             );
           })}
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