import React from 'react';

const DashboardSectionCard = ({ title, children }) => {
  return (
    <div className="rounded-2xl border border-osdag-border dark:border-gray-700 bg-white dark:bg-black shadow-card hover:shadow-card-hover transition-shadow duration-200 dark:text-white">
      <div className="p-6 border-b border-osdag-border dark:border-gray-700">
        <h2 className="text-card-title text-osdag-text-primary dark:text-white">
          {title}
        </h2>
      </div>
      <div className="h-card-content overflow-y-auto scrollbar-thin">
        <div className="p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardSectionCard;
