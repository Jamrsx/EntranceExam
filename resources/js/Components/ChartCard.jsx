import React from 'react';

/**
 * Accessible, responsive card wrapper for charts
 */
const ChartCard = ({ title, subtitle, action, children }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

export default ChartCard;


