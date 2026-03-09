import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-blue-50 text-blue-700 border-blue-100',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        danger: 'bg-rose-50 text-rose-700 border-rose-100',
        secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
