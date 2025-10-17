import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";

function App() {
  const [status, setStatus] = useState("Connecting to database...");

  useEffect(() => {
    // This is a simple test to verify the database connection.
    const checkConnection = async () => {
      try {
        // We try to get a list of collections. We don't care about the data,
        // just that the request doesn't fail.
        await getDocs(collection(db, "people")); // Tries to access the 'people' collection
        setStatus("Application Shell Loaded Successfully. Ready to build features.");
      } catch (error) {
        console.error("Firebase Connection Error:", error);
        setStatus("Error connecting to the database. Please check your Firebase security rules and configuration.");
      }
    };

    checkConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Project & Resource Visualizer</h1>
      <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#4A5568' }}>
        {status}
      </p>
    </div>
  );
}

export default App;

