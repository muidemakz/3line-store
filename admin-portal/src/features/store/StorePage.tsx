import React, { useState } from 'react';
import { 
  Table, 
  Dropdown, 
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

// Import Assets


import plusIcon from '@/assets/plus.svg';



interface StoreItem {
  id: string;
  title: string;
  category: string;
  qty: number;
  price: number;
  status: 'active' | 'inactive';
  date: string;
}

const StorePage: React.FC = () => {
  const [data] = useState<StoreItem[]>([
    { id: '1', title: 'Sample item 1', category: 'General', qty: 12, price: 0, status: 'active', date: '01/10/2025' },
    { id: '2', title: 'Sample item 2', category: 'General', qty: 5, price: 0, status: 'active', date: '02/10/2025' },
  ]);

  const columns: ColumnsType<StoreItem> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₦ ${price.toLocaleString()}`,
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
              { key: 'view', label: 'View Item' },
              { key: 'edit', label: 'Edit Item' },
              { key: 'deactivate', label: 'Deactivate' },
              { key: 'delete', label: 'Delete Item', danger: true },
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

  const handleAction = (key: string, record: StoreItem) => {
    console.log('Action:', key, 'on', record);
  };

  return (
    <div className="panel__content">
      <header className="panelHeader">
        <div className="showingLabel">
          Showing: <strong>All Items</strong>
        </div>
        <button className="adminActionBtn">
          <img src={plusIcon} alt="" className="adminActionBtn__icon" />
          <span>Add New Item</span>
        </button>
      </header>

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="dropdownWrapper">
              <button className="secondaryButton" style={{ height: 44, padding: '0 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Search title</span>
              </button>
            </div>
            <button className="secondaryButton" style={{ height: 44 }}>Date</button>
            <button className="adminActionBtn" style={{ height: 44, padding: '0 24px' }}>Apply</button>
          </div>
          <button className="secondaryButton" style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
             Export
          </button>
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

export default StorePage;
