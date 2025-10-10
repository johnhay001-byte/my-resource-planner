import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';

// --- Helper Data & SVG Icons ---
// Client objects now have a 'strategicFocus' for the enrichment feature.
const initialData = [
    {
        id: 'client-1', name: 'Electrolux', type: 'client', strategicFocus: 'sustainability and family-centric design', children: [
            {
                id: 'prog-1', name: 'Q4 "Ignite" Brand Campaign', type: 'program', children: [
                    {
                        id: 'proj-1a', name: 'Holiday Season TV Commercial', type: 'project', brief: 'Create a heartwarming 30-second TV spot for the holiday season, focusing on family and togetherness.', children: [
                            { id: 'person-1', personId: 'p-alicia', name: 'Alicia Keys', role: 'Creative Director', type: 'person', tags: [{type: 'Team', value: 'Creative'}, {type: 'Skill', value: 'Art Direction'}, {type: 'Location', value: 'New York'}], email: 'alicia.k@example.com', ooo: null, assignments: [{projectId: 'proj-1a', allocation: 50, startDate: '2025-10-01', endDate: '2025-12-20'}] },
                            { id: 'person-2', personId: 'p-ben', name: 'Ben Carter', role: 'Lead Copywriter', type: 'person', tags: [{type: 'Team', value: 'Creative'}, {type: 'Skill', value: 'Copywriting'}, {type: 'Location', value: 'London'}], email: 'ben.carter@example.com', ooo: null, assignments: [{projectId: 'proj-1a', allocation: 100, startDate: '2025-10-01', endDate: '2025-11-30'}, {projectId: 'proj-2a', allocation: 50, startDate: '2025-12-01', endDate: '2026-02-28'}] },
                            { id: 'person-10a', personId: 'p-jack', name: 'Jack White', role: 'Strategic Advisor', type: 'person', tags: [{type: 'Team', value: 'Strategy'}, {type: 'Skill', value: 'Data Analysis'}, {type: 'Location', value: 'Remote'}], email: 'jack.white@example.com', ooo: null, assignments: [{projectId: 'proj-1a', allocation: 25, startDate: '2025-10-10', endDate: '2025-11-21'}] },
                            { id: 'person-11', personId: 'p-leo', name: 'Leo Schmidt', role: 'Video Editor', type: 'person', tags: [{type: 'Team', value: 'Creative'}, {type: 'Skill', value: 'Video Editing'}, {type: 'Location', value: 'Berlin'}], email: 'leo.s@example.com', ooo: null, assignments: [{projectId: 'proj-1a', allocation: 75, startDate: '2025-10-15', endDate: '2025-12-15'}] },
                        ],
                    },
                    {
                        id: 'proj-1b', name: 'Social Media Blitz', type: 'project', brief: 'Launch a multi-platform social media campaign to support the TV commercial.', children: [
                            { id: 'person-4', personId: 'p-david', name: 'David Chen', role: 'Social Media Manager', type: 'person', tags: [{type: 'Team', value: 'Digital'}, {type: 'Skill', value: 'Social Media'}, {type: 'Location', value: 'New York'}], email: 'david.chen@example.com', ooo: null, assignments: [{projectId: 'proj-1b', allocation: 100, startDate: '2025-10-01', endDate: '2025-12-31'}] },
                            { id: 'person-3b', personId: 'p-carla', name: 'Carla Rodriguez', role: 'Graphic Designer', type: 'person', tags: [{type: 'Team', value: 'Creative'}, {type: 'Skill', value: 'Design'}, {type: 'Location', value: 'New York'}], email: 'carla.r@example.com', ooo: null, assignments: [{projectId: 'proj-1b', allocation: 50, startDate: '2025-10-01', endDate: '2025-12-31'}] },
                            { id: 'person-10b', personId: 'p-jack', name: 'Jack White', role: 'Data Analyst', type: 'person', tags: [{type: 'Team', value: 'Strategy'}, {type: 'Skill', value: 'Data Analysis'}, {type: 'Location', value: 'Remote'}], email: 'jack.white@example.com', ooo: null, assignments: [{projectId: 'proj-1b', allocation: 25, startDate: '2025-10-10', endDate: '2025-11-21'}] },
                            { id: 'person-12', personId: 'p-fatima', name: 'Fatima Al-Sayed', role: 'SEO Specialist', type: 'person', tags: [{type: 'Team', value: 'Digital'}, {type: 'Skill', value: 'SEO Strategy'}, {type: 'Location', value: 'New York'}], email: 'fatima.as@example.com', ooo: null, assignments: [{projectId: 'proj-1b', allocation: 50, startDate: '2025-10-01', endDate: '2025-12-31'}] },
                        ],
                    },
                    {
                        id: 'proj-1c', name: 'Synthetic Brand Film', type: 'project', brief: 'Develop a high-impact, fully synthetic video using AI and 3D animation to showcase the future of home appliances.', children: [
                            { id: 'person-13', personId: 'p-ken', name: 'Ken Watanabe', role: '3D Artist', type: 'person', tags: [{type: 'Team', value: 'Creative'}, {type: 'Skill', value: '3D Animation'}, {type: 'Location', value: 'Remote'}], email: 'ken.watanabe@example.com', ooo: 'Oct 20-25, 2025', assignments: [{projectId: 'proj-1c', allocation: 100, startDate: '2025-10-01', endDate: '2026-01-31'}] },
                            { id: 'person-14', personId: 'p-maria', name: 'Maria Garcia', role: 'Project Manager', type: 'person', tags: [{type: 'Team', value: 'Strategy'}, {type: 'Skill', value: 'Project Management'}, {type: 'Location', value: 'London'}], email: 'maria.garcia@example.com', ooo: null, assignments: [{projectId: 'proj-1c', allocation: 40, startDate: '2025-10-01', endDate: '2026-01-31'}, {projectId: 'proj-2b', allocation: 60, startDate: '2025-10-01', endDate: '2026-03-31'}] },
                        ]
                    },
                ],
            },
        ],
    },
    {
        id: 'client-2', name: 'Global Motors', type: 'client', strategicFocus: 'innovation in electric vehicle technology', children: [
            {
                id: 'prog-2', name: 'New Website Launch (Project Phoenix)', type: 'program', children: [
                    {
                        id: 'proj-2a', name: 'Frontend Development', type: 'project', brief: 'Develop a responsive and modern frontend for the new corporate website using React.', children: [
                            { id: 'person-7', personId: 'p-grace', name: 'Grace Lee', role: 'UI/UX Specialist', type: 'person', tags: [{type: 'Team', value: 'Development'}, {type: 'Skill', value: 'UX/UI'}, {type: 'Location', value: 'London'}], email: 'grace.lee@example.com', ooo: null, assignments: [{projectId: 'proj-2a', allocation: 100, startDate: '2025-11-01', endDate: '2026-02-28'}] },
                            { id: 'person-10c', personId: 'p-jack', name: 'Jack White', role: 'QA Lead', type: 'person', tags: [{type: 'Team', value: 'Strategy'}, {type: 'Skill', value: 'Data Analysis'}, {type: 'Location', 'value': 'Remote'}], email: 'jack.white@example.com', ooo: null, assignments: [{projectId: 'proj-2a', allocation: 25, startDate: '2025-10-10', endDate: '2025-11-21'}] },
                        ],
                    },
                    {
                        id: 'proj-2b', name: 'Backend & API Integration', type: 'project', brief: 'Build robust backend services and APIs to power the new website.', children: [
                            { id: 'person-9', personId: 'p-ivy', name: 'Ivy Green', role: 'Backend Lead', type: 'person', tags: [{type: 'Team', value: 'Development'}, {type: 'Skill', value: 'Backend Dev'}, {type: 'Location', value: 'Remote'}], email: 'ivy.green@example.com', ooo: null, assignments: [{projectId: 'proj-2b', allocation: 100, startDate: '2025-10-01', endDate: '2026-03-31'}] },
                            { id: 'person-10d', personId: 'p-jack', name: 'Jack White', role: 'Database Architect', type: 'person', tags: [{type: 'Team', value: 'Strategy'}, {type: 'Skill', value: 'Data Analysis'}, {type: 'Location', value: 'Remote'}], email: 'jack.white@example.com', ooo: null, assignments: [{projectId: 'proj-2b', allocation: 25, startDate: '2025-10-10', endDate: '2025-11-21'}] },
                        ],
                    },
                ],
            },
        ],
    },
];

