import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  GanttChart,
  Sparkles,
  ArrowRight,
  TrendingDown,
  UserPlus,
  WifiOff,
  Terminal,
  AlertTriangle,
  Tag,
  MessageSquare,
  Send,
  Sliders,
  History,
  Lightbulb,
  FilePlus,
  Link as LinkIcon,
  X,
  ExternalLink
} from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
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
  orderBy,
  writeBatch,
  arrayUnion
} from 'firebase/firestore';

// --- Firebase Initialization ---

// Initialize variables
let app = null;
let auth = null;
let db = null;
let initError = null;

const getFirebaseConfig = () => {
  try {
    let config = null;
    if (typeof __firebase_config !== 'undefined') {
      config = __firebase_config;
    } else if (typeof window !== 'undefined' && window.__firebase_config) {
      config = window.__firebase_config;
    }

    if (!config) return null;

    // Handle both stringified JSON and direct Object
    return typeof config === 'string' ? JSON.parse(config) : config;
  } catch (e) {
    console.error("Config parse error:", e);
    initError = e.message;
    return null;
  }
};

const initFirebase = (manualConfig = null) => {
  try {
    const config = manualConfig || getFirebaseConfig();
    if (!config) {
      if (!initError) initError = "Configuration not found in environment.";
      return false;
    }

    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    initError = null;
    return true;
  } catch (e) {
    console.error("Firebase init failed:", e);
    initError = e.message;
    return false;
  }
};

// Initial attempt
initFirebase();

let rawAppId = 'default-app-id';
if (typeof __app_id !== 'undefined' && __app_id) {
  rawAppId = __app_id;
}
const appId = rawAppId.replace(/[^a-zA-Z0-9_-]/g, '_');

// --- Helper Functions ---

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(date);
};

// --- Components ---

