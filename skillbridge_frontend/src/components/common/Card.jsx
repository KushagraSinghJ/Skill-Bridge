import React from 'react';

const Card = ({ children, className = '', title, subtitle, footer, headerAction }) => {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
            {(title || subtitle || headerAction) && (
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
                        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            <div className="p-6 flex-1">
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