const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const SparkleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"></path><path d="M22 2l-2.5 2.5"></path><path d="M2 22l2.5-2.5"></path><path d="M2 2l2.5 2.5"></path><path d="M18 6l1 1"></path></svg>);
const EditIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const MailIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const CalendarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const WandIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L11 10l-1.5 1.5 3.52 3.52L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>);

// --- Helper Functions ---
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// --- Main App Components ---

const Header = () => ( <div className="p-6 bg-white border-b border-gray-200"> <h1 className="text-3xl font-bold text-gray-800">Project & Resource Visualizer</h1> <p className="mt-1 text-gray-600">Click a person or a tag in the side panel to visualize connections.</p> </div> );
const ClientFilter = ({ clients, activeFilter, onFilterChange }) => ( <div className="px-8 py-4 bg-gray-50 border-b border-gray-200"> <div className="flex items-center space-x-2"> <span className="font-semibold text-gray-600">Filter by Client:</span> <button onClick={() => onFilterChange('all')} className={`px-4 py-1.5 text-sm font-medium rounded-full ${activeFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>All Clients</button> {clients.map(client => ( <button key={client.id} onClick={() => onFilterChange(client.id)} className={`px-4 py-1.5 text-sm font-medium rounded-full ${activeFilter === client.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>{client.name}</button>))} </div> </div> );