const ConfigurationHelp = ({ onRetry, onDemoMode, onManualConfig, errorMsg }) => {
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState('');

  const handleManualSubmit = () => {
    try {
      let input = manualInput.trim();
      input = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      
      let configString = null;
      const varMatch = input.match(/firebaseConfig\s*=\s*(\{[\s\S]*?\})/);
      if (varMatch && varMatch[1]) configString = varMatch[1];

      if (!configString) {
         const apiKeyIndex = input.indexOf('apiKey');
         if (apiKeyIndex !== -1) {
            let openBraceIndex = input.lastIndexOf('{', apiKeyIndex);
            if (openBraceIndex !== -1) {
               let balance = 1;
               let closeBraceIndex = -1;
               for (let i = openBraceIndex + 1; i < input.length; i++) {
                  if (input[i] === '{') balance++;
                  if (input[i] === '}') balance--;
                  if (balance === 0) {
                     closeBraceIndex = i;
                     break;
                  }
               }
               if (closeBraceIndex !== -1) configString = input.substring(openBraceIndex, closeBraceIndex + 1);
            }
         }
      }

      if (!configString && input.trim().startsWith('{')) configString = input;

      if (!configString) throw new Error("Could not locate a valid configuration object.");
      
      const config = new Function(`return ${configString}`)();
      if (!config.apiKey || !config.projectId) throw new Error("Configuration object is missing required fields.");

      onManualConfig(config);
    } catch (e) {
      console.error(e);
      setManualError("Could not parse configuration. Please make sure your paste includes the 'firebaseConfig' object.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full p-8 rounded-xl shadow-xl border border-red-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="text-red-600 w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Connection Error</h2>
        </div>
        
        {!showManual ? (
          <>
            <p className="text-slate-600 mb-4 leading-relaxed">
              The application could not connect to the cloud database.
            </p>
            {errorMsg && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-6">
                <p className="text-xs font-mono text-red-700 break-words">{errorMsg}</p>
              </div>
            )}
            <div className="space-y-3">
              <button onClick={onRetry} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Retry Connection</button>
              <button onClick={() => setShowManual(true)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"><Terminal size={18} /> Enter Configuration Manually</button>
              <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-slate-200"></div><span className="flex-shrink mx-4 text-slate-400 text-xs">OR</span><div className="flex-grow border-t border-slate-200"></div></div>
              <button onClick={onDemoMode} className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"><WifiOff size={18} /> Use Demo Mode (Offline)</button>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-2">
               <label className="text-sm font-semibold text-slate-700">Paste Firebase Config</label>
               <button onClick={() => setShowManual(false)} className="text-xs text-blue-600 hover:underline">Cancel</button>
            </div>
            <textarea value={manualInput} onChange={(e) => { setManualInput(e.target.value); setManualError(''); }} className="w-full h-48 p-3 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50" placeholder={'const firebaseConfig = {\n  apiKey: "AIza...",\n  authDomain: "..."\n};'} />
            {manualError && <p className="text-xs text-red-600 mt-2">{manualError}</p>}
            <button onClick={handleManualSubmit} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Connect manually</button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingScreen = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="text-slate-500 text-sm animate-pulse">{message}</p>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab, isDemoMode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'intake', label: 'Brief Intake', icon: FilePlus },
    { id: 'workHub', label: 'Work Hub', icon: Briefcase },
    { id: 'enrichment', label: 'Enrichment', icon: Sparkles },
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
        {isDemoMode && (
          <div className="mt-2 px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded text-amber-500 text-xs font-medium text-center">
            Demo Mode (Offline)
          </div>
        )}
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
              <Icon size={20} className={item.id === 'enrichment' ? 'text-purple-400' : ''} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Sprint 3: Collaboration</p>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div className="bg-emerald-500 h-2 rounded-full w-[80%]"></div>
          </div>
          <p className="text-xs text-right text-slate-400">Phase 3/3</p>
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
  const projects = tasks.filter(t => t.type === 'project').length;
  const programs = tasks.filter(t => t.type === 'program').length;
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

// --- Intake View (New) ---

const IntakeView = ({ existingTasks, onAddProject }) => {
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [insights, setInsights] = useState(null);
  const [similarProjects, setSimilarProjects] = useState([]);

  // Intelligent Brief Enrichment: Watch client name and description
  useEffect(() => {
    // 1. Client History Insights
    if (!clientName || clientName.length < 3) {
      setInsights(null);
    } else {
      const pastProjects = existingTasks.filter(t => 
        t.type === 'project' && 
        t.clientName && 
        t.clientName.toLowerCase().includes(clientName.toLowerCase())
      );

      if (pastProjects.length > 0) {
        const avgDuration = pastProjects.reduce((acc, curr) => {
          const start = new Date(curr.startDate);
          const end = new Date(curr.endDate);
          return acc + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / pastProjects.length;

        const relatedTasks = existingTasks.filter(t => t.type === 'task' && pastProjects.some(p => p.id === t.parentId));
        const skillsUsed = new Set();
        relatedTasks.forEach(t => t.requiredSkills?.forEach(s => skillsUsed.add(s)));

        setInsights({
          projectCount: pastProjects.length,
          avgDuration: Math.round(avgDuration),
          commonSkills: Array.from(skillsUsed).slice(0, 5),
          lastProject: pastProjects[0].title
        });
      } else {
        setInsights(null);
      }
    }

    // 2. Cross-Client "Similar Briefs" Analysis
    // Look for keywords from current input in ALL past projects (ignoring current client filter)
    if (projectName.length > 3 || description.length > 10) {
       const searchTerms = (projectName + ' ' + description).toLowerCase().split(' ').filter(w => w.length > 4);
       
       if (searchTerms.length > 0) {
          const matches = existingTasks.filter(t => {
             if (t.type !== 'project') return false;
             // Don't match self if editing (future proofing) or same client if looking for "net new" insights
             if (t.clientName && clientName && t.clientName.toLowerCase() === clientName.toLowerCase()) return false;
             
             const targetText = (t.title + ' ' + (t.description || '')).toLowerCase();
             // Simple "at least one keyword match" logic
             return searchTerms.some(term => targetText.includes(term));
          }).slice(0, 3); // Top 3 similar
          
          setSimilarProjects(matches);
       }
    } else {
       setSimilarProjects([]);
    }

  }, [clientName, projectName, description, existingTasks]);

  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newLink.trim()) return;
    setLinks([...links, { url: newLink, name: newLink }]);
    setNewLink('');
  };

  const removeLink = (idx) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProject({
      title: projectName,
      type: 'project',
      clientName: clientName,
      status: 'pending',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      description: description,
      attachments: links
    });
    setClientName('');
    setProjectName('');
    setDescription('');
    setLinks([]);
    setInsights(null);
    alert("Brief created and added to Work Hub!");
  };

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 bg-white p-8 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create New Brief</h2>
        <p className="text-slate-500 mb-8">Initiate a new project request. The system will analyze your input to provide historical context.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Client Name</label>
              <input 
                type="text" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Acme Corp"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Project Title</label>
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Q3 Marketing Campaign"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Brief Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              placeholder="Describe the goals and deliverables..."
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Reference Materials</label>
             <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="flex-1 p-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                  placeholder="Paste URL to assets (Drive, Dropbox, Figma)..."
                />
                <button onClick={handleAddLink} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">Add Link</button>
             </div>
             {links.length > 0 && (
                <div className="space-y-2">
                   {links.map((link, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                         <div className="flex items-center gap-2 overflow-hidden">
                            <LinkIcon size={14} className="text-blue-500 flex-shrink-0"/>
                            <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate">{link.url}</a>
                         </div>
                         <button type="button" onClick={() => removeLink(idx)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                      </div>
                   ))}
                </div>
             )}
          </div>

          <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <FilePlus size={18} />
            Create Brief
          </button>
        </form>
      </div>

      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-full overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Lightbulb className="text-amber-500" />
            <h3 className="font-bold">Brief Intelligence</h3>
          </div>
          
          <div className="space-y-6">
            {/* 1. Client History Section */}
            {insights ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Client History</p>
                  <p className="text-sm text-slate-700">Worked on <span className="font-bold text-blue-600">{insights.projectCount} projects</span> with {clientName}.</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Avg Duration</p>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <p className="text-sm font-bold text-slate-800">{insights.avgDuration} days</p>
                  </div>
                </div>

                {insights.commonSkills.length > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Common Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {insights.commonSkills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded border border-purple-100">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white/50 border border-slate-200 rounded-lg text-center text-slate-400 text-xs italic">
                Enter a Client Name to see relationship history.
              </div>
            )}

            {/* 2. Cross-Client "Similar Briefs" Section */}
            {similarProjects.length > 0 && (
               <div className="space-y-4 animate-in fade-in duration-500 border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-2 text-slate-800">
                     <Sparkles size={16} className="text-purple-500" />
                     <h4 className="font-bold text-sm">Similar Past Briefs</h4>
                  </div>
                  <p className="text-xs text-slate-500">Based on your description, similar work was done for other clients:</p>
                  
                  {similarProjects.map(proj => (
                     <div key={proj.id} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm hover:border-purple-300 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                           <span className="font-semibold text-slate-700 text-sm group-hover:text-purple-700">{proj.title}</span>
                           <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{proj.clientName}</span>
                        </div>
                        {proj.description && (
                           <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proj.description}</p>
                        )}
                        <div className="mt-2 text-xs text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <ExternalLink size={10} /> View details
                        </div>
                     </div>
                  ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Task Detail Modal (New) ---

const TaskDetailModal = ({ task, isOpen, onClose, resources, onUpdate, onAddComment }) => {
  if (!isOpen || !task) return null;

  const [commentText, setCommentText] = useState('');
  const [progress, setProgress] = useState(task.progress || 0);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(task.id, commentText);
    setCommentText('');
  };

  const handleProgressChange = (val) => {
    setProgress(val);
    onUpdate(task.id, { progress: parseInt(val) });
  };

  // Simple mention highlighting
  const renderComment = (text) => {
    return text.split(/(@\w+)/g).map((part, i) => 
      part.startsWith('@') ? <span key={i} className="text-blue-600 font-semibold bg-blue-50 px-1 rounded">{part}</span> : part
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden">
        {/* Left: Details */}
        <div className="w-2/3 p-8 overflow-y-auto border-r border-slate-100">
          <div className="flex justify-between items-start mb-6">
             <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{task.type}</span>
                   {task.clientName && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">{task.clientName}</span>}
                </div>
                <h2 className="text-3xl font-bold text-slate-800">{task.title}</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><LogOut size={20}/></button>
          </div>

          <div className="space-y-8">
            {task.description && (
               <div className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {task.description}
               </div>
            )}

            {task.attachments && task.attachments.length > 0 && (
               <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Attachments</h4>
                  <div className="grid grid-cols-2 gap-2">
                     {task.attachments.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 text-blue-600 text-sm truncate">
                           <LinkIcon size={14} />
                           <span className="truncate">{link.url}</span>
                        </a>
                     ))}
                  </div>
               </div>
            )}

            {/* Progress Section */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
               <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-slate-700 flex items-center gap-2"><Sliders size={16}/> Progress Tracking</label>
                  <span className="text-blue-600 font-bold">{progress}%</span>
               </div>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={progress} 
                 onChange={(e) => handleProgressChange(e.target.value)}
                 className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
               />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select 
                    value={task.status}
                    onChange={(e) => onUpdate(task.id, { status: e.target.value })}
                    className="mt-1 block w-full p-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Assignee</label>
                  <div className="mt-2 flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                       {resources.find(r => r.id === task.resourceId)?.name?.substring(0,2).toUpperCase() || '?'}
                     </div>
                     <span className="text-sm text-slate-700">{resources.find(r => r.id === task.resourceId)?.name || 'Unassigned'}</span>
                  </div>
               </div>
            </div>

            <div>
               <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Required Skills</label>
               <div className="flex flex-wrap gap-2">
                  {task.requiredSkills?.map(s => (
                    <span key={s} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-100">{s}</span>
                  ))}
                  {(!task.requiredSkills || task.requiredSkills.length === 0) && <span className="text-sm text-slate-400 italic">No specific skills listed.</span>}
               </div>
            </div>
          </div>
        </div>

        {/* Right: Collaboration */}
        <div className="w-1/3 bg-slate-50 flex flex-col">
           <div className="p-4 border-b border-slate-200 bg-white">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={18}/> Comments</h3>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((c, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                     <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">{c.userName || 'User'}</span>
                        <span className="text-[10px] text-slate-400">{getRelativeTime(c.createdAt)}</span>
                     </div>
                     <p className="text-slate-600">{renderComment(c.text)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-400 mt-10">
                   <p>No comments yet.</p>
                   <p className="text-xs">Mention colleagues using '@'</p>
                </div>
              )}
           </div>

           <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                 <input 
                   type="text" 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   placeholder="Write a comment... use @name to tag"
                   className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                 />
                 <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Send size={16} />
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Enrichment Feature ---

const EnrichmentView = ({ tasks, resources, onUpdateTask }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Artificial Intelligence "Simulation" for Enrichment
    const generateInsights = () => {
      const insights = [];
      
      // 1. Skill Gap Analysis (High Priority)
      const assignedTasks = tasks.filter(t => t.resourceId && t.type === 'task');
      assignedTasks.forEach(task => {
        const resource = resources.find(r => r.id === task.resourceId);
        const required = task.requiredSkills || [];
        
        if (resource && required.length > 0) {
           const rSkills = resource.skills || [];
           const missing = required.filter(req => !rSkills.some(rs => rs.toLowerCase() === req.toLowerCase()));
           
           if (missing.length > 0) {
             insights.push({
               id: `gap-${task.id}`,
               priority: 1,
               type: 'risk',
               title: 'Skill Gap Detected',
               description: `${resource.name} is assigned to "${task.title}" but lacks required skills: ${missing.join(', ')}. This poses a risk to delivery.`,
               action: 'Reassign',
               icon: AlertTriangle,
               color: 'text-amber-600',
               bgColor: 'bg-amber-50',
               taskId: task.id,
               resourceId: null // Trigger reassign flow
             });
           }
        }
      });

      // 2. Smart Assignment (Unassigned Tasks with Requirements)
      const unassignedTasks = tasks.filter(t => !t.resourceId && t.type === 'task' && t.status !== 'completed');
      unassignedTasks.forEach(task => {
        const required = task.requiredSkills || [];
        
        if (required.length > 0) {
           // Find resources with ALL required skills
           const fullyQualified = resources.filter(r => {
              const rSkills = r.skills || [];
              return required.every(req => rSkills.some(rs => rs.toLowerCase() === req.toLowerCase()));
           });

           if (fullyQualified.length > 0) {
              // Sort by rate (cheapest first)
              const bestMatch = fullyQualified.sort((a, b) => a.hourlyRate - b.hourlyRate)[0];
              insights.push({
                id: `smart-assign-${task.id}`,
                priority: 2,
                type: 'assignment',
                title: 'Perfect Skill Match',
                description: `"${task.title}" requires ${required.join(', ')}. ${bestMatch.name} has these skills and is available at $${bestMatch.hourlyRate}/hr.`,
                action: 'Assign Resource',
                icon: Sparkles,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                taskId: task.id,
                resourceId: bestMatch.id
              });
           }
        } else {
           // Fallback to simple cheapest logic
           const sortedResources = [...resources].sort((a, b) => a.hourlyRate - b.hourlyRate);
           const bestMatch = sortedResources[0];
           if (bestMatch) {
             insights.push({
                id: `assign-${task.id}`,
                priority: 3,
                type: 'assignment',
                title: 'Unassigned Task Opportunity',
                description: `"${task.title}" is unassigned. ${bestMatch.name} is your most cost-effective option at $${bestMatch.hourlyRate}/hr.`,
                action: 'Assign Resource',
                icon: UserPlus,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                taskId: task.id,
                resourceId: bestMatch.id
             });
           }
        }
      });

      // 3. Cost Optimization (High Rate on Simple Task) - Only if skills match or aren't required
      assignedTasks.forEach(task => {
        const resource = resources.find(r => r.id === task.resourceId);
        const required = task.requiredSkills || [];
        
        if (resource && resource.hourlyRate > 150) {
           // Find cheaper alternative that ALSO meets skill requirements
           const cheaper = resources.find(r => {
              const rSkills = r.skills || [];
              const hasSkills = required.every(req => rSkills.some(rs => rs.toLowerCase() === req.toLowerCase()));
              return r.hourlyRate < 100 && r.role === resource.role && hasSkills;
           });

           if (cheaper) {
             insights.push({
               id: `optimize-${task.id}`,
               priority: 4,
               type: 'optimization',
               title: 'Budget Optimization',
               description: `Switching "${task.title}" from ${resource.name} ($${resource.hourlyRate}) to ${cheaper.name} ($${cheaper.hourlyRate}) saves ${(resource.hourlyRate - cheaper.hourlyRate)/resource.hourlyRate * 100}% cost while maintaining skill requirements.`,
               action: 'Swap Resource',
               icon: TrendingDown,
               color: 'text-emerald-600',
               bgColor: 'bg-emerald-50',
               taskId: task.id,
               resourceId: cheaper.id
             });
           }
        }
      });

      setRecommendations(insights.sort((a, b) => a.priority - b.priority));
    };

    generateInsights();
  }, [tasks, resources]);

  const handleApply = (rec) => {
    if (rec.resourceId) {
       onUpdateTask(rec.taskId, { resourceId: rec.resourceId });
       setRecommendations(prev => prev.filter(r => r.id !== rec.id));
    } else {
       alert("Please go to Work Hub to reassign this task manually.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-purple-600" />
            Enrichment Engine
          </h2>
          <p className="text-slate-500 text-sm">AI-driven insights to optimize your resource allocation based on <span className="font-semibold text-purple-600">Skills</span> and <span className="font-semibold text-emerald-600">Cost</span>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {recommendations.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500 opacity-50" />
            <h3 className="text-lg font-medium">All Systems Optimized</h3>
            <p>No gaps, unassigned tasks, or cost savings found.</p>
          </div>
        ) : (
          recommendations.map(rec => (
            <div key={rec.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${rec.bgColor}`}>
                  <rec.icon className={`${rec.color}`} size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                     <h4 className="font-bold text-slate-800">{rec.title}</h4>
                     {rec.type === 'risk' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold uppercase">Risk</span>}
                  </div>
                  <p className="text-slate-600 text-sm mt-1 max-w-2xl">{rec.description}</p>
                </div>
              </div>
              <button 
                onClick={() => handleApply(rec)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {rec.action}
                <ArrowRight size={16} />
              </button>
            </div>
          ))
        )}
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
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
  const [requiredSkills, setRequiredSkills] = useState('');

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
      startDate,
      endDate,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(s => s),
      progress: 0,
      createdAt: serverTimestamp()
    });
    onClose();
    setTitle('');
    setType('task');
    setParentId('');
    setRequiredSkills('');
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
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
          </div>

          {type === 'task' && (
            <div>
               <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Required Skills (Comma separated)</label>
               <input
                 type="text"
                 value={requiredSkills}
                 onChange={(e) => setRequiredSkills(e.target.value)}
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="e.g. React, Python, UI Design"
               />
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

const WorkHub = ({ tasks, resources, onAddTask, onUpdateTask, onDeleteTask, onAddComment }) => {
  const [viewMode, setViewMode] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
  };

  // --- Views ---

  const ListView = () => {
    const rootItems = tasks.filter(t => !t.parentId);
    
    const renderRow = (item, level = 0) => {
       const children = tasks.filter(t => t.parentId === item.id);
       
       return (
         <React.Fragment key={item.id}>
           <tr 
             onClick={() => handleTaskClick(item)}
             className="hover:bg-slate-50 border-b border-slate-100 last:border-0 group cursor-pointer"
           >
             <td className="py-3 px-4">
               <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
                 <div className="mr-2 opacity-70">
                   <WorkItemIcon type={item.type || 'task'} isMilestone={item.isMilestone} />
                 </div>
                 <div className="flex flex-col">
                    <span className={`text-sm ${item.type === 'program' ? 'font-bold text-slate-800' : item.type === 'project' ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>
                      {item.title}
                    </span>
                    {item.progress > 0 && item.type === 'task' && (
                       <div className="w-16 h-1 bg-slate-200 rounded-full mt-1">
                          <div className="h-full bg-green-500 rounded-full" style={{width: `${item.progress}%`}}></div>
                       </div>
                    )}
                 </div>
               </div>
             </td>
             <td className="py-3 px-4">
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                  {item.type || 'task'}
                </span>
             </td>
             <td className="py-3 px-4 text-xs text-slate-500">{item.startDate}</td>
             <td className="py-3 px-4 text-xs text-slate-500">{item.endDate}</td>
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
                <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-800' : item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                   {item.status}
                </span>
             </td>
             <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
            <tr>
              <th className="py-3 px-4 font-semibold w-1/3">Item Name</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Start</th>
              <th className="py-3 px-4 font-semibold">End</th>
              <th className="py-3 px-4 font-semibold">Assignee</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rootItems.length > 0 ? rootItems.map(item => renderRow(item)) : (
              <tr><td colSpan="7" className="py-8 text-center text-slate-400">No work items found. Add a Program or Project to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const BoardView = () => {
    const columns = ['pending', 'in-progress', 'completed'];

    const handleDragStart = (e, taskId) => {
      e.dataTransfer.setData('taskId', taskId);
      setDraggedTaskId(taskId);
    };

    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = (e, status) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('taskId');
      if (taskId) onUpdateTask(taskId, { status });
      setDraggedTaskId(null);
    };

    return (
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map(status => (
          <div 
            key={status} 
            className="flex-1 min-w-[300px] bg-slate-100 rounded-xl p-3 flex flex-col transition-colors duration-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-3 px-1">
               <h4 className="font-semibold text-slate-700 capitalize">{status.replace('-', ' ')}</h4>
               <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                 {tasks.filter(t => t.status === status).length}
               </span>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 min-h-[100px]">
              {tasks.filter(t => t.status === status).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleTaskClick(item)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className={`bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-move group ${draggedTaskId === item.id ? 'opacity-50 ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                     <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide border ${
                        item.type === 'program' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        item.type === 'project' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                     }`}>
                       {item.type || 'task'}
                     </span>
                     {item.comments && item.comments.length > 0 && (
                        <div className="flex items-center text-slate-400 text-xs">
                           <MessageSquare size={10} className="mr-1"/> {item.comments.length}
                        </div>
                     )}
                  </div>
                  <h5 className="font-medium text-slate-800 text-sm mb-1">{item.title}</h5>
                  {item.endDate && <div className="flex items-center text-xs text-slate-400 mb-2"><Clock size={10} className="mr-1"/>{formatDate(item.endDate)}</div>}
                  
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CalendarView = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const empties = Array.from({ length: firstDay }, (_, i) => i);

    const getItemsForDate = (day) => {
      const dateStr = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
      return tasks.filter(t => t.endDate === dateStr);
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-lg">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <div className="text-xs text-slate-400">Due Dates</div>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
          {empties.map(e => <div key={`empty-${e}`} className="border-b border-r border-slate-100 bg-slate-50/30"></div>)}
          {days.map(day => {
             const dayItems = getItemsForDate(day);
             return (
              <div key={day} className="min-h-[100px] p-2 border-b border-r border-slate-100 hover:bg-slate-50 relative group">
                <span className={`text-xs font-medium ${day === today.getDate() ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>{day}</span>
                <div className="mt-1 space-y-1">
                  {dayItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleTaskClick(item)}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer ${
                      item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
             );
          })}
        </div>
      </div>
    );
  };

  const GanttView = () => {
    // Simple Gantt implementation
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0); // End of next month
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const validTasks = tasks.filter(t => t.startDate && t.endDate);

    const getPosition = (dateStr) => {
      const date = new Date(dateStr);
      const diff = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24));
      return Math.max(0, (diff / totalDays) * 100);
    };

    const getWidth = (startStr, endStr) => {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return Math.max(1, (diff / totalDays) * 100);
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-200">
           <h3 className="font-bold text-slate-800">Timeline</h3>
        </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 md:w-64 border-r border-slate-200 overflow-y-auto bg-slate-50">
            <div className="h-10 border-b border-slate-200 sticky top-0 bg-slate-50 z-10"></div>
            {validTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleTaskClick(task)}
                className="h-12 flex items-center px-4 border-b border-slate-100 text-xs text-slate-700 truncate cursor-pointer hover:bg-slate-50"
              >
                {task.title}
              </div>
            ))}
          </div>
          
          {/* Chart Area */}
          <div className="flex-1 overflow-x-auto overflow-y-auto relative">
             <div className="h-10 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 min-w-[800px] flex">
                <div className="flex-1 text-xs text-slate-500 font-medium p-2 border-r border-slate-200">{startDate.toLocaleString('default', { month: 'long' })}</div>
                <div className="flex-1 text-xs text-slate-500 font-medium p-2 border-r border-slate-200">{new Date(startDate.getFullYear(), startDate.getMonth()+1, 1).toLocaleString('default', { month: 'long' })}</div>
             </div>
             
             <div className="relative min-w-[800px]">
                <div className="absolute inset-0 flex">
                   <div className="flex-1 border-r border-slate-100"></div>
                   <div className="flex-1 border-r border-slate-100"></div>
                </div>

                {validTasks.map(task => {
                   const left = getPosition(task.startDate);
                   const width = getWidth(task.startDate, task.endDate);
                   return (
                     <div key={task.id} className="h-12 border-b border-slate-50 relative flex items-center">
                        <div 
                          className={`absolute h-6 rounded-full shadow-sm text-[10px] text-white flex items-center px-2 whitespace-nowrap overflow-hidden cursor-pointer ${
                            task.type === 'program' ? 'bg-purple-500' : task.type === 'project' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          onClick={() => handleTaskClick(task)}
                          style={{ left: `${left}%`, width: `${width}%`, minWidth: '20px' }}
                        >
                          {width > 5 && task.title}
                        </div>
                     </div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>
    );
  };

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

      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit shadow-sm">
        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="List View"><List size={18}/></button>
        <button onClick={() => setViewMode('board')} className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Board View"><Kanban size={18}/></button>
        <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Calendar View"><CalendarIcon size={18}/></button>
        <button onClick={() => setViewMode('gantt')} className={`p-2 rounded-md transition-all ${viewMode === 'gantt' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`} title="Gantt View"><GanttChart size={18}/></button>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' && <ListView />}
        {viewMode === 'board' && <BoardView />}
        {viewMode === 'calendar' && <CalendarView />}
        {viewMode === 'gantt' && <GanttView />}
      </div>

      <AddWorkItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddTask} 
        resources={resources}
        items={tasks} 
      />

      <TaskDetailModal 
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseDetail}
        resources={resources}
        onUpdate={onUpdateTask}
        onAddComment={onAddComment}
      />
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
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [currentInitError, setCurrentInitError] = useState(initError);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Auto-retry connection logic
  useEffect(() => {
    if (isFirebaseReady || isDemoMode) return;
    if (initFirebase()) {
       setIsFirebaseReady(true);
       return;
    }
    let attempts = 0;
    const interval = setInterval(() => {
       attempts++;
       if (initFirebase()) {
          setIsFirebaseReady(true);
          setCurrentInitError(null);
          clearInterval(interval);
       } else {
          if (initError && initError !== currentInitError) setCurrentInitError(initError);
       }
       if (attempts >= 5) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFirebaseReady, isDemoMode]);

  // Authentication
  useEffect(() => {
    if (isDemoMode) { setLoading(false); return; }
    if (!isFirebaseReady) {
      const timeout = setTimeout(() => { if (!auth) setLoading(false); }, 5500); 
      return () => clearTimeout(timeout);
    }
    if (!auth) { setLoading(false); return; }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) { console.error("Auth error:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setLoading(false);
    });
    return () => unsubscribe();
  }, [isFirebaseReady, isDemoMode]);

  // Data Fetching
  useEffect(() => {
    if (isDemoMode) return;
    if (!user || !db) return;

    const resourcesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'resources');
    const tasksRef = query(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));

    const unsubResources = onSnapshot(query(resourcesRef), (snapshot) => setResources(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubTasks = onSnapshot(tasksRef, (snapshot) => setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubResources(); unsubTasks(); };
  }, [user, isDemoMode]);

  // Handlers
  const handleRetryConnection = () => window.location.reload();
  const handleDemoMode = () => { setIsDemoMode(true); setLoading(false); seedData(true); };
  const handleManualConfig = (config) => {
    if (initFirebase(config)) { setIsFirebaseReady(true); setCurrentInitError(null); } 
    else { setCurrentInitError("Could not initialize with provided configuration."); }
  };

  const addResource = async (data) => {
    if (isDemoMode) { setResources(prev => [{ id: `demo-${Date.now()}`, ...data }, ...prev]); return; }
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'resources'), data);
  };

  const deleteResource = async (id) => {
    if (isDemoMode) { setResources(prev => prev.filter(r => r.id !== id)); return; }
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'resources', id));
  };

  const addTask = async (data) => {
    if (isDemoMode) { setTasks(prev => [{ id: `demo-${Date.now()}`, ...data }, ...prev]); return; }
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'), data);
  };

  const updateTask = async (id, data) => {
    if (isDemoMode) { setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t)); return; }
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', id), data);
  };

  const addComment = async (taskId, text) => {
    const comment = {
      text,
      userId: user?.uid || 'demo-user',
      userName: 'Current User', // Simplified for now
      createdAt: isDemoMode ? new Date() : new Date().toISOString() // Demo uses object, Firestore uses ISO/Timestamp
    };

    if (isDemoMode) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t));
      return;
    }
    
    // For Firestore, we might need a subcollection or arrayUnion. Using array for simplicity in single file.
    // Note: arrayUnion with complex objects in Firestore works, but timestamp needs handling.
    // For this simple app, we'll store date as string in array.
    const firestoreComment = { ...comment, createdAt: new Date().toISOString() };
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', taskId), {
      comments: arrayUnion(firestoreComment)
    });
  };

  const deleteTask = async (id) => {
    if (isDemoMode) { setTasks(prev => prev.filter(t => t.id !== id)); return; }
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'tasks', id));
  };

  const seedData = async (forceDemo = false) => {
    if ((!user || !db) && !isDemoMode && !forceDemo) return;
    setIsSeeding(true);
    // ... (Same sample data as before) ...
    const sampleResources = [
      { name: 'Sarah Connor', role: 'Senior Dev', hourlyRate: 160, skills: ['React', 'Node.js', 'Architecture'] },
      { name: 'John Smith', role: 'Project Manager', hourlyRate: 140, skills: ['Agile', 'Scrum', 'Jira'] },
      { name: 'Emily Chen', role: 'Designer', hourlyRate: 110, skills: ['Figma', 'UI/UX', 'Prototyping'] },
      { name: 'Michael Ross', role: 'Junior Dev', hourlyRate: 85, skills: ['HTML', 'CSS', 'JavaScript'] },
      { name: 'Jessica Day', role: 'QA Engineer', hourlyRate: 90, skills: ['Testing', 'Cypress', 'Automation'] }
    ];
    const now = new Date();
    const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
    const nextMonth = new Date(now); nextMonth.setDate(now.getDate() + 30);
    const sampleTasks = [
      { title: 'Digital Transformation', type: 'program', clientName: 'Acme Corp', status: 'in-progress', startDate: now.toISOString().split('T')[0], endDate: nextMonth.toISOString().split('T')[0], progress: 45 },
      { title: 'Website Redesign', type: 'project', clientName: 'Acme Corp', status: 'in-progress', startDate: now.toISOString().split('T')[0], endDate: nextWeek.toISOString().split('T')[0], parentIndex: 0, progress: 60 },
      { title: 'Mobile App Core', type: 'project', clientName: 'Globex', status: 'pending', startDate: nextWeek.toISOString().split('T')[0], endDate: nextMonth.toISOString().split('T')[0], parentIndex: 0, progress: 0 },
      { title: 'Design Home Page', type: 'task', status: 'completed', resourceIndex: 2, startDate: now.toISOString().split('T')[0], endDate: now.toISOString().split('T')[0], parentIndex: 1, requiredSkills: ['Figma', 'UI/UX'], progress: 100 },
      { title: 'Implement Login API', type: 'task', status: 'in-progress', resourceIndex: 0, startDate: now.toISOString().split('T')[0], endDate: nextWeek.toISOString().split('T')[0], parentIndex: 1, requiredSkills: ['Node.js', 'Security'], progress: 30 },
      { title: 'Setup CI/CD', type: 'task', status: 'pending', resourceIndex: 3, startDate: nextWeek.toISOString().split('T')[0], endDate: nextWeek.toISOString().split('T')[0], parentIndex: 1, requiredSkills: ['DevOps'], progress: 0 },
    ];

    if (isDemoMode || forceDemo) {
      setTimeout(() => {
        const resWithIds = sampleResources.map((r, i) => ({ id: `demo-res-${i}`, ...r }));
        setResources(prev => [...prev, ...resWithIds]);
        const tasksWithIds = sampleTasks.map((t, i) => {
           let resourceId = '';
           if (t.resourceIndex !== undefined) resourceId = resWithIds[t.resourceIndex].id;
           return { id: `demo-task-${i}`, ...t, resourceId, comments: [] };
        });
        const programId = tasksWithIds[0].id;
        tasksWithIds[1].parentId = programId;
        tasksWithIds[2].parentId = programId;
        tasksWithIds[3].parentId = tasksWithIds[1].id;
        tasksWithIds[4].parentId = tasksWithIds[1].id;
        tasksWithIds[5].parentId = tasksWithIds[1].id;
        setTasks(prev => [...prev, ...tasksWithIds]);
        setIsSeeding(false);
      }, 500);
      return;
    }

    try {
      const batch = writeBatch(db);
      const resRefs = [];
      for (const res of sampleResources) {
        const ref = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'resources'));
        batch.set(ref, res);
        resRefs.push({ id: ref.id, ...res });
      }
      // Simplified parent linking for Firestore batch (same structure as previous)
      const programRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
      batch.set(programRef, { ...sampleTasks[0], createdAt: serverTimestamp(), comments: [] });
      const projectRef1 = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
      batch.set(projectRef1, { ...sampleTasks[1], parentId: programRef.id, createdAt: serverTimestamp(), comments: [] });
      const projectRef2 = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
      batch.set(projectRef2, { ...sampleTasks[2], parentId: programRef.id, createdAt: serverTimestamp(), comments: [] });
      
      const task1 = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
      batch.set(task1, { ...sampleTasks[3], parentId: projectRef1.id, resourceId: resRefs[2].id, createdAt: serverTimestamp(), comments: [] });
      const task2 = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
      batch.set(task2, { ...sampleTasks[4], parentId: projectRef1.id, resourceId: resRefs[0].id, createdAt: serverTimestamp(), comments: [] });
      const task3 = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'tasks'));
      batch.set(task3, { ...sampleTasks[5], parentId: projectRef1.id, resourceId: resRefs[0].id, createdAt: serverTimestamp(), comments: [] });

      await batch.commit();
    } catch (e) { console.error("Seeding error:", e); } finally { setIsSeeding(false); }
  };

  if (!auth && !isDemoMode) return <ConfigurationHelp onRetry={handleRetryConnection} onDemoMode={handleDemoMode} onManualConfig={handleManualConfig} errorMsg={currentInitError} />;
  if (loading) return <LoadingScreen message="Establishing secure connection..." />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard tasks={tasks} resources={resources} />;
      case 'intake': return <IntakeView existingTasks={tasks} onAddProject={addTask} />;
      case 'workHub': return <WorkHub tasks={tasks} resources={resources} onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} onAddComment={addComment} />;
      case 'enrichment': return <EnrichmentView tasks={tasks} resources={resources} onUpdateTask={updateTask} />;
      case 'resources': return <ResourceList resources={resources} onAddResource={addResource} onDeleteResource={deleteResource} />;
      case 'settings': return <SettingsView onSeedData={() => seedData()} isSeeding={isSeeding} />;
      default: return <Dashboard tasks={tasks} resources={resources} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isDemoMode={isDemoMode} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-2 font-bold text-slate-800"><Layout className="w-6 h-6 text-blue-600" /><span>PlanFlow</span></div>
          <button className="text-slate-500"><MoreVertical /></button>
        </div>
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50">
           {['dashboard', 'intake', 'workHub', 'enrichment', 'resources', 'settings'].map(id => (
             <button key={id} onClick={() => setActiveTab(id)} className={`${activeTab === id ? 'text-blue-600' : 'text-slate-400'}`}><div className="w-6 h-6 bg-current rounded-full"></div></button>
           ))}
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto h-full">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}