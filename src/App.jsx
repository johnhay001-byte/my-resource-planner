import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';

// --- Data Processing from CSV ---
// This section processes the raw CSV data into the structured format the application needs.

const csvData = `Full Name,Employee email,Legal Last Name,Legal First Name,Business Title,TARGET Omnicom Job level,Employee Type,Client_Primary,Function,Line Manager Name,Line Manager Email,People leader level I,People leader level II,People leader level III,People leader level IV
Adena Phillips,adena.phillips@omc.com,Phillips,Adena,Account Director,6-Manager/Specialized professional,,Centrica,Account Management,Donna Edgecombe,donna.edgecombe@omc.com,Donna Edgecombe,,Michael Turnbull,Mariusz Urbanczyk
Alistair Eglinton,alistair.eglinton@omc.com,Eglinton,Alistair,Client Director,6-Manager/Specialized professional,,SIE (PS),Account Management,Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,,,,Mariusz Urbanczyk
Anastasiia Engelhardt,anastasia.engelhardt@omc.com,Engelhardt,Anastasiia,Senior Account Manager,5-Supervisor/Senior-level professional,,Electrolux,Account Management,Mark Kelly,mark.kelly@omc.com,Mark Kelly,,Michael Turnbull,Mariusz Urbanczyk
Archie Harrison,archie.harrison@omc.com,Harrison,Archie,Account Manager,4-Intermediate-level professional,,Juul,Account Management,Theodore Tsangarides,theo.tsangarides@omc.com,Theodore Tsangarides,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Aristides Pietrangeli,ari.pietrangeli@omc.com,Pietrangeli,Aristides,Group Account Director,6-Manager/Specialized professional,,Kenvue,Account Management,Donna Edgecombe,donna.edgecombe@omc.com,Donna Edgecombe,,Michael Turnbull,Mariusz Urbanczyk
Arnaud Robin,arnaud.robin@omc.com,Robin,Arnaud,Client Director,6-Manager/Specialized professional,,ExxonMobil,Account Management,Michael Turnbull,michael.turnbull@omc.com,,Michael Turnbull,,Mariusz Urbanczyk
Arturo Garcia,arturo.garcia@omc.com,Garcia,Arturo,Senior Account Manager,5-Supervisor/Senior-level professional,,Bacardi,Account Management,Mark Kelly,mark.kelly@omc.com,Mark Kelly,,Michael Turnbull,Mariusz Urbanczyk
Charles Bacon,charles.bacon@omc.com,Bacon,Charles,Account Manager,4-Intermediate-level professional,,Organon,Account Management,Mark Kelly,mark.kelly@omc.com,Mark Kelly,,Michael Turnbull,Mariusz Urbanczyk
Charlotte Chan,charlotte.chan@omc.com,Chan,Charlotte,Account Director,6-Manager/Specialized professional,,PMI,Account Management,Theo Oxizidis,theo.oxizidis@omc.com,Theo Oxizidis,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Chloe West,chloe.west@omc.com,West,Chloe,Account Executive,3-Entry-level professional,,unassigned,Account Management,Theodore Tsangarides,theo.tsangarides@omc.com,Theodore Tsangarides,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Christopher Williams,christopher.williams@omc.com,Williams,Christopher,Account Director,6-Manager/Specialized professional,,Seat,Account Management,Marina Belik,marina.belik@omc.com,,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Daniela And Soruco,daniela.andsoruco@omc.com,And Soruco,Daniela,Group Account Director,6-Manager/Specialized professional,,Enterprise,Account Management,Marina Belik,marina.belik@omc.com,,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Donna Edgecombe,donna.edgecombe@omc.com,Edgecombe,Donna,Business Director,7-Director/Seasoned professional,,Centrica,Account Management,Michael Turnbull,michael.turnbull@omc.com,,Michael Turnbull,,Mariusz Urbanczyk
Elizabeth Tulloch,elizabeth.tulloch@omc.com,Tulloch,Elizabeth,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,,,,Mariusz Urbanczyk
Elnaz Manan,elnaz.manan@omc.com,Manan,Elnaz,Account Executive,3-Entry-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Emily Taylor,emily.taylor@omc.com,Taylor,Emily,Senior Account Manager,5-Supervisor/Senior-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Erika Falcon,erika.falcon@omc.com,Falcon,Erika,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Federica Alemanno,federica.alemanno@omc.com,Alemanno,Federica,Client Director,6-Manager/Specialized professional,,unassigned,Account Management,Michael Turnbull,michael.turnbull@omc.com,,Michael Turnbull,,Mariusz Urbanczyk
Grace Walker,grace.walker@omc.com,Walker,Grace,Senior Account Executive,3-Entry-level professional,,JustEat,Account Management,Xochitl Gomez Cruz,xochitl.gomezcruz@omc.com,Xochitl Gomez Cruz,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Henry Daglish,henry.daglish@omc.com,Daglish,Henry,CEO,9-Senior Executive leader,,unassigned,Executive Leadership,Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,,,,Mariusz Urbanczyk
Ian enlist,ian.enlist@omc.com,enlist,Ian,Senior Account Executive,3-Entry-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Jemima Maunder-Taylor,jemima.maunder-taylor@omc.com,Maunder-Taylor,Jemima,Senior Account Manager,5-Supervisor/Senior-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Jeremias Galiano,jeremias.galiano@omc.com,Galiano,Jeremias,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Joanna Lecinska,joanna.lecinska@omc.com,Lecinska,Joanna,Finance Director,7-Director/Seasoned professional,,unassigned,Finance,Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,,,,Mariusz Urbanczyk
Joanna Ly,joanna.ly@omc.com,Ly,Joanna,Senior Account Manager,5-Supervisor/Senior-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Lara Balio,lara.balio@omc.com,Balio,Lara,Account Manager,4-Intermediate-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Laurence Harrison,laurence.harrison@omc.com,Harrison,Laurence,Group Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Lavinia Schiopu,lavinia.schiopu@omc.com,Schiopu,Lavinia,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Marina Belik,marina.belik@omc.com,Belik,Marina,Business Director,7-Director/Seasoned professional,,JustEat,Account Management,Michael Turnbull,michael.turnbull@omc.com,,Michael Turnbull,,Mariusz Urbanczyk
Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,Urbanczyk,Mariusz,Managing Director,8-Executive leader,,unassigned,Executive Leadership,Henry Daglish,henry.daglish@omc.com,Henry Daglish,,,
Mark Kelly,mark.kelly@omc.com,Kelly,Mark,Group Account Director,6-Manager/Specialized professional,,Electrolux,Account Management,Michael Turnbull,michael.turnbull@omc.com,,Michael Turnbull,,Mariusz Urbanczyk
Maximilian Czwalina,max.czwalina@omc.com,Czwalina,Maximilian,Account Manager,4-Intermediate-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Michael Turnbull,michael.turnbull@omc.com,Turnbull,Michael,Managing Partner,8-Executive leader,,unassigned,Executive Leadership,Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,,,,Mariusz Urbanczyk
Natalie Fox,natalie.fox@omc.com,Fox,Natalie,Account Manager,4-Intermediate-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Nevena Tonceva,nevena.tonceva@omc.com,Tonceva,Nevena,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Nicholas Wright,nicholas.wright@omc.com,Wright,Nicholas,Group Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Othman Chiheb,othman.chiheb@omc.com,Chiheb,Othman,Finance Manager,6-Manager/Specialized professional,,unassigned,Finance,Joanna Lecinska,joanna.lecinska@omc.com,Joanna Lecinska,,Mariusz Urbanczyk,
Oyinda Eghosa-Okojie,oyinda.okojie@omc.com,Eghosa-Okojie,Oyinda,Finance Analyst,4-Intermediate-level professional,,unassigned,Finance,Othman Chiheb,othman.chiheb@omc.com,Othman Chiheb,Joanna Lecinska,Mariusz Urbanczyk,
Paola Romero,paola.romero@omc.com,Romero,Paola,Senior Account Manager,5-Supervisor/Senior-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Prachi Mittal,prachi.mittal@omc.com,Mittal,Prachi,Finance Business Partner,5-Supervisor/Senior-level professional,,unassigned,Finance,Joanna Lecinska,joanna.lecinska@omc.com,Joanna Lecinska,,Mariusz Urbanczyk,
Randeep Reehal,randeep.reehal@omc.com,Rehal,Randeep,Group Finance Director,7-Director/Seasoned professional,,unassigned,Finance,Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,,,,Mariusz Urbanczyk
Rebecca Cox,rebecca.cox@omc.com,Cox,Rebecca,Senior Account Manager,5-Supervisor/Senior-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Roxana Lupa,roxana.lupa@omc.com,Lupa,Roxana,Senior Account Executive,3-Entry-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Sam Carrington,sam.carrington@omc.com,Carrington,Sam,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Sarah Heesom,sarah.heesom@omc.com,Heesom,Sarah,Head of HR,7-Director/Seasoned professional,,unassigned,HR,Mariusz Urbanczyk,mariusz.urbanczyk@omc.com,,,,Mariusz Urbanczyk
Silvia Corani,silvia.corani@omc.com,Corani,Silvia,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Sophie Wooller,sophie.wooller@omc.com,Wooller,Sophie,Account Executive,3-Entry-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Theo Oxizidis,theo.oxizidis@omc.com,Oxizidis,Theo,Group Account Director,6-Manager/Specialized professional,,PMI,Account Management,Marina Belik,marina.belik@omc.com,,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Theodore Tsangarides,theo.tsangarides@omc.com,Tsangarides,Theodore,Account Director,6-Manager/Specialized professional,,Juul,Account Management,Marina Belik,marina.belik@omc.com,,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
Valeriya Kovachka,valeriya.kovachka@omc.com,Kovachka,Valeriya,Senior Account Manager,5-Supervisor/Senior-level professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Viktoria Horvath,viktoria.horvath@omc.com,Horvath,Viktoria,Account Director,6-Manager/Specialized professional,,Diageo,Account Management,Elizabeth Tulloch,elizabeth.tulloch@omc.com,Elizabeth Tulloch,,,Mariusz Urbanczyk
Xochitl Gomez Cruz,xochitl.gomezcruz@omc.com,Gomez Cruz,Xochitl,Senior Account Manager,5-Supervisor/Senior-level professional,,JustEat,Account Management,Marina Belik,marina.belik@omc.com,,Marina Belik,Michael Turnbull,Mariusz Urbanczyk
`;