const Node = ({ node, level, onUpdate, path, selection, onPersonSelect, registerNode, highlightedProjects, onStartEdit }) => {
    const isClient = level === 0; const isProgram = level === 1; const isProject = level === 2; const isPerson = level === 3;
    let isHighlighted = false;
    if (selection.type === 'person' && isPerson) { isHighlighted = node.personId === selection.id; } 
    else if (selection.type === 'tag' && isPerson) { isHighlighted = node.tags.some(t => t.type === selection.tag.type && t.value === selection.tag.value); } 
    else if (isProject && highlightedProjects.has(node.id)) { isHighlighted = true; }

    const nodeRef = useRef(null);
    useEffect(() => { isProject && registerNode(node.id, nodeRef); }, [node.id, registerNode, isProject]);

    const handleNodeClick = (e) => { e.stopPropagation(); isPerson && onPersonSelect(node.personId); };

    const nodeStyles = {
        base: 'relative group p-4 rounded-lg border-2 flex items-center min-w-[280px] shadow-sm transition-all duration-300',
        client: 'bg-purple-50 border-purple-500', program: 'bg-blue-50 border-blue-500', project: 'bg-indigo-50 border-indigo-500', person: 'bg-green-50 border-green-500 cursor-pointer',
        highlighted: 'ring-4 ring-yellow-400 border-yellow-500 bg-yellow-100 scale-105 z-20'
    };
    let nodeTypeClasses = isClient ? nodeStyles.client : isProgram ? nodeStyles.program : isProject ? nodeStyles.project : nodeStyles.person;

    return (
        <div className="relative pl-8 py-2">
            <div className="absolute top-0 left-4 w-px h-full bg-gray-300"></div>
            <div className="absolute top-1/2 left-4 w-4 h-px bg-gray-300"></div>
            <div ref={nodeRef} className={`${nodeStyles.base} ${nodeTypeClasses} ${isHighlighted ? nodeStyles.highlighted : ''}`} onClick={handleNodeClick}>
                <div className="flex-grow">
                    <p className={`font-bold text-lg ${ isClient ? 'text-purple-800' : isProgram ? 'text-blue-800' : isProject ? 'text-indigo-800' : 'text-green-800'}`}>{node.name}</p>
                    {node.role && <p className="text-sm text-gray-600">{node.role}</p>}
                </div>
                <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isProject && <button onClick={(e) => { e.stopPropagation(); onStartEdit(node); }} className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200" aria-label="Edit item"><EditIcon className="h-4 w-4" /></button>}
                    <button onClick={(e) => { e.stopPropagation(); onUpdate({ type: 'DELETE_NODE', path }); }} className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200" aria-label="Delete item"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </div>
            {node.children && node.children.length > 0 && (<div className="mt-2">{node.children.map((child, index) => ( <Node key={child.id} node={child} level={level + 1} onUpdate={onUpdate} path={`${path}.children.${index}`} selection={selection} onPersonSelect={onPersonSelect} registerNode={registerNode} highlightedProjects={highlightedProjects} onStartEdit={onStartEdit} /> ))}</div>)}
        </div>
    );
};

