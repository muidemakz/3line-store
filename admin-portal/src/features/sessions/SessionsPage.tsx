import React, { useState } from 'react';
import { Table, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

// Import Assets
import plusIcon from '@/assets/plus.svg';


interface SessionItem {
  id: string;
  name: string;
  start: string;
  end: string;
  status: 'active' | 'inactive';
  users: number;
  date: string;
}

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data] = useState<SessionItem[]>([
    { id: '1', name: 'End of year', start: '01/10/2025', end: '30/12/2025', status: 'active', users: 0, date: '01/10/2025' },
  ]);

  const columns: ColumnsType<SessionItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    {
      title: 'Start',
      dataIndex: 'start',
      key: 'start',
    },
    {
      title: 'End',
      dataIndex: 'end',
      key: 'end',
    },
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
      title: 'Staff(s)',
      dataIndex: 'users',
      key: 'users',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Session' },
              { key: 'edit', label: 'Edit Session' },
              { key: 'close', label: 'Close Session' },
              { key: 'delete', label: 'Delete Session', danger: true },
            ],
            onClick: ({ key }) => handleAction(key, record),
          }}
          trigger={['click']}
        >
          <div className="tableActionDots">...</div>
        </Dropdown>
      ),
    },
  ];

  const handleAction = (key: string, record: SessionItem) => {
    console.log('Action:', key, 'on', record);
  };

  return (
    <div className="panel__content">
      <header className="panelHeader">
        <div className="showingLabel">
          Showing: <strong>All Sessions</strong>
        </div>
        <button className="adminActionBtn" onClick={() => navigate('/sessions/new')}>
          <img src={plusIcon} alt="" className="adminActionBtn__icon" />
          <span>Start New Session</span>
        </button>
      </header>

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="secondaryButton" style={{ height: 44 }}>Search title</button>
            <button className="secondaryButton" style={{ height: 44 }}>Date</button>
            <button className="adminActionBtn" style={{ height: 44, padding: '0 24px' }}>Apply</button>
          </div>
          <button className="secondaryButton" style={{ height: 44 }}>Export</button>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ background: 'transparent' }}
          className="dataTable"
        />
      </section>
    </div>
  );
};

export default SessionsPage;