const rateCard = {
    '9': { totalMonthlyCost: 20000, billableRatePerHour: 400 },
    '8': { totalMonthlyCost: 16000, billableRatePerHour: 350 },
    '7': { totalMonthlyCost: 14000, billableRatePerHour: 300 },
    '6': { totalMonthlyCost: 12000, billableRatePerHour: 250 },
    '5': { totalMonthlyCost: 9000, billableRatePerHour: 180 },
    '4': { totalMonthlyCost: 6000, billableRatePerHour: 120 },
    '3': { totalMonthlyCost: 4000, billableRatePerHour: 80 },
    'default': { totalMonthlyCost: 5000, billableRatePerHour: 100 }
};

const processCsvData = (csv) => {
    const lines = csv.trim().split('\n').slice(1);
    const people = lines.map((line, index) => {
        const columns = line.split(',');
        const [fullName, email, , , role, jobLevel, , clientPrimary, functionTeam] = columns;
        
        if (!fullName) return null;

        const level = jobLevel.charAt(0);
        const financials = rateCard[level] || rateCard['default'];

        return {
            id: `person-csv-${index}`,
            personId: `p-${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            name: fullName,
            role: role,
            type: 'person',
            tags: [
                { type: 'Team', value: functionTeam || 'N/A' },
                { type: 'Location', value: 'London' }
            ],
            email: email,
            ooo: null,
            assignments: [],
            ...financials,
            clientPrimary: clientPrimary || 'unassigned'
        };
    }).filter(Boolean);

    const clients = {};
    people.forEach(person => {
        const clientName = person.clientPrimary;
        if (!clients[clientName]) {
            clients[clientName] = {
                id: `client-${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                name: clientName,
                type: 'client',
                strategicFocus: 'General Business Operations',
                children: [
                    {
                        id: `prog-${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                        name: 'Client Management & Operations',
                        type: 'program',
                        children: [
                            {
                                id: `proj-${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
                                name: 'General Account Management',
                                type: 'project',
                                brief: `General account and project management for ${clientName}.`,
                                children: []
                            }
                        ]
                    }
                ]
            };
        }
        clients[clientName].children[0].children[0].children.push(person);
    });

    return Object.values(clients);
};