const ProjectModal = ({ isOpen, onClose, onUpdate, data, projectData, onSuggestionSelect }) => {
    const isEditMode = !!projectData;
    const [projectName, setProjectName] = useState('');
    const [programId, setProgramId] = useState('');
    const [projectBrief, setProjectBrief] = useState('');
    const [geminiResult, setGeminiResult] = useState(null);
    const [teamSuggestions, setTeamSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { allPrograms, allPeople } = useMemo(() => {
        const programs = [];
        const pList = [];
        data.forEach(client => {
            client.children.forEach(program => {
                programs.push({...program, clientName: client.name});
                program.children.forEach(project => {
                    pList.push(...project.children);
                });
            });
        });
        const uniquePeople = Array.from(new Map(pList.map(p => [p.personId, p])).values());
        return { allPrograms: programs, allPeople: uniquePeople };
    }, [data]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && projectData) {
                setProjectName(projectData.name);
                setProjectBrief(projectData.brief || '');
                for (const client of data) {
                    for (const program of client.children) {
                        if (program.children.some(p => p.id === projectData.id)) {
                            setProgramId(program.id);
                            return;
                        }
                    }
                }
            } else {
                 handleClose(false);
            }
        }
    }, [projectData, isEditMode, data, isOpen]);

    const handleEnrichBrief = async () => {
        if (!projectBrief.trim() || !programId) { setError('Please provide a program and brief.'); return; }
        setIsLoading(true); setError(null); setGeminiResult(null); setTeamSuggestions([]);

        let client = null;
        for(const c of data) {
            if (c.children.some(p => p.id === programId)) {
                client = c;
                break;
            }
        }
        if (!client) { setError('Could not find client for this program.'); setIsLoading(false); return; }

        const context = `
            CLIENT CONTEXT:
            - Client Name: ${client.name}
            - Strategic Focus: ${client.strategicFocus}

            AVAILABLE PERSONNEL:
            ${allPeople.map(p => `- ${p.name} (Role: ${p.role}, Skills: ${p.tags.filter(t=>t.type==='Skill').map(t=>t.value).join(', ')})`).join('\n')}

            ORIGINAL PROJECT BRIEF:
            "${projectBrief}"
        `;

        const apiKey = ""; const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const systemPrompt = "You are a senior strategic advisor for a creative agency. Your task is to enrich a project brief by incorporating the client's known strategic focus and leveraging the available team's skills. You should refine the brief, suggest specific tasks that align with the strategy, and recommend a team whose skills are a perfect match for the enriched scope. Provide the output in JSON format only.";
        const payload = {
            contents: [{ parts: [{ text: context }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        enrichedBrief: { type: "STRING" },
                        suggestedTasks: { type: "ARRAY", items: { type: "STRING" } },
                        teamRecommendations: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, role: { type: "STRING" }, justification: { type: "STRING" } }, required: ["name", "role", "justification"] } }
                    },
                    required: ["enrichedBrief", "suggestedTasks", "teamRecommendations"]
                }
            }
        };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API error: ${response.statusText}`);
            const result = await response.json();
            const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (jsonText) {
                const enrichedResult = JSON.parse(jsonText);
                setProjectBrief(enrichedResult.enrichedBrief);
                setGeminiResult({ suggestedTasks: enrichedResult.suggestedTasks });
                const recommendationsWithIds = enrichedResult.teamRecommendations.map(rec => {
                    const person = allPeople.find(p => p.name === rec.name);
                    return { ...rec, personId: person ? person.personId : null };
                });
                setTeamSuggestions(recommendationsWithIds);
            } else { throw new Error("Invalid response structure from API."); }
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };
    
    const handleSubmit = () => {
        if (projectName && programId) {
            if (isEditMode) {
                onUpdate({type: 'UPDATE_PROJECT', project: { ...projectData, name: projectName, brief: projectBrief }});
            } else {
                onUpdate({type: 'ADD_PROJECT', name: projectName, programId: programId, brief: projectBrief});
            }
            onClose();
        }
    }

    const handleClose = (shouldTriggerCallback = true) => {
        setProjectName(''); setProgramId(''); setProjectBrief(''); setGeminiResult(null); setTeamSuggestions([]); setIsLoading(false); setError(null);
        if (shouldTriggerCallback) onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">✨ {isEditMode ? 'Edit Project' : 'Add New Project'}</h2>
                <div className="space-y-4">
                    <select value={programId} onChange={e => setProgramId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50" disabled={isEditMode}><option value="">Select a Program...</option>{allPrograms.map(p => <option key={p.id} value={p.id}>{p.clientName} / {p.name}</option>)}</select>
                    <input type="text" placeholder="Project Name" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full p-2 border rounded-md" />
                    <textarea placeholder="Enter a detailed project brief here..." value={projectBrief} onChange={e => setProjectBrief(e.target.value)} className="w-full p-2 border rounded-md h-32" />
                </div>
                <div className="mt-4"><button onClick={handleEnrichBrief} disabled={isLoading || !projectBrief || !programId} className="w-full flex items-center justify-center p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400">{isLoading ? 'Enriching...' : <><WandIcon className="h-5 w-5 mr-2" />Enrich with AI Strategy</>}</button>{error && <p className="text-red-500 text-sm mt-2">{error}</p>}</div>
                {geminiResult && ( <div className="mt-6 animate-fade-in"><h3 className="font-bold text-lg">Suggested Tasks</h3><ul className="list-disc list-inside bg-gray-50 p-4 rounded-md mt-2 space-y-1">{geminiResult.suggestedTasks.map((task, i) => <li key={i}>{task}</li>)}</ul></div> )}
                {teamSuggestions.length > 0 && ( <div className="mt-6 animate-fade-in"><h3 className="font-bold text-lg">Team Recommendations</h3><div className="space-y-2 mt-2">{teamSuggestions.map((p, i) => ( <button key={i} onClick={() => p.personId && onSuggestionSelect(p.personId)} className="w-full text-left p-3 border bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"><p className="font-semibold">{p.name} <span className="font-normal text-gray-500">- {p.role}</span></p><p className="text-sm text-gray-700 mt-1 italic">"{p.justification}"</p></button>))}</div></div>)}
                <div className="mt-8 flex justify-end gap-4"><button onClick={() => handleClose()} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button><button onClick={handleSubmit} disabled={!projectName || !programId} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400">{isEditMode ? 'Save Changes' : 'Create Project'}</button></div>
            </div>
        </div>
    );
};

const PersonDetailCard = ({ person, onClose, projectMap }) => {
    if (!person) return null;
    const groupedTags = person.tags.reduce((acc, tag) => {
        if (!acc[tag.type]) acc[tag.type] = [];
        acc[tag.type].push(tag.value);
        return acc;
    }, {});
    const totalAllocation = person.assignments?.reduce((sum, a) => sum + a.allocation, 0) || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg animate-fade-in-fast" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                <h2 className="text-3xl font-bold">{person.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{person.role}</p>
                <div className="flex items-center text-gray-700 mb-4"><MailIcon className="h-5 w-5 mr-3" /><a href={`mailto:${person.email}`} className="hover:underline">{person.email}</a></div>
                {person.ooo && (<div className="flex items-center text-red-600 mb-6 bg-red-50 p-3 rounded-md"><CalendarIcon className="h-5 w-5 mr-3 flex-shrink-0" /><div><p className="font-semibold">Out of Office</p><p>{person.ooo}</p></div></div>)}
                <div className="mb-6"><h3 className="font-semibold text-gray-700 mb-2">Current Assignments ({totalAllocation}% Capacity)</h3><div className="space-y-3">{person.assignments?.map(ass => (<div key={ass.projectId}><div className="flex justify-between items-center mb-1"><span className="font-medium">{projectMap.get(ass.projectId)?.name || 'Unknown Project'}</span><span className="text-sm font-semibold text-gray-600">{ass.allocation}%</span></div><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${ass.allocation}%` }}></div></div><p className="text-xs text-gray-500 mt-1">{formatDate(ass.startDate)} - {formatDate(ass.endDate)}</p></div>))}{(!person.assignments || person.assignments.length === 0) && <p className="text-sm text-gray-500">No active assignments.</p>}</div></div>
                <div className="space-y-4">{Object.entries(groupedTags).map(([type, values]) => (<div key={type}><h3 className="font-semibold text-gray-700 mb-2">{type}</h3><div className="flex flex-wrap gap-2">{values.map(value => (<span key={value} className="bg-gray-200 text-gray-800 px-3 py-1 text-sm font-medium rounded-full">{value}</span>))}</div></div>))}</div>
            </div>
        </div>
    );
};

