import React from 'react';

export const PlusIcon = ({className}) => (/* ... */);
export const TrashIcon = ({ className }) => (/* ... */);
export const EditIcon = ({ className }) => (/* ... */);
export const ListTreeIcon = ({ className }) => (/* ... */);
export const UsersIcon = ({ className }) => (/* ... */);
export const BriefcaseIcon = ({ className }) => (/* ... */);
export const Share2Icon = ({ className }) => (/* ... */);
export const ArrowUpDownIcon = ({ className }) => (/* ... */);
export const MessageSquareIcon = ({ className }) => (/* ... */);
export const MailIcon = ({ className }) => (/* ... */);
export const UserCheckIcon = ({ className }) => (/* ... */);
export const LogOutIcon = ({ className }) => (/* ... */);
export const SearchIcon = ({ className }) => (/* ... */);
export const DollarSignIcon = ({ className }) => (/* ... */);
export const TrendingUpIcon = ({ className }) => (/* ... */);
export const CheckCircleIcon = ({ className }) => (/* ... */); // Already present from Notification
export const AlertCircleIcon = ({ className }) => (/* ... */); // Already present from Notification
export const SpinnerIcon = ({ className }) => (/* ... */);
export const SparklesIcon = ({ className }) => (/* ... */);

// ▼▼▼ No change needed, CheckCircleIcon is already present from our Notification step ▼▼▼
// If it wasn't, we would add:
// export const CheckCircleIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);