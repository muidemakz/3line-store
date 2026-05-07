import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Dropdown, Modal, Form, Input, Select, DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import { useDataStore } from '@/shared/store/data.store';
import type { SessionItem } from '@/shared/store/data.store';
import { formatDate } from '@/shared/utils/date';
import { sessionStatusLabel, sessionStatusClass } from '@/shared/utils/session';
import { formatPoints } from '@/shared/utils/points';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';

import sessionsIcon from '@/assets/sidebar-sessions.svg';

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { sessions: data, orders, addSession, deleteSession } = useDataStore();

  const [sessionForm] = Form.useForm();

  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const [statusFilter, setStatusFilter] = useState('');
  const confirm = useConfirmModal();

  const filteredData = useMemo(() => {
    return data.filter(session => {
      const titleMatch = matchesSearch(session.title, debouncedSearch);
      const statusMatch = statusFilter ? session.status === statusFilter : true;
      return titleMatch && statusMatch;
    });
  }, [data, debouncedSearch, statusFilter]);

  const handleSubmit = (values: { sessionName: string; startDate: Dayjs; endDate: Dayjs }) => {
    addSession({
      title: values.sessionName,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    });
    sessionForm.resetFields();
    setIsModalVisible(false);
  };

  // Per-session derived metrics
  const sessionMetrics = useMemo(() => {
    const map: Record<string, { ordersCount: number; totalPoints: number; participantsCount: number }> = {};
    for (const session of data) {
      const sessionOrders = orders.filter(o => o.sessionId === session.id);
      map[session.id] = {
        ordersCount: sessionOrders.length,
        totalPoints: sessionOrders.reduce((s, o) => s + o.totalPoints, 0),
        participantsCount: new Set(sessionOrders.map(o => o.userId)).size,
      };
    }
    return map;
  }, [data, orders]);

  const closeModal = () => { sessionForm.resetFields(); setIsModalVisible(false); };

  const columns: ColumnsType<SessionItem> = [
    {
      title: 'Session Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Enrolled Users',
      key: 'enrolled',
      render: (_, record) => (
        <span style={{ color: 'var(--text-400)', fontWeight: 400 }}>
          {record.enrolledUserIds.length}
        </span>
      ),
    },
    {
      title: 'Orders',
      key: 'orders',
      render: (_, record) => (
        <span style={{ color: 'var(--text-400)', fontWeight: 400 }}>
          {sessionMetrics[record.id]?.ordersCount ?? 0}
        </span>
      ),
    },
    {
      title: 'Points Spent',
      key: 'points',
      render: (_, record) => (
        <span style={{ color: 'var(--text-400)', fontWeight: 400 }}>
          {formatPoints(sessionMetrics[record.id]?.totalPoints ?? 0, '—')}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={sessionStatusClass(status)}>
          {sessionStatusLabel(status)}
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
              { key: 'view', label: 'View Details', onClick: () => navigate(`/sessions/${record.id}`) },
              {
                key: 'delete',
                label: 'Delete Session',
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  confirm.open({
                    title: 'Delete Session',
                    message: `Are you sure you want to delete "${record.title}"? This cannot be undone.`,
                    confirmLabel: 'Yes, Delete',
                    onConfirm: () => deleteSession(record.id),
                  });
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <div
            className="tableActionDots"
            onClick={(e) => e.stopPropagation()}
          >
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
      <PanelHeader
        showingValue="All Sessions"
        action={{ label: 'New Session', onClick: () => setIsModalVisible(true) }}
      />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search session..."
          onExport={() => {}}
          hasActiveFilters={!!statusFilter}
          onClear={() => setStatusFilter('')}
        >
          <Select
            placeholder="Status"
            allowClear
            value={statusFilter || undefined}
            onChange={val => setStatusFilter(val ?? '')}
            style={{ width: 130, height: 40 }}
            options={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </TableFilterBar>

        {filteredData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="dataTable"
            onRow={(record) => ({
              onClick: () => navigate(`/sessions/${record.id}`),
              style: { cursor: 'pointer' },
            })}
          />
        ) : (
          <EmptyState
            title="No sessions match"
            description={data.length === 0 ? 'Sessions will show here once created' : 'Try adjusting your search criteria'}
            icon={sessionsIcon}
            action={data.length === 0 ? { label: 'Start New Session', onClick: () => setIsModalVisible(true) } : undefined}
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

      <Modal
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        closable={false}
        destroyOnClose
        width={480}
        styles={{ body: { padding: 0 } }}
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Add New Session</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeModal} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">
            Status is set automatically from the dates you choose.
          </div>
        </header>

        <Form
          form={sessionForm}
          layout="vertical"
          onFinish={handleSubmit}
          className="modalBody"
          requiredMark={false}
        >
          <div className="field">
            <Form.Item
              label={<span className="field__label">Session Name</span>}
              name="sessionName"
              rules={[{ required: true, message: 'Please enter a session name' }]}
            >
              <Input className="field__input" placeholder="e.g. End of Year" />
            </Form.Item>
          </div>

          <div className="modalGrid2">
            <div className="field">
              <Form.Item
                label={<span className="field__label">Start Date</span>}
                name="startDate"
                rules={[{ required: true, message: 'Please set a start date' }]}
              >
                <DatePicker
                  style={{ width: '100%', height: 44 }}
                  format="DD/MM/YYYY"
                  placeholder="DD/MM/YYYY"
                  className="field__input"
                />
              </Form.Item>
            </div>

            <div className="field">
              <Form.Item
                label={<span className="field__label">End Date</span>}
                name="endDate"
                dependencies={['startDate']}
                rules={[
                  { required: true, message: 'Please set an end date' },
                  ({ getFieldValue }) => ({
                    validator(_, value: Dayjs | null) {
                      const start: Dayjs | null = getFieldValue('startDate');
                      if (!value || !start) return Promise.resolve();
                      if (!value.isAfter(start, 'day')) {
                        return Promise.reject(new Error('End date must be after start date'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  style={{ width: '100%', height: 44 }}
                  format="DD/MM/YYYY"
                  placeholder="DD/MM/YYYY"
                  className="field__input"
                />
              </Form.Item>
            </div>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }}>Create Session</button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SessionsPage;
