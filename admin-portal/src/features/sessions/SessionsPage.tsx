import React, { useState, useRef } from 'react';
import { Table, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';

import historyIcon from '@/assets/sidebar-sessions.svg';

interface SessionItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed';
}

const SessionsPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState<SessionItem[]>([
    { id: '1', title: 'Morning Session', startDate: '01/10/2025', endDate: '30/10/2025', status: 'completed' },
    { id: '2', title: 'Afternoon Batch', startDate: '02/10/2025', endDate: '31/10/2025', status: 'active' },
  ]);

  const formRef = useRef<HTMLFormElement>(null);
  const [sessionName, setSessionName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const isFormValid = sessionName.trim() && startDate.trim() && endDate.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setData(prev => [...prev, {
      id: Date.now().toString(),
      title: sessionName,
      startDate,
      endDate,
      status: 'active',
    }]);
    setSessionName('');
    setStartDate('');
    setEndDate('');
    setIsModalVisible(false);
  };

  const columns: ColumnsType<SessionItem> = [
    {
      title: 'Session Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`statusBadge ${status === 'active' ? 'statusBadge--active' : ''}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Details' },
              { key: 'stop', label: 'Stop Session', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <div className="tableActionDots" style={{ cursor: 'pointer', padding: '4px 8px' }}>...</div>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="panel__content">
      <PanelHeader
        showingValue="All Sessions"
        action={{
          label: "New Session",
          onClick: () => setIsModalVisible(true)
        }}
      />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="secondaryButton">Search session</button>
            <button className="secondaryButton">Status</button>
            <button className="adminActionBtn" style={{ padding: '0 24px' }}>Apply</button>
          </div>
          <button className="secondaryButton">Export</button>
        </div>

        {data.length > 0 ? (
          <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} className="dataTable" />
        ) : (
          <EmptyState
            title="No Session yet"
            description="Sessions started will show here"
            icon={historyIcon}
            action={{ label: "Start New Session", onClick: () => setIsModalVisible(true) }}
          />
        )}
      </section>

      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        closable={false}
        destroyOnClose
        width={480}
        styles={{ body: { padding: 0 } }}
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2z" stroke="#667085" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M9 8h6M9 12h6" stroke="#667085" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Add New Session</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={() => setIsModalVisible(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Provide the session details below.</div>
        </header>

        <form className="modalBody" ref={formRef} onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field__label">Session Name</span>
            <input
              className="field__input"
              name="sessionName"
              placeholder="e.g End of year"
              required
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
            />
          </label>

          <div className="modalGrid2">
            <label className="field">
              <span className="field__label">Start Date</span>
              <div className="field__inputWrap">
                <input
                  className="field__input field__input--withIcon"
                  name="startDate"
                  placeholder="DD/MM/YYYY"
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <span className="field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M7 3v3M17 3v3M4 9h16" stroke="#667085" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#667085" strokeWidth="2" />
                  </svg>
                </span>
              </div>
            </label>
            <label className="field">
              <span className="field__label">End Date</span>
              <div className="field__inputWrap">
                <input
                  className="field__input field__input--withIcon"
                  name="endDate"
                  placeholder="DD/MM/YYYY"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                <span className="field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M7 3v3M17 3v3M4 9h16" stroke="#667085" strokeWidth="2" strokeLinecap="round" />
                    <path d="M6 6h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#667085" strokeWidth="2" />
                  </svg>
                </span>
              </div>
            </label>
          </div>

          <div className="modalActions">
            <button className="secondaryButton" type="button" onClick={() => setIsModalVisible(false)}>Cancel</button>
            <button className="authButton" type="submit" disabled={!isFormValid} style={{ flex: 1 }}>Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SessionsPage;
