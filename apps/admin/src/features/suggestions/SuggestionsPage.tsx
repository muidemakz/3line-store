import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import { axiosInstance } from '@/shared/api/axios';
import { formatDate } from '@/shared/utils/date';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { notifyError } from '@/shared/lib/toast';

import suggestionsIcon from '@/assets/sidebar-suggestions.svg';

interface SuggestionVoter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface BackendSuggestion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  voteCount: number;
  sessionId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; firstName: string; lastName: string };
  votes?: { user: SuggestionVoter }[];
}

async function fetchSuggestions(): Promise<BackendSuggestion[]> {
  const res = await axiosInstance.get('/suggestions');
  const body = res.data;
  // Handle both { data: [...] } and { data: { data: [...] } }
  const raw = body.data;
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.data)) return raw.data;
  return [];
}

async function deleteSuggestion(id: string): Promise<void> {
  await axiosInstance.delete(`/suggestions/${id}`);
}

const SuggestionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const confirm = useConfirmModal();
  const [expandedVoters, setExpandedVoters] = useState<string | null>(null);

  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['admin-suggestions'],
    queryFn: fetchSuggestions,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] });
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message ?? 'Failed to delete suggestion');
    },
  });

  const filtered = useMemo(() =>
    suggestions.filter(s =>
      matchesSearch(s.title, debouncedSearch) ||
      matchesSearch(`${s.user.firstName} ${s.user.lastName}`, debouncedSearch)
    ),
    [suggestions, debouncedSearch]
  );

  const columns: ColumnsType<BackendSuggestion> = [
    {
      title: 'Suggestion',
      key: 'title',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{record.title}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: 'var(--text-400)', marginTop: 2 }}>
              {record.description.length > 80 ? record.description.slice(0, 80) + '…' : record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Submitted By',
      key: 'submittedBy',
      render: (_, record) => `${record.user.firstName} ${record.user.lastName}`,
    },
    {
      title: 'Votes',
      dataIndex: 'voteCount',
      key: 'voteCount',
      width: 80,
      render: (count: number, record) => (
        <span
          style={{ fontWeight: 700, cursor: record.votes?.length ? 'pointer' : 'default', color: 'var(--accent)' }}
          title={record.votes?.length ? 'Click to see voters' : undefined}
          onClick={() => {
            if (record.votes?.length) {
              setExpandedVoters(expandedVoters === record.id ? null : record.id);
            }
          }}
        >
          {count} ↑
        </span>
      ),
    },
    {
      title: 'Voters',
      key: 'voters',
      render: (_, record) => {
        if (!record.votes || record.votes.length === 0) return <span style={{ color: 'var(--text-400)' }}>—</span>;
        return (
          <div style={{ fontSize: 12 }}>
            {record.votes.map(v => (
              <div key={v.user.id}>{v.user.firstName} {v.user.lastName}</div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Image',
      key: 'image',
      render: (_, record) =>
        record.imageUrl ? (
          <a href={record.imageUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={record.imageUrl}
              alt={record.title}
              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--gray-200)' }}
            />
          </a>
        ) : (
          <span style={{ color: 'var(--text-400)' }}>—</span>
        ),
    },
    {
      title: 'Date Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => confirm.open({
                  title: 'Delete Suggestion',
                  message: `Delete "${record.title}"? This cannot be undone.`,
                  confirmLabel: 'Yes, Delete',
                  onConfirm: () => deleteMutation.mutate(record.id),
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
      <PanelHeader showingValue={`${suggestions.length} Suggestion${suggestions.length !== 1 ? 's' : ''}`} />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search title or user..."
          onExport={() => {}}
        />

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-400)' }}>Loading suggestions…</div>
        ) : error ? (
          <EmptyState
            title="Failed to load suggestions"
            description={(error as any)?.response?.status === 401 ? 'Session expired — please log out and sign in again.' : 'Could not reach the backend. Make sure the server is running.'}
            icon={suggestionsIcon}
          />
        ) : filtered.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filtered.map(s => ({ ...s, key: s.id }))}
            pagination={{ pageSize: 20 }}
            className="dataTable"
          />
        ) : (
          <EmptyState
            title="No suggestions"
            description={suggestions.length === 0 ? 'Suggestions from users will appear here' : 'No results match your search'}
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
