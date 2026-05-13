import React from 'react';
import archiveIcon from '@/assets/archive.svg'; 

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="emptyState">
      <img src={icon || archiveIcon} alt="" className="emptyState__icon" />
      <div className="emptyState__title">{title}</div>
      <div className="emptyState__description">{description}</div>
      {action && (
        <button 
          className="adminActionBtn" 
          onClick={action.onClick}
          style={{ marginTop: 24 }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
