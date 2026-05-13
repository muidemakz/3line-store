import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import TableFilterBar from '@/components/common/TableFilterBar';
import { axiosInstance } from '@/shared/api/axios';
import { formatDate } from '@/shared/utils/date';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';

import orderIcon from '@/assets/sidebar-suggestions.svg';

interface OrderItemRow {
  id: string;
  productId: string;
  quantity: number;
  pointsPrice: number;
  product: { id: string; title: string; pointsPrice: number };
}

interface BackendOrder {
  id: string;
  userId: string;
  sessionId: string;
  totalPoints: number;
  status: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  session: { id: string; name: string };
  orderItems: OrderItemRow[];
}

async function fetchAllOrders(): Promise<BackendOrder[]> {
  const res = await axiosInstance.get('/orders/admin/all');
  const raw = res.data.data;
  return Array.isArray(raw) ? raw : [];
}

function statusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending': return 'gold';
    case 'processing': return 'blue';
    case 'shipped': return 'cyan';
    case 'delivered': return 'green';
    case 'cancelled': return 'red';
    default: return 'default';
  }
}

const OrdersPage: React.FC = () => {
  const { searchText, setSearchText, debouncedSearch } = useSearch();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAllOrders,
    staleTime: 30_000,
  });

  const filtered = useMemo(() =>
    orders.filter(o =>
      matchesSearch(`${o.user.firstName} ${o.user.lastName}`, debouncedSearch) ||
      matchesSearch(o.user.email, debouncedSearch) ||
      matchesSearch(o.id, debouncedSearch) ||
      matchesSearch(o.session.name, debouncedSearch)
    ),
    [orders, debouncedSearch]
  );

  const columns: ColumnsType<BackendOrder> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <span style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>
          {text.slice(0, 12)}…
        </span>
      ),
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.user.firstName} {record.user.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-400)' }}>{record.user.email}</div>
        </div>
      ),
    },
    {
      title: 'Session',
      key: 'session',
      render: (_, record) => record.session.name,
    },
    {
      title: 'Items',
      key: 'items',
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.orderItems.map(item => (
            <div key={item.id}>{item.product.title} × {item.quantity}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (val: number) => <span style={{ fontWeight: 700 }}>{val} PT</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColor(status)} style={{ textTransform: 'capitalize' }}>
          {status.charAt(0) + status.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => formatDate(val),
    },
  ];

  return (
    <div className="panel__content">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-900)', margin: 0 }}>
          All Orders
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-400)', marginTop: 4 }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} from all users
        </p>
      </div>

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search by customer, email, session or order ID..."
          onExport={() => {}}
        />

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-400)' }}>Loading orders…</div>
        ) : error ? (
          <EmptyState
            title="Failed to load orders"
            description="Could not connect to the backend. Make sure the server is running."
            icon={orderIcon}
          />
        ) : filtered.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filtered.map(o => ({ ...o, key: o.id }))}
            pagination={{ pageSize: 20 }}
            className="dataTable"
          />
        ) : (
          <EmptyState
            title="No orders yet"
            description={orders.length === 0 ? 'Orders placed by users will appear here' : 'No results match your search'}
            icon={orderIcon}
          />
        )}
      </section>
    </div>
  );
};

export default OrdersPage;
