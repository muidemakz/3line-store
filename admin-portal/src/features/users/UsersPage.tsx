import React, { useState } from 'react';
import { Table, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

// Import Assets
import plusIcon from '@/assets/plus.svg';

interface UserItem {
  id: string;
  name: string;
  staff: string;
  grade: string;
  points: number;
  status: 'active' | 'inactive';
}

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [data] = useState<UserItem[]>([
    { 
      id: '1', 
      name: 'Nasco', 
      staff: 'Nasco', 
      grade: 'Grade A', 
      points: 0, 
      status: 'active' 
    },
  ]);

  const columns: ColumnsType<UserItem> = [
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    {
      title: 'Staff(s)',
      dataIndex: 'staff',
      key: 'staff',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Points Balance',
      dataIndex: 'points',
      key: 'points',
      render: (points) => `${points.toLocaleString()} pts`,
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Staff' },
              { key: 'edit', label: 'Edit Staff' },
              { key: 'deactivate', label: 'Deactivate' },
              { key: 'delete', label: 'Delete Staff', danger: true },
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

  const handleAction = (key: string, record: UserItem) => {
    console.log('Action:', key, 'on', record);
  };

  return (
    <div className="panel__content">
      <header className="panelHeader">
        <div className="showingLabel">
          Showing: <strong>All Staff(s)</strong>
        </div>
        <button className="adminActionBtn" onClick={() => navigate('/users/new')}>
          <img src={plusIcon} alt="" className="adminActionBtn__icon" />
          <span>Add Staff</span>
        </button>
      </header>

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="secondaryButton" style={{ height: 44 }}>Search name</button>
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

export default UsersPage;
