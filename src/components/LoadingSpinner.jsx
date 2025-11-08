import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// A simple loading spinner component for the login button
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const auth = getAuth(); // Get the auth instance
        try {
            // Try to sign in with the provided credentials
            await signInWithEmailAndPassword(auth, email, password);
            // On success, the onAuthStateChanged listener in App.jsx will handle the redirect
        } catch (err) {
            // On failure, show an error message
            setError('Failed to log in. Please check your email and password.');
            console.error("Login error:", err);
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-center text-gray-800">Project & Resource Visualizer</h1>
                <p className="text-center text-gray-600">Please sign in to continue</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="you@company.com"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                            placeholder="••••••••"
                        />
                    </div>
                    {/* Show error message if login fails */}
                    {error && (
                        <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Spinner /> : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    );
};