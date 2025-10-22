import React from 'react';
import { SpinnerIcon } from './Icons'; // Import the icon from our main file

export const LoadingSpinner = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            {/* Use the imported icon and apply classes here */}
            <SpinnerIcon className="h-10 w-10 text-purple-600" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading Application...</h2>
            <p className="text-gray-500">Please wait a moment.</p>
        </div>
    );
};

