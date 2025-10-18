import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { initialClients, initialPeople, initialTasks, initialLeave, initialPrograms, initialProjects } from './data.js'; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3looppMOn2k_waQp4EuDC5WH9KfNUPfM",
  authDomain: "my-resource-planner.firebaseapp.com",
  projectId: "my-resource-planner",
  storageBucket: "my-resource-planner.firebasestorage.app",
  messagingSenderId: "765125484407",
  appId: "1:765125484407:web:53708796b14d6ef5900b72"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadInitialData() {
    console.log("Starting initial data upload...");
    const batch = writeBatch(db);

    initialPeople.forEach(person => {
        const docRef = doc(db, "people", person.personId);
        batch.set(docRef, person);
    });
    console.log(`${initialPeople.length} people batched.`);

    initialClients.forEach(client => {
        const docRef = doc(db, "clients", client.id);
        batch.set(docRef, client);
    });
    console.log(`${initialClients.length} clients batched.`);
    
    initialPrograms.forEach(program => {
        const docRef = doc(db, "programs", program.id);
        batch.set(docRef, program);
    });
    console.log(`${initialPrograms.length} programs batched.`);

    initialProjects.forEach(project => {
        const docRef = doc(db, "projects", project.id);
        batch.set(docRef, project);
    });
    console.log(`${initialProjects.length} projects batched.`);

    initialTasks.forEach(task => {
        const docRef = doc(db, "tasks", task.id);
        batch.set(docRef, task);
    });
    console.log(`${initialTasks.length} tasks batched.`);

    initialLeave.forEach(leaveItem => {
        const docRef = doc(db, "leave", leaveItem.leaveId);
        batch.set(docRef, leaveItem);
    });
    console.log(`${initialLeave.length} leave items batched.`);

    try {
        await batch.commit();
        console.log("Initial data uploaded successfully!");
    } catch (error) {
        console.error("Error uploading initial data: ", error);
    }
}

uploadInitialData().then(() => {
    console.log('Seeder script finished. Press Ctrl+C to exit.');
});