const SidePanel = ({ data, onTagSelect, selection, onUpdate, onStartAdd }) => {
    const [activeTab, setActiveTab] = useState('visualize');
    const tags = useMemo(() => {
        const allTags = new Map();
        const crawl = (nodes) => { for(const node of nodes) { if (node.type === 'person' && node.tags) { node.tags.forEach(tag => { if (!allTags.has(tag.type)) allTags.set(tag.type, new Set()); allTags.get(tag.type).add(tag.value); }); } if (node.children) crawl(node.children); } };
        crawl(data); return allTags;
    }, [data]);

    return (
        <div className="w-full lg:w-96 bg-white p-6 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="border-b border-gray-200 mb-4"><nav className="flex space-x-4"><button onClick={() => setActiveTab('visualize')} className={`py-2 px-4 font-semibold ${activeTab === 'visualize' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Visualize</button><button onClick={() => setActiveTab('manage')} className={`py-2 px-4 font-semibold ${activeTab === 'manage' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Manage</button></nav></div>
            {activeTab === 'visualize' && ( <div><h2 className="text-2xl font-bold text-gray-800 mb-6">Visualization Controls</h2><div className="space-y-6">{Array.from(tags.keys()).map(type => ( <div key={type}><h3 className="font-semibold text-gray-700 mb-2">{type}</h3><div className="flex flex-wrap gap-2">{Array.from(tags.get(type)).map(value => { const isSelected = selection?.type === 'tag' && selection.tag.type === type && selection.tag.value === value; return <button key={value} onClick={() => onTagSelect({type, value})} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${isSelected ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{value}</button>; })}</div></div>))}</div></div> )}
            {activeTab === 'manage' && ( <div><h2 className="text-2xl font-bold text-gray-800 mb-6">Management</h2><div className="space-y-4"><button onClick={() => onUpdate({ type: 'ADD_CLIENT', name: prompt('Enter new client name:')})} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Add Client</button><button onClick={() => onUpdate({ type: 'ADD_PROGRAM', name: prompt('Enter new program name:'), clientId: data[0]?.id })} className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-md">Add Program (to {data[0]?.name})</button><button onClick={onStartAdd} className="w-full text-left p-3 bg-purple-100 hover:bg-purple-200 rounded-md font-semibold text-purple-800 flex items-center"><SparkleIcon className="h-5 w-5 mr-2" />Add Project with AI...</button></div></div> )}
        </div>
    );
};

const AffinityConnections = ({ connections }) => {
    if (connections.length < 2) return null;
    const paths = [];
    for (let i = 0; i < connections.length; i++) {
        for (let j = i + 1; j < connections.length; j++) {
            const p1 = connections[i]; const p2 = connections[j]; const midX = (p1.x + p2.x) / 2; const midY = (p1.y + p2.y) / 2; const controlPointY = midY - Math.abs(p2.x - p1.x) * 0.4;
            paths.push(`M${p1.x},${p1.y} Q${midX},${controlPointY} ${p2.x},${p2.y}`);
        }
    }
    return ( <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"><defs><filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><g>{paths.map((path, index) => ( <path key={index} d={path} stroke="rgba(250, 204, 21, 0.8)" strokeWidth="3" fill="none" strokeLinecap="round" className="opacity-0 animate-fade-in" style={{ filter: "url(#glow)" }}/> ))}</g></svg> );
};

export default function App() {
    const [data, setData] = useState(initialData);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selection, setSelection] = useState({ type: null, id: null, tag: null });
    const [connections, setConnections] = useState([]);
    const [highlightedProjects, setHighlightedProjects] = useState(new Set());
    const [modalState, setModalState] = useState(null); 
    const [detailedPerson, setDetailedPerson] = useState(null);
    
    const nodeRefs = useRef(new Map());
    const mainPanelRef = useRef(null);

    const { findPersonById, projectMap } = useMemo(() => {
        const personMap = new Map();
        const projMap = new Map();
        const crawl = (nodes) => {
            for(const node of nodes) {
                if (node.type === 'person') personMap.set(node.personId, node);
                if (node.type === 'project') projMap.set(node.id, node);
                if (node.children) crawl(node.children);
            }
        };
        crawl(data);
        return { findPersonById: (personId) => personMap.get(personId), projectMap: projMap };
    }, [data]);

    const registerNode = (id, ref) => { nodeRefs.current.set(id, ref); };

    const handlePersonSelect = (personId) => {
        if (selection.id === personId && selection.type === 'person') {
            setSelection({type: null, id: null});
            setDetailedPerson(null);
        } else {
            setSelection({type: 'person', id: personId});
            setDetailedPerson(findPersonById(personId));
        }
    };

    const handleTagSelect = (tag) => setSelection(prev => (prev.tag?.value === tag.value && prev.tag?.type === tag.type ? {type: null, tag: null} : {type: 'tag', tag: tag}));
    const handleCloseModal = () => setModalState(null);
    const handleStartAdd = () => setModalState({ isAdding: true });
    const handleStartEdit = (project) => setModalState({ project: project });

    const handleSuggestionSelect = (personId) => {
        handlePersonSelect(personId);
        handleCloseModal();
    };

    useLayoutEffect(() => {
        if (!selection.type || !mainPanelRef.current) { setConnections([]); setHighlightedProjects(new Set()); return; }
        const projectsWithSelection = new Set();
        if (selection.type === 'person') { data.forEach(client => client.children.forEach(program => program.children.forEach(project => { if (project.children.some(p => p.personId === selection.id)) projectsWithSelection.add(project.id); }))); } 
        else if (selection.type === 'tag') { data.forEach(client => client.children.forEach(program => program.children.forEach(project => { if (project.children.some(p => p.tags.some(t => t.type === selection.tag.type && t.value === selection.tag.value))) projectsWithSelection.add(project.id); }))); }
        const mainRect = mainPanelRef.current.getBoundingClientRect();
        const newConnections = Array.from(projectsWithSelection).map(id => { const ref = nodeRefs.current.get(id); if (ref && ref.current) { const rect = ref.current.getBoundingClientRect(); return { x: rect.left - mainRect.left + rect.width / 2, y: rect.top - mainRect.top + rect.height / 2 }; } return null; }).filter(Boolean);
        setConnections(newConnections); setHighlightedProjects(projectsWithSelection);
    }, [selection, data, activeFilter]);
    
    const handleUpdate = (action) => {
        const newState = JSON.parse(JSON.stringify(data));
        switch (action.type) {
            case 'ADD_CLIENT':
                if (action.name) newState.push({ id: `client-${Date.now()}`, name: action.name, type: 'client', children: [] });
                break;
            case 'ADD_PROGRAM':
                 const clientForProgram = newState.find(c => c.id === action.clientId);
                 if (action.name && clientForProgram) clientForProgram.children.push({ id: `prog-${Date.now()}`, name: action.name, type: 'program', children: [] });
                break;
            case 'ADD_PROJECT':
                let programForProject = null;
                for (const client of newState) { programForProject = client.children.find(p => p.id === action.programId); if (programForProject) break; }
                if (programForProject) programForProject.children.push({ id: `proj-${Date.now()}`, name: action.name, type: 'project', brief: action.brief, children: [] });
                break;
            case 'UPDATE_PROJECT':
                const findAndReplace = (nodes) => {
                    for (let i = 0; i < nodes.length; i++) {
                        if (nodes[i].type === 'project' && nodes[i].id === action.project.id) {
                            nodes[i] = { ...nodes[i], ...action.project };
                            return true;
                        }
                        if (nodes[i].children && findAndReplace(nodes[i].children)) return true;
                    }
                    return false;
                };
                findAndReplace(newState);
                break;
            case 'DELETE_NODE':
                const pathParts = action.path.split('.').filter(p => p);
                let current = { children: newState }; let parent = null; let finalKey = null;
                for (const part of pathParts) { parent = current; finalKey = part; current = current[part]; }
                if (Array.isArray(parent) && finalKey !== null) { parent.splice(finalKey, 1); } 
                else if (parent && parent.children && finalKey !== null) { parent.children.splice(finalKey, 1); }
                break;
            default: break;
        }
        setData(newState);
     };
    
    const displayedData = activeFilter === 'all' ? data : data.filter(client => client.id === activeFilter);

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                <Header />
                <ClientFilter clients={data} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                <div className="flex flex-1 overflow-hidden">
                    <main ref={mainPanelRef} className="flex-1 p-8 overflow-y-auto relative" onClick={() => { setSelection({type:null}); setDetailedPerson(null); }}>
                        <AffinityConnections connections={connections} />
                        <div className="max-w-7xl mx-auto relative z-20">
                           {displayedData.map((client, clientIndex) => (<div key={client.id} className="mb-8"><Node node={client} level={0} onUpdate={handleUpdate} path={`${clientIndex}`} selection={selection} onPersonSelect={handlePersonSelect} registerNode={registerNode} highlightedProjects={highlightedProjects} onStartEdit={handleStartEdit} /></div>))}
                           {displayedData.length === 0 && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2><p className="mt-2 text-gray-400">Your chart is empty or your filter has no results.</p></div> )}
                        </div>
                    </main>
                    <SidePanel data={data} onTagSelect={handleTagSelect} selection={selection} onUpdate={handleUpdate} onStartAdd={handleStartAdd} />
                </div>
                <ProjectModal 
                    isOpen={modalState !== null} 
                    onClose={handleCloseModal} 
                    onUpdate={handleUpdate} 
                    data={data} 
                    projectData={modalState?.project}
                    onSuggestionSelect={handleSuggestionSelect}
                />
                <PersonDetailCard person={detailedPerson} onClose={() => setDetailedPerson(null)} projectMap={projectMap} />
            </div>
        </div>
    );
}

