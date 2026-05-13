import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Dropdown, Modal, Form, Input, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { axiosInstance } from '@/shared/api/axios';
import { formatDate } from '@/shared/utils/date';
import { deriveSessionStatus, sessionStatusLabel, sessionStatusClass } from '@/shared/utils/session';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';
import { notifyError, notifySuccess } from '@/shared/lib/toast';

import sessionsIcon from '@/assets/sidebar-sessions.svg';

export interface BackendSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  _count: { products: number; orders: number; userPoints: number };
}

// ─── API helpers ──────────────────────────────────────────
const fetchSessions = async (): Promise<BackendSession[]> => {
  const res = await axiosInstance.get('/sessions');
  return Array.isArray(res.data.data) ? res.data.data : [];
};

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const confirm = useConfirmModal();

  // ── Modal state ───────────────────────────────────────────
  const [createOpen, setCreateOpen]     = useState(false);
  const [editOpen, setEditOpen]         = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [selected, setSelected]         = useState<BackendSession | null>(null);

  const [createForm]   = Form.useForm();
  const [editForm]     = Form.useForm();
  const [activateForm] = Form.useForm();

  // ── Query ─────────────────────────────────────────────────
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: fetchSessions,
    staleTime: 30_000,
  });

  const filtered = useMemo(
    () => sessions.filter(s => matchesSearch(s.name, debouncedSearch)),
    [sessions, debouncedSearch],
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });

  // ── Mutations ─────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (v: { sessionName: string; startDate: Dayjs; endDate: Dayjs }) =>
      axiosInstance.post('/sessions', {
        name: v.sessionName,
        startDate: v.startDate.toISOString(),
        endDate: v.endDate.toISOString(),
      }),
    onSuccess: () => { invalidate(); createForm.resetFields(); setCreateOpen(false); },
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to create session'),
  });

  const editMutation = useMutation({
    mutationFn: (v: { name: string; startDate: Dayjs; endDate: Dayjs }) =>
      axiosInstance.patch(`/sessions/${selected!.id}`, {
        name: v.name,
        startDate: v.startDate.toISOString(),
        endDate: v.endDate.toISOString(),
      }),
    onSuccess: () => { invalidate(); notifySuccess('Session updated'); setEditOpen(false); },
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to update session'),
  });

  const activateMutation = useMutation({
    mutationFn: (v: { startDate: Dayjs; endDate: Dayjs }) =>
      axiosInstance.patch(`/sessions/${selected!.id}/activate`, {
        startDate: v.startDate.toISOString(),
        endDate: v.endDate.toISOString(),
      }),
    onSuccess: () => {
      invalidate();
      notifySuccess('Session activated. Points allocated to all active users.');
      setActivateOpen(false);
    },
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to activate session'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => axiosInstance.patch(`/sessions/${id}/deactivate`),
    onSuccess: () => { invalidate(); notifySuccess('Session deactivated'); },
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to deactivate session'),
  });

  // ── Open helpers ──────────────────────────────────────────
  const openEdit = (s: BackendSession) => {
    setSelected(s);
    editForm.setFieldsValue({
      name: s.name,
      startDate: dayjs(s.startDate),
      endDate: dayjs(s.endDate),
    });
    setEditOpen(true);
  };

  const openActivate = (s: BackendSession) => {
    setSelected(s);
    activateForm.setFieldsValue({
      startDate: dayjs(s.startDate),
      endDate: dayjs(s.endDate),
    });
    setActivateOpen(true);
  };

  // ── Columns ───────────────────────────────────────────────
  const columns: ColumnsType<BackendSession> = [
    {
      title: 'Session Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (v) => formatDate(v) },
    { title: 'End Date',   dataIndex: 'endDate',   key: 'endDate',   render: (v) => formatDate(v) },
    { title: 'Orders',    key: 'orders',    render: (_, r) => r._count.orders },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => {
        const s = deriveSessionStatus(r.startDate, r.endDate, r.isActive);
        return <span className={sessionStatusClass(s)}>{sessionStatusLabel(s)}</span>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            label: 'View Details',
            onClick: (e: any) => { e.domEvent.stopPropagation(); navigate(`/sessions/${record.id}`); },
          },
          {
            key: 'edit',
            label: 'Edit Session',
            onClick: (e: any) => { e.domEvent.stopPropagation(); openEdit(record); },
          },
          record.isActive
            ? {
                key: 'deactivate',
                label: 'Deactivate',
                danger: true,
                onClick: (e: any) => {
                  e.domEvent.stopPropagation();
                  confirm.open({
                    title: 'Deactivate Session',
                    message: `Deactivate "${record.name}"? It will no longer be visible in the marketplace.`,
                    confirmLabel: 'Yes, Deactivate',
                    onConfirm: () => deactivateMutation.mutate(record.id),
                  });
                },
              }
            : {
                key: 'activate',
                label: 'Activate Session',
                onClick: (e: any) => { e.domEvent.stopPropagation(); openActivate(record); },
              },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <div className="tableActionDots" onClick={e => e.stopPropagation()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100-2 1 1 0 000 2z" strokeLinecap="round" />
              </svg>
            </div>
          </Dropdown>
        );
      },
    },
  ];

  // ── Shared modal header renderer ──────────────────────────
  const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <header className="modalHeader">
      <div className="modalHeader__titleRow">
        <span className="modalHeader__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
            <path d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="modalHeader__titles">
          <div className="modalHeader__title">{title}</div>
        </div>
        <button className="modalHeader__close" type="button" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );

  const DateFields = (_props: { endAfter?: string }) => (
    <div className="modalGrid2">
      <div className="field">
        <Form.Item label={<span className="field__label">Start Date</span>} name="startDate" rules={[{ required: true, message: 'Required' }]}>
          <DatePicker style={{ width: '100%', height: 44 }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" className="field__input" />
        </Form.Item>
      </div>
      <div className="field">
        <Form.Item
          label={<span className="field__label">End Date</span>}
          name="endDate"
          dependencies={['startDate']}
          rules={[
            { required: true, message: 'Required' },
            ({ getFieldValue }) => ({
              validator(_, value: Dayjs | null) {
                const start: Dayjs | null = getFieldValue('startDate');
                if (!value || !start) return Promise.resolve();
                if (!value.isAfter(start, 'day')) return Promise.reject(new Error('Must be after start date'));
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker style={{ width: '100%', height: 44 }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" className="field__input" />
        </Form.Item>
      </div>
    </div>
  );

  return (
    <div className="panel__content">
      <PanelHeader
        showingValue="All Sessions"
        action={{ label: 'New Session', onClick: () => setCreateOpen(true) }}
      />

      <section className="cardSection" style={{ padding: 0, minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search session..."
          onExport={() => {}}
        />

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-400)' }}>Loading sessions…</div>
        ) : error ? (
          <EmptyState title="Failed to load sessions" description="Could not reach the backend." icon={sessionsIcon} />
        ) : filtered.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filtered.map(s => ({ ...s, key: s.id }))}
            pagination={{ pageSize: 10 }}
            className="dataTable"
            onRow={record => ({ onClick: () => navigate(`/sessions/${record.id}`), style: { cursor: 'pointer' } })}
          />
        ) : (
          <EmptyState
            title="No sessions found"
            description={sessions.length === 0 ? 'Create your first session to get started' : 'No sessions match your search'}
            icon={sessionsIcon}
            action={sessions.length === 0 ? { label: 'New Session', onClick: () => setCreateOpen(true) } : undefined}
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

      {/* ── Create Session ── */}
      <Modal open={createOpen} onCancel={() => { createForm.resetFields(); setCreateOpen(false); }} footer={null} closable={false} destroyOnClose width={480} styles={{ body: { padding: 0 } }}>
        <ModalHeader title="New Session" onClose={() => { createForm.resetFields(); setCreateOpen(false); }} />
        <Form form={createForm} layout="vertical" onFinish={createMutation.mutate} className="modalBody" requiredMark={false}>
          <div className="field">
            <Form.Item label={<span className="field__label">Session Name</span>} name="sessionName" rules={[{ required: true, message: 'Required' }]}>
              <Input className="field__input" placeholder="e.g. Q1 2026 Palliative" />
            </Form.Item>
          </div>
          <DateFields />
          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={() => { createForm.resetFields(); setCreateOpen(false); }}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Session'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* ── Edit Session ── */}
      <Modal open={editOpen} onCancel={() => setEditOpen(false)} footer={null} closable={false} destroyOnClose width={480} styles={{ body: { padding: 0 } }}>
        <ModalHeader title="Edit Session" onClose={() => setEditOpen(false)} />
        <Form form={editForm} layout="vertical" onFinish={editMutation.mutate} className="modalBody" requiredMark={false}>
          <div className="field">
            <Form.Item label={<span className="field__label">Session Name</span>} name="name" rules={[{ required: true, message: 'Required' }]}>
              <Input className="field__input" placeholder="e.g. Q1 2026 Palliative" />
            </Form.Item>
          </div>
          <DateFields />
          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }} disabled={editMutation.isPending}>
              {editMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* ── Activate Session (confirm dates) ── */}
      <Modal open={activateOpen} onCancel={() => setActivateOpen(false)} footer={null} closable={false} destroyOnClose width={480} styles={{ body: { padding: 0 } }}>
        <ModalHeader title="Activate Session" onClose={() => setActivateOpen(false)} />
        <Form form={activateForm} layout="vertical" onFinish={activateMutation.mutate} className="modalBody" requiredMark={false}>
          <p style={{ color: 'var(--text-600)', fontSize: 14, marginBottom: 20 }}>
            Confirm or adjust the dates for <strong>{selected?.name}</strong>. Once activated, it will be visible in the marketplace and points will be allocated to all active users.
          </p>
          <DateFields />
          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={() => setActivateOpen(false)}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }} disabled={activateMutation.isPending}>
              {activateMutation.isPending ? 'Activating…' : 'Activate Session'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SessionsPage;
