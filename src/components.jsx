// This file processes the raw CSV data and prepares it for the initial upload.

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
    '9': { totalMonthlyCost: 20000, billableRatePerHour: 400, skills: ['Executive Leadership', 'Strategy'] },
    '8': { totalMonthlyCost: 16000, billableRatePerHour: 350, skills: ['Management', 'Strategy'] },
    '7': { totalMonthlyCost: 14000, billableRatePerHour: 300, skills: ['Management', 'Client Relations'] },
    '6': { totalMonthlyCost: 12000, billableRatePerHour: 250, skills: ['Project Management', 'Client Relations'] },
    '5': { totalMonthlyCost: 9000, billableRatePerHour: 180, skills: ['Account Management', 'Coordination'] },
    '4': { totalMonthlyCost: 6000, billableRatePerHour: 120, skills: ['Coordination', 'Reporting'] },
    '3': { totalMonthlyCost: 4000, billableRatePerHour: 80, skills: ['Reporting', 'Admin'] },
    'default': { totalMonthlyCost: 5000, billableRatePerHour: 100, skills: ['General'] }
};

const ukPublicHolidays2025 = [
    { date: '2025-01-01', name: "New Year's Day" },
    { date: '2025-04-18', name: 'Good Friday' },
    { date: '2025-04-21', name: 'Easter Monday' },
    { date: '2025-05-05', name: 'Early May bank holiday' },
    { date: '2025-05-26', name: 'Spring bank holiday' },
    { date: '2025-08-25', name: 'Summer bank holiday' },
    { date: '2025-12-25', name: 'Christmas Day' },
    { date: '2025-12-26', name: 'Boxing Day' },
];

const processedData = (() => {
    const lines = csvData.trim().split('\n').slice(1);
    const people = lines.map((line, index) => {
        const columns = line.split(',');
        const [fullName, email, , , role, jobLevel, , clientPrimary, functionTeam] = columns;
        if (!fullName) return null;
        const level = jobLevel.charAt(0);
        const financialsAndSkills = rateCard[level] || rateCard['default'];
        return {
            id: `person-csv-${index}`,
            personId: `p-${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            name: fullName, role, type: 'person',
            tags: [{ type: 'Team', value: functionTeam || 'N/A' }, { type: 'Location', value: 'London' }],
            email, ooo: null, ...financialsAndSkills,
            clientPrimary: clientPrimary || 'unassigned'
        };
    }).filter(Boolean);

    const clientMap = {};
    people.forEach(person => {
        const clientName = person.clientPrimary;
        if (!clientMap[clientName]) {
            const clientId = `client-${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            clientMap[clientName] = {
                id: clientId, name: clientName, type: 'client', strategicFocus: 'General Business Operations',
                children: [{
                    id: `prog-${clientId}`, name: 'Client Management & Operations', type: 'program',
                    children: [{
                        id: `proj-${clientId}`, name: 'General Account Management', type: 'project',
                        brief: `General account and project management for ${clientName}.`,
                    }]
                }]
            };
        }
    });
    
    const tasks = [];
    const anastasiia = people.find(p => p.name === 'Anastasiia Engelhardt');
    const mark = people.find(p => p.name === 'Mark Kelly');
    const adena = people.find(p => p.name === 'Adena Phillips');
    if (anastasiia && mark) {
        tasks.push(
            { id: 'task-1', projectId: 'proj-electrolux', name: 'Q4 Strategy Deck', assigneeId: anastasiia.personId, startDate: '2025-10-20', endDate: '2025-10-24', estimatedHours: 40, status: 'In Progress', comments: [{id: 'comm-1', author: 'Mark', text: 'Great start on this!'}] },
            { id: 'task-2', projectId: 'proj-electrolux', name: 'Review Creative Concepts', assigneeId: mark.personId, startDate: '2025-10-22', endDate: '2025-10-26', estimatedHours: 16, status: 'To Do', comments: [] }
        );
    }
    if (adena) {
         tasks.push(
            { id: 'task-3', projectId: 'proj-centrica', name: 'Prepare for Client Workshop', assigneeId: adena.personId, startDate: '2025-10-27', endDate: '2025-10-31', estimatedHours: 40, status: 'To Do', comments: [] }
         );
    }
    
    const leave = [
        { leaveId: 'leave-1', personId: adena?.personId, startDate: '2025-10-27', endDate: '2025-10-31', type: 'Holiday' },
        ...ukPublicHolidays2025.map((d, i) => ({ leaveId: `ph-${i}`, personId: 'all', startDate: d.date, endDate: d.date, type: 'Public Holiday' }))
    ].filter(l => l.personId);


    return { initialClients: Object.values(clientMap), initialPeople: people, initialTasks: tasks, initialLeave: leave };
})();

export const { initialClients, initialPeople, initialTasks, initialLeave } = processedData;