const initialData = processCsvData(csvData);

const PlusIcon = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const TrashIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>);
const SparkleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"></path><path d="M22 2l-2.5 2.5"></path><path d="M2 22l2.5-2.5"></path><path d="M2 2l2.5 2.5"></path><path d="M18 6l1 1"></path></svg>);
const EditIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>);
const MailIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const CalendarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const WandIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L11 10l-1.5 1.5 3.52 3.52L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z"></path><path d="m14 7 3 3"></path><path d="M5 6v4"></path><path d="M19 14v4"></path><path d="M10 2v2"></path><path d="M7 8H3"></path><path d="M21 16h-4"></path><path d="M11 3H9"></path></svg>);
const DollarSignIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const ArrowUpDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>);
const UsersIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);


// --- Helper Functions ---
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);


// --- Main App Components ---

const Header = () => ( <div className="p-6 bg-white border-b border-gray-200"> <h1 className="text-3xl font-bold text-gray-800">Project & Resource Visualizer</h1> <p className="mt-1 text-gray-600">Click a person to see their projects, or use the side panel to filter by tags and manage your team.</p> </div> );
const ClientFilter = ({ clients, activeFilter, onFilterChange }) => ( <div className="px-8 py-4 bg-gray-50 border-b border-gray-200"> <div className="flex items-center space-x-2 overflow-x-auto pb-2"> <span className="font-semibold text-gray-600 flex-shrink-0">Filter by Client:</span> <button onClick={() => onFilterChange('all')} className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>All Clients</button> {clients.map(client => ( <button key={client.id} onClick={() => onFilterChange(client.id)} className={`px-4 py-1.5 text-sm font-medium rounded-full flex-shrink-0 ${activeFilter === client.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>{client.name}</button>))} </div> </div> );

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
                    {!isClient && <button onClick={(e) => { e.stopPropagation(); onUpdate({ type: 'DELETE_NODE', path }); }} className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200" aria-label="Delete item"><TrashIcon className="h-4 w-4" /></button>}
                </div>
            </div>
            {node.children && node.children.length > 0 && (<div className="mt-2">{node.children.map((child, index) => ( <Node key={child.id} node={child} level={level + 1} onUpdate={onUpdate} path={`${path}.children.${index}`} selection={selection} onPersonSelect={onPersonSelect} registerNode={registerNode} highlightedProjects={highlightedProjects} onStartEdit={onStartEdit} /> ))}</div>)}
        </div>
    );
};

const ProjectModal = ({ isOpen, onClose, onUpdate, data, projectData, onSuggestionSelect, allPeople }) => {
    const isEditMode = !!projectData;
    const [projectName, setProjectName] = useState('');
    const [programId, setProgramId] = useState('');
    const [projectBrief, setProjectBrief] = useState('');
    const [geminiResult, setGeminiResult] = useState(null);
    const [teamSuggestions, setTeamSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // New state for team assignment form
    const [personToAssign, setPersonToAssign] = useState('');
    const [allocation, setAllocation] = useState(100);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]);

    const { allPrograms } = useMemo(() => {
        const programs = [];
        data.forEach(client => {
            client.children.forEach(program => {
                programs.push({...program, clientName: client.name});
            });
        });
        return { allPrograms: programs };
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
    
    const handleAddAssignment = () => {
        if (!personToAssign || !projectData) return;
        const assignment = {
            personId: personToAssign,
            projectId: projectData.id,
            allocation: parseInt(allocation, 10),
            startDate,
            endDate
        };
        onUpdate({ type: 'ASSIGN_PERSON', assignment });
    };

    const handleRemoveAssignment = (personId) => {
        onUpdate({ type: 'UNASSIGN_PERSON', personId, projectId: projectData.id });
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
        setPersonToAssign(''); setAllocation(100);
        if (shouldTriggerCallback) onClose();
    };

    if (!isOpen) return null;
    
    const projectTeam = projectData?.children || [];
    const unassignedPeople = allPeople.filter(p => !projectTeam.some(teamMember => teamMember.personId === p.personId));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Project' : 'Add New Project'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Project Details & AI */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Project Details</h3>
                        <div className="space-y-4">
                            <select value={programId} onChange={e => setProgramId(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50" disabled={isEditMode}><option value="">Select a Program...</option>{allPrograms.map(p => <option key={p.id} value={p.id}>{p.clientName} / {p.name}</option>)}</select>
                            <input type="text" placeholder="Project Name" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full p-2 border rounded-md" />
                            <textarea placeholder="Enter a detailed project brief here..." value={projectBrief} onChange={e => setProjectBrief(e.target.value)} className="w-full p-2 border rounded-md h-32" />
                        </div>
                    </div>

                    {/* Right Column: Team Assignments */}
                    {isEditMode && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Team Assignments</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <h4 className="font-semibold">Add New Member</h4>
                             <select value={personToAssign} onChange={e => setPersonToAssign(e.target.value)} className="w-full p-2 border rounded-md">
                                <option value="">Select a person...</option>
                                {unassignedPeople.map(p => <option key={p.personId} value={p.personId}>{p.name}</option>)}
                            </select>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" value={allocation} onChange={e => setAllocation(e.target.value)} placeholder="Allocation %" className="w-full p-2 border rounded-md" />
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-md" />
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-md" />
                            </div>
                            <button onClick={handleAddAssignment} disabled={!personToAssign} className="w-full flex items-center justify-center p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                                <PlusIcon className="h-4 w-4 mr-2" /> Assign to Project
                            </button>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Current Team</h4>
                            <div className="space-y-2">
                                {projectTeam.length > 0 ? projectTeam.map(p => (
                                    <div key={p.personId} className="flex items-center justify-between p-2 bg-white border rounded-md">
                                        <span>{p.name}</span>
                                        <button onClick={() => handleRemoveAssignment(p.personId)} className="p-1 text-red-500 hover:text-red-700">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                )) : <p className="text-sm text-gray-500">No one is assigned to this project yet.</p>}
                            </div>
                        </div>
                    </div>
                    )}
                </div>
                
                <div className="mt-8 flex justify-end gap-4 border-t pt-6">
                    <button onClick={() => handleClose()} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button onClick={handleSubmit} disabled={!projectName || (!programId && !isEditMode)} className="px-4 py-2 bg-purple-600 text-white rounded-md disabled:bg-gray-400">
                        {isEditMode ? 'Save Changes' : 'Create Project'}
                    </button>
                </div>
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
                
                <div className="mb-6"><h3 className="font-semibold text-gray-700 mb-2">Financials</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                        <div>
                            <p className="text-sm text-gray-500">Monthly Cost</p>
                            <p className="text-lg font-semibold">{formatCurrency(person.totalMonthlyCost)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Billable Rate</p>
                            <p className="text-lg font-semibold">{formatCurrency(person.billableRatePerHour)}/hr</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6"><h3 className="font-semibold text-gray-700 mb-2">Current Assignments ({totalAllocation}% Capacity)</h3><div className="space-y-3">{person.assignments?.map(ass => (<div key={ass.projectId}><div className="flex justify-between items-center mb-1"><span className="font-medium">{projectMap.get(ass.projectId)?.name || 'Unknown Project'}</span><span className="text-sm font-semibold text-gray-600">{ass.allocation}%</span></div><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${ass.allocation}%` }}></div></div><p className="text-xs text-gray-500 mt-1">{formatDate(ass.startDate)} - {formatDate(ass.endDate)}</p></div>))}{(!person.assignments || person.assignments.length === 0) && <p className="text-sm text-gray-500">No active assignments.</p>}</div></div>
                <div className="space-y-4">{Object.entries(groupedTags).map(([type, values]) => (<div key={type}><h3 className="font-semibold text-gray-700 mb-2">{type}</h3><div className="flex flex-wrap gap-2">{values.map(value => (<span key={value} className="bg-gray-200 text-gray-800 px-3 py-1 text-sm font-medium rounded-full">{value}</span>))}</div></div>))}</div>
            </div>
        </div>
    );
};

