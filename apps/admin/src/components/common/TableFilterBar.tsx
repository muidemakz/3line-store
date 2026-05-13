import React from 'react';
import FieldInput from './FieldInput';

interface TableFilterBarProps {
  searchText: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  onExport?: () => void;
  onClear?: () => void;
  hasActiveFilters?: boolean;
  children?: React.ReactNode;
}

const TableFilterBar: React.FC<TableFilterBarProps> = ({
  searchText,
  onSearchChange,
  searchPlaceholder = "Search...",
  onExport,
  onClear,
  hasActiveFilters,
  children,
}) => {
  // Derived: show clear button if search has text OR parent signals active filters
  const showClear = !!searchText || !!hasActiveFilters;

  const handleClear = () => {
    onSearchChange('');
    onClear?.();
  };

  return (
    <div
      className="tableFilterBar"
      style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--gray-200)',
        gap: 12,
      }}
    >
      <div style={{ flexShrink: 0, width: 280 }}>
        <FieldInput
          size="small"
          leftIcon={
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          }
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {children}
      {showClear && (
        <button
          className="tableFilterBar__clearBtn"
          onClick={handleClear}
          type="button"
          aria-label="Clear all filters"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          Clear filters
        </button>
      )}
      {onExport && (
        <button className="secondaryButton" style={{ height: 40, flexShrink: 0, marginLeft: 'auto' }} onClick={onExport}>
          Export
        </button>
      )}
    </div>
  );
};

export default TableFilterBar;
