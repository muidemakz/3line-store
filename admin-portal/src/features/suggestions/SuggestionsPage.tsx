import React, { useState, useMemo } from 'react';
import { Table, Dropdown, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';

type RangeValue = [Dayjs | null, Dayjs | null] | null;
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import { useDataStore } from '@/shared/store/data.store';
import type { SuggestionItem } from '@/shared/store/data.store';
import { formatDate } from '@/shared/utils/date';
import { capitalize } from '@/shared/utils/string';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';

import suggestionsIcon from '@/assets/sidebar-suggestions.svg';

const SuggestionsPage: React.FC = () => {
  const { suggestions: data, users, deleteSuggestion } = useDataStore();

  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const confirm = useConfirmModal();

  const filteredData = useMemo(() =>
    data.filter(item => {
      const submittedBy = users.find(u => u.id === item.userId)?.name ?? '';
      return matchesSearch(item.title, debouncedSearch) || matchesSearch(submittedBy, debouncedSearch);
    }),
    [data, users, debouncedSearch]
  );

  const columns: ColumnsType<SuggestionItem> = [
    { title: 'Suggestion Title', dataIndex: 'title', key: 'title', render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Submitted By',
      key: 'submittedBy',
      render: (_: unknown, record: SuggestionItem) => users.find(u => u.id === record.userId)?.name ?? '—',
    },
    { title: 'Date Submitted', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => formatDate(val) },
    { title: 'Progress', dataIndex: 'progress', key: 'progress' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`statusBadge ${status === 'open' ? 'statusBadge--active' : ''}`}>
          {capitalize(status)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'approve', label: 'Approve' },
              { key: 'decline', label: 'Decline' },
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => confirm.open({
                  title: 'Delete Suggestion',
                  message: `Are you sure you want to delete the suggestion "${record.title}"?`,
                  confirmLabel: 'Yes, Delete',
                  onConfirm: () => deleteSuggestion(record.id),
                }),
              },
            ],
          }}
          trigger={['click']}
        >
          <div className="tableActionDots" style={{ cursor: 'pointer', padding: '4px 8px' }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100-2 1 1 0 000 2z" strokeLinecap="round" />
            </svg>
          </div>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="panel__content">
      <PanelHeader showingValue="All Suggestions" />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search title or user..."
          onExport={() => {}}
          hasActiveFilters={!!dateRange}
          onClear={() => setDateRange(null)}
        >
          <DatePicker.RangePicker
            style={{ height: 40, borderRadius: 8 }}
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </TableFilterBar>

        {filteredData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredData.map(s => ({ ...s, key: s.id }))}
            pagination={{ pageSize: 10 }}
            className="dataTable"
          />
        ) : (
          <EmptyState
            title="No suggestions match"
            description={data.length === 0 ? 'Suggestions from users will show here' : 'Try adjusting your search criteria'}
            icon={suggestionsIcon}
          />
        )}
      </section>

      <ConfirmationModal
        isOpen={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
      />
    </div>
  );
};

export default SuggestionsPage;
