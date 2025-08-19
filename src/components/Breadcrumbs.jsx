import React from 'react';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumbs({ crumbs, onCrumbClick }) {
  return (
    <div className="p-4 bg-white border-b">
      <nav className="flex items-center text-sm font-medium text-gray-500">
        {crumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id || 'root'}>
            <span onClick={() => onCrumbClick(index)} className="cursor-pointer hover:text-indigo-600">
              {crumb.name}
            </span>
            {index < crumbs.length - 1 && <FiChevronRight className="mx-2" />}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}
