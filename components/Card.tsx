import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type CardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  actionButton?: React.ReactNode;
};

export default function Card({
  title,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  collapsible = false,
  defaultCollapsed = false,
  actionButton
}: CardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <div 
        className={`px-4 py-3 flex items-center justify-between ${
          collapsible ? 'cursor-pointer hover:bg-gray-50' : ''
        } ${headerClassName}`}
        onClick={toggleCollapse}
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center space-x-2">
          {actionButton && <div onClick={e => e.stopPropagation()}>{actionButton}</div>}
          {collapsible && (
            isCollapsed 
              ? <ChevronDown className="w-5 h-5 text-gray-500" /> 
              : <ChevronUp className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className={`p-4 ${bodyClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
} 