const TeamManagementView = ({ people, onPersonSelect }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

    const sortedPeople = useMemo(() => {
        let sortableItems = [...people];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = sortConfig.key === 'team' ? (a.tags.find(t => t.type === 'Team')?.value || '') : a[sortConfig.key];
                const bVal = sortConfig.key === 'team' ? (b.tags.find(t => t.type === 'Team')?.value || '') : b[sortConfig.key];
                
                if (aVal < bVal) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [people, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getTeam = (person) => person.tags.find(t => t.type === 'Team')?.value || 'N/A';
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center"><UsersIcon className="h-6 w-6 mr-3" />Team Overview</h2>
            <div className="overflow-x-auto bg-white rounded-lg border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['name', 'role', 'team', 'totalMonthlyCost', 'billableRatePerHour'].map(key => (
                                <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <button onClick={() => requestSort(key)} className="flex items-center">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                        <ArrowUpDownIcon className="h-4 w-4 ml-2 text-gray-400" />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPeople.map((person) => (
                            <tr key={person.personId} onClick={() => onPersonSelect(person.personId)} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getTeam(person)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(person.totalMonthlyCost)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(person.billableRatePerHour)}/hr</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SidePanel = ({ data, onTagSelect, selection, onUpdate, onStartAdd, allPeople, onPersonSelect }) => {
    const [activeTab, setActiveTab] = useState('visualize');
    const tags = useMemo(() => {
        const allTags = new Map();
        const crawl = (nodes) => { for(const node of nodes) { if (node.type === 'person' && node.tags) { node.tags.forEach(tag => { if (!allTags.has(tag.type)) allTags.set(tag.type, new Set()); allTags.get(tag.type).add(tag.value); }); } if (node.children) crawl(node.children); } };
        crawl(data); return allTags;
    }, [data]);

    return (
        <div className="w-full lg:w-[48rem] bg-white p-6 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
            <div className="border-b border-gray-200 mb-4"><nav className="flex space-x-4"><button onClick={() => setActiveTab('visualize')} className={`py-2 px-4 font-semibold ${activeTab === 'visualize' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Visualize</button><button onClick={() => setActiveTab('team')} className={`py-2 px-4 font-semibold ${activeTab === 'team' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Team</button><button onClick={() => setActiveTab('manage')} className={`py-2 px-4 font-semibold ${activeTab === 'manage' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Manage</button></nav></div>
            {activeTab === 'visualize' && ( <div><h2 className="text-2xl font-bold text-gray-800 mb-6">Visualization Controls</h2><div className="space-y-6">{Array.from(tags.keys()).map(type => ( <div key={type}><h3 className="font-semibold text-gray-700 mb-2">{type}</h3><div className="flex flex-wrap gap-2">{Array.from(tags.get(type)).map(value => { const isSelected = selection?.type === 'tag' && selection.tag.type === type && selection.tag.value === value; return <button key={value} onClick={() => onTagSelect({type, value})} className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${isSelected ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>{value}</button>; })}</div></div>))}</div></div> )}
            {activeTab === 'team' && ( <TeamManagementView people={allPeople} onPersonSelect={onPersonSelect} /> )}
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

    const { findPersonById, projectMap, allPeople, clients } = useMemo(() => {
        const personMap = new Map();
        const projMap = new Map();
        const pList = [];
        const clientList = [];
        const crawl = (nodes, level = 0) => {
            for(const node of nodes) {
                if (level === 0) clientList.push(node);
                if (node.type === 'person') {
                    personMap.set(node.personId, node);
                    pList.push(node);
                }
                if (node.type === 'project') projMap.set(node.id, node);
                if (node.children) crawl(node.children, level + 1);
            }
        };
        crawl(data);
        const uniquePeople = Array.from(new Map(pList.map(p => [p.personId, p])).values());
        return { 
            findPersonById: (personId) => personMap.get(personId), 
            projectMap: projMap,
            allPeople: uniquePeople,
            clients: clientList
        };
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

    const handleTagSelect = (tag) => {
        setDetailedPerson(null);
        setSelection(prev => (prev.tag?.value === tag.value && prev.tag?.type === tag.type ? {type: null, tag: null} : {type: 'tag', tag: tag}));
    }
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
        let newState = JSON.parse(JSON.stringify(data));
        let personPool = allPeople;

        const findNodeByPath = (path) => {
            const parts = path.split('.').filter(p => p);
            let current = { children: newState };
            for(const part of parts) { current = current[part]; }
            return current;
        }

        const findParentByPath = (path) => {
            const parts = path.split('.').filter(p => p);
            let current = { children: newState }; let parent = null;
            for(const part of parts) { parent = current; current = current[part]; }
            return parent;
        }
        
        const findPersonInTree = (personId, nodes) => {
            for (const node of nodes) {
                if(node.personId === personId) return node;
                if(node.children) {
                    const found = findPersonInTree(personId, node.children);
                    if(found) return found;
                }
            }
            return null;
        }

        switch (action.type) {
            case 'ASSIGN_PERSON': {
                const { personId, projectId, allocation, startDate, endDate } = action.assignment;
                const personToAssign = personPool.find(p => p.personId === personId);
                
                if (personToAssign) {
                    // Update person's assignment list
                    const updatedPerson = findPersonInTree(personId, newState);
                    if (updatedPerson) {
                         if (!updatedPerson.assignments) updatedPerson.assignments = [];
                         updatedPerson.assignments.push({ projectId, allocation, startDate, endDate });
                    }
                    
                    // Add person to project's children
                    let projectNode = null;
                    const findProject = (nodes) => {
                       for(const node of nodes) {
                           if(node.id === projectId) { projectNode = node; return; }
                           if(node.children) findProject(node.children);
                       }
                    }
                    findProject(newState);

                    if (projectNode) {
                        if (!projectNode.children.some(p => p.personId === personId)) {
                            projectNode.children.push(personToAssign);
                        }
                    }
                }
                break;
            }
             case 'UNASSIGN_PERSON': {
                const { personId, projectId } = action;
                
                // Remove from project's children
                let projectNode = null;
                 const findProject = (nodes) => {
                       for(const node of nodes) {
                           if(node.id === projectId) { projectNode = node; return; }
                           if(node.children) findProject(node.children);
                       }
                    }
                findProject(newState);
                if (projectNode) {
                    projectNode.children = projectNode.children.filter(p => p.personId !== personId);
                }

                // Remove assignment from person
                const personToUpdate = findPersonInTree(personId, newState);
                if (personToUpdate && personToUpdate.assignments) {
                    personToUpdate.assignments = personToUpdate.assignments.filter(a => a.projectId !== projectId);
                }
                break;
            }
            case 'DELETE_NODE': {
                const parent = findParentByPath(action.path);
                const finalKey = action.path.split('.').pop();
                if (parent && parent.children) {
                    parent.children.splice(finalKey, 1);
                }
                break;
            }
            // Other cases remain the same
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
            default: break;
        }
        setData(newState);
        // Force re-render of modal if it's open for an edited project
        if (action.type === 'ASSIGN_PERSON' || action.type === 'UNASSIGN_PERSON') {
            const updatedProject = findNodeByPath(Object.keys(projectMap).find(key => projectMap[key] === modalState?.project) || '');
            if(modalState && modalState.project) {
                 let projectNode = null;
                 const findProject = (nodes) => {
                       for(const node of nodes) {
                           if(node.id === modalState.project.id) { projectNode = node; return; }
                           if(node.children) findProject(node.children);
                       }
                    }
                findProject(newState);
                setModalState({ project: projectNode });
            }
        }
     };
    
    const displayedData = activeFilter === 'all' ? data : data.filter(client => client.id === activeFilter);

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            <div className="flex flex-col h-screen">
                <Header />
                <ClientFilter clients={clients} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                <div className="flex flex-1 overflow-hidden">
                    <main ref={mainPanelRef} className="flex-1 p-8 overflow-y-auto relative" onClick={() => { setSelection({type:null}); setDetailedPerson(null); }}>
                        <AffinityConnections connections={connections} />
                        <div className="max-w-7xl mx-auto relative z-20">
                           {displayedData.map((client, clientIndex) => (<div key={client.id} className="mb-8"><Node node={client} level={0} onUpdate={handleUpdate} path={`${clientIndex}`} selection={selection} onPersonSelect={handlePersonSelect} registerNode={registerNode} highlightedProjects={highlightedProjects} onStartEdit={handleStartEdit} /></div>))}
                           {displayedData.length === 0 && ( <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed"><h2 className="text-2xl font-semibold text-gray-500">No clients to display.</h2><p className="mt-2 text-gray-400">Your chart is empty or your filter has no results.</p></div> )}
                        </div>
                    </main>
                    <SidePanel data={data} onTagSelect={handleTagSelect} selection={selection} onUpdate={handleUpdate} onStartAdd={handleStartAdd} allPeople={allPeople} onPersonSelect={handlePersonSelect} />
                </div>
                <ProjectModal 
                    isOpen={modalState !== null} 
                    onClose={handleCloseModal} 
                    onUpdate={handleUpdate} 
                    data={data} 
                    projectData={modalState?.project}
                    onSuggestionSelect={handleSuggestionSelect}
                    allPeople={allPeople}
                />
                <PersonDetailCard person={detailedPerson} onClose={() => setDetailedPerson(null)} projectMap={projectMap} />
            </div>
        </div>
    );
}

