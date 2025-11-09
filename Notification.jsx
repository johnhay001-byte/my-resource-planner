import React from 'react';
import { CheckCircleIcon, AlertCircleIcon } from './Icons'; // We'll add these icons next

export const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const isSuccess = type === 'success';

    return (
        <div 
            className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg flex items-center animate-fade-in-fast ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
            <div className="flex-shrink-0">
                {isSuccess ? (
                    <CheckCircleIcon className="h-5 w-5" />
                ) : (
                    <AlertCircleIcon className="h-5 w-5" />
                )}
            </div>
            <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
            </div>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black hover:bg-opacity-10">
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    );
};