import React from 'react';

const EmptyState = ({ icon = '📭', title, subtitle, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">
      {icon}
    </div>
    <div className="text-sm font-semibold text-gray-700 mb-1">{title}</div>
    {subtitle && <div className="text-xs text-gray-400 mb-4 max-w-xs">{subtitle}</div>}
    {action && (
      <button
        onClick={action}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
