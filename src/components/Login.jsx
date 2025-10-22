import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener in App.jsx will handle the redirect
        } catch (err) {
            setError('Failed to log in. Please check your email and password.');
            console.error("Login error:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-center text-gray-800">Resource Planner</h1>
                <p className="text-center text-gray-600">Please sign in to continue</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md"
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
                            className="w-full px-3 py-2 mt-1 border rounded-md"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
                    >
                        Log In
                    </button>
                </form>
            </div>
        </div>
    );
};
