import React, { useState } from 'react';
import { Table, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface SuggestionItem {
  id: string;
  title: string;
  submittedBy: string;
  progress: string;
  status: 'open' | 'approved' | 'declined';
  date: string;
}

const SuggestionsPage: React.FC = () => {
  const [data] = useState<SuggestionItem[]>([
    { 
      id: '1', 
      title: 'Milo refill', 
      submittedBy: 'Nasco', 
      progress: '—', 
      status: 'open', 
      date: '01/10/2025' 
    },
  ]);

  const columns: ColumnsType<SuggestionItem> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    {
      title: 'Submitted by',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`statusBadge ${status === 'approved' ? 'statusBadge--active' : ''}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
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
              { key: 'view', label: 'View Suggestion' },
              { key: 'approve', label: 'Approve' },
              { key: 'decline', label: 'Decline' },
              { key: 'delete', label: 'Delete', danger: true },
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

  const handleAction = (key: string, record: SuggestionItem) => {
    console.log('Action:', key, 'on', record);
  };

  return (
    <div className="panel__content">
      <header className="panelHeader">
        <div className="showingLabel">
          Showing: <strong>All Suggestions</strong>
        </div>
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

export default SuggestionsPage;
