import React from 'react';
import { DollarSignIcon, BriefcaseIcon, TrendingUpIcon, UsersIcon } from './Icons'; // Assuming you'll add these to Icons.jsx

// A reusable card component for displaying a single metric
const StatCard = ({ title, value, icon, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-start">
        <div className="bg-purple-100 text-purple-600 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
        </div>
    </div>
);

export const FinancialsDashboard = ({ people, projects }) => {
    // --- Calculations ---
    const totalResourceCost = people.reduce((sum, person) => sum + (person.totalMonthlyCost || 0), 0);

    // For revenue, let's assume a standard 160 hours/month for full-time resources
    const potentialMonthlyRevenue = people.reduce((sum, person) => {
        if (person.resourceType === 'Full-Time') {
            return sum + ((person.billableRatePerHour || 0) * 160);
        }
        // Note: Logic for contractors/vendors can be added later
        return sum;
    }, 0);
    
    const totalProjects = projects.length;
    
    const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

    const estimatedMonthlyProfit = potentialMonthlyRevenue - totalResourceCost;

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Financials Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Monthly Resource Cost" 
                    value={formatCurrency(totalResourceCost)} 
                    icon={<UsersIcon className="h-6 w-6" />}
                />
                <StatCard 
                    title="Potential Monthly Revenue" 
                    value={formatCurrency(potentialMonthlyRevenue)} 
                    icon={<DollarSignIcon className="h-6 w-6" />}
                />
                 <StatCard 
                    title="Estimated Monthly Profit" 
                    value={formatCurrency(estimatedMonthlyProfit)} 
                    icon={<TrendingUpIcon className="h-6 w-6" />}
                />
                <StatCard 
                    title="Active Projects" 
                    value={totalProjects} 
                    icon={<BriefcaseIcon className="h-6 w-6" />}
                />
            </div>
            
            {/* Placeholder for future charts */}
            <div className="mt-8 bg-white p-10 rounded-lg shadow-md text-center">
                 <h2 className="text-xl font-semibold text-gray-700">Detailed Charts & Project Profitability</h2>
                 <p className="text-gray-500 mt-2">Coming soon!</p>
            </div>
        </div>
    );
};
