import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Dropdown, message as antMessage } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDataStore } from '@/shared/store/data.store';
import type { OrderItem } from '@/shared/store/data.store';
import type { OrderStatus } from '@/shared/utils/order';
import { formatDate } from '@/shared/utils/date';
import { sessionStatusLabel, sessionStatusClass } from '@/shared/utils/session';
import { orderStatusLabel, orderStatusClass } from '@/shared/utils/order';
import { resolveItemMeta } from '@/shared/utils/items';
import { formatPoints } from '@/shared/utils/points';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import TableFilterBar from '@/components/common/TableFilterBar';
import AddOrderModal from './components/AddOrderModal';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import EmptyState from '@/components/common/EmptyState';

interface ShoppingListRow {
  itemId: string;
  title: string;
  unit: string;
  qty: number;
  points: number;
}

import orderIcon from '@/assets/sidebar-suggestions.svg';
import historyIcon from '@/assets/sidebar-sessions.svg';

const SessionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sessions, orders, items, users, toggleSessionStatus, approveOrder, cancelOrder } = useDataStore();
  const session = sessions.find(s => s.id === id);

  const [activeTab, setActiveTab] = useState('orders');
  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="panel__content">
        <EmptyState title="Session not found" description="The session you are looking for does not exist." />
      </div>
    );
  }

  const allSessionOrders = useMemo(() => {
    return orders.filter(o => o.sessionId === id);
  }, [orders, id]);

  const metrics = useMemo(() => ({
    ordersCount: allSessionOrders.length,
    totalPointsSpent: allSessionOrders.reduce((sum, o) => sum + o.totalPoints, 0),
    participatingUsers: new Set(allSessionOrders.map(o => o.userId)).size,
  }), [allSessionOrders]);

  const sessionOrders = useMemo(() => {
    return allSessionOrders.filter(o =>
      matchesSearch(users.find(u => u.id === o.userId)?.name ?? '', debouncedSearch) ||
      matchesSearch(o.id, debouncedSearch)
    );
  }, [allSessionOrders, users, debouncedSearch]);

  const shoppingList = useMemo(() => {
    const agg: Record<string, { title: string; unit: string; qty: number; points: number; itemId: string }> = {};
    allSessionOrders.forEach(order => {
      order.items.forEach(orderItem => {
        const { title, unit } = resolveItemMeta(orderItem.itemId, items);
        if (!agg[orderItem.itemId]) {
          agg[orderItem.itemId] = { title, unit, qty: 0, points: orderItem.points, itemId: orderItem.itemId };
        }
        agg[orderItem.itemId].qty += orderItem.qty;
      });
    });
    return Object.values(agg).filter(i => matchesSearch(i.title, debouncedSearch));
  }, [allSessionOrders, items, debouncedSearch]);

  const isActive = session.status === 'active';

  const toggleLabel = session.status === 'active'
    ? 'Deactivate Session'
    : session.status === 'upcoming'
    ? 'Activate Now'
    : 'Reactivate Session';

  const handleToggleStatus = () => {
    toggleSessionStatus(session.id);
    antMessage.success(
      session.status === 'active' ? 'Session deactivated' : 'Session activated — points allocated to enrolled users'
    );
    setIsToggleModalOpen(false);
  };

  const cancellingOrder = cancelOrderId ? allSessionOrders.find(o => o.id === cancelOrderId) : null;

  const handleCancelOrder = () => {
    if (!cancelOrderId) return;
    cancelOrder(cancelOrderId);
    antMessage.success(`Order cancelled — ${cancellingOrder?.totalPoints ?? 0} PT refunded`);
    setCancelOrderId(null);
  };

  const orderColumns: ColumnsType<OrderItem> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => users.find(u => u.id === record.userId)?.name ?? '—',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (orderItems: OrderItem['items']) =>
        `${orderItems.reduce((s, i) => s + i.qty, 0)} Items`,
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (val) => formatPoints(val),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <span className={orderStatusClass(status)}>
          {orderStatusLabel(status)}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => formatDate(val),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Details',
                onClick: () => navigate(`/orders/${record.id}`),
              },
              ...(record.status === 'pending' ? [{
                key: 'approve',
                label: 'Approve',
                onClick: () => { approveOrder(record.id); antMessage.success('Order approved'); },
              }] : []),
              ...(record.status !== 'cancelled' ? [{
                key: 'cancel',
                label: 'Cancel & Refund',
                danger: true,
                onClick: () => setCancelOrderId(record.id),
              }] : []),
            ],
          }}
          trigger={['click']}
        >
          <div
            className="tableActionDots"
            style={{ cursor: 'pointer', padding: '4px 8px' }}
            onClick={(e) => e.stopPropagation()}
          >
            ...
          </div>
        </Dropdown>
      ),
    },
  ];

  const shoppingColumns: ColumnsType<ShoppingListRow> = [
    { title: 'Item', dataIndex: 'title', key: 'title', render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { title: 'Total Qty', dataIndex: 'qty', key: 'qty', render: (val: number) => `${val} Units` },
    { title: 'Unit Points', dataIndex: 'points', key: 'points', render: (val: number) => formatPoints(val) },
    { title: 'Total Points', key: 'total', render: (_: unknown, record: ShoppingListRow) => formatPoints(record.points * record.qty) },
  ];

  return (
    <div className="panel__content">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button className="iconButton" onClick={() => navigate('/sessions')}>
            <span aria-hidden="true">←</span>
          </button>
          <div>
            <div className="breadcrumb">
              <img src={historyIcon} alt="" className="breadcrumb__home" />
              <span className="breadcrumb__current">/ Session Details</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <h1 className="authTitle" style={{ textAlign: 'left', fontSize: 24, margin: 0 }}>
                {session.title}
              </h1>
              <span className={sessionStatusClass(session.status)}>
                {sessionStatusLabel(session.status)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-400)', marginTop: 4 }}>
              {formatDate(session.startDate)} — {formatDate(session.endDate)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="secondaryButton"
            style={{
              borderColor: isActive ? 'var(--danger)' : 'var(--accent)',
              color: isActive ? 'var(--danger)' : 'var(--accent)',
            }}
            onClick={() => setIsToggleModalOpen(true)}
          >
            {toggleLabel}
          </button>
          <Dropdown
            menu={{
              items: [
                { key: 'single', label: 'Single Order', onClick: () => setIsOrderModalOpen(true) },
                { key: 'bulk', label: 'Bulk Upload' },
              ],
            }}
            disabled={!isActive}
          >
            <button
              className="authButton"
              style={{
                width: 'auto',
                padding: '0 24px',
                opacity: !isActive ? 0.5 : 1,
                cursor: !isActive ? 'not-allowed' : 'pointer',
              }}
              title={!isActive ? 'Session must be active to add orders' : undefined}
            >
              + Add New Order
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Enrolled Users', value: session.enrolledUserIds.length },
          { label: 'Total Orders', value: metrics.ordersCount },
          { label: 'Points Spent', value: formatPoints(metrics.totalPointsSpent, '—') },
          { label: 'Participating Users', value: metrics.participatingUsers },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="cardSection"
            style={{ padding: '16px 20px', minHeight: 'auto' }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-400)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-900)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + table */}
      <section className="cardSection" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="tabs"
          style={{ padding: '0 24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: 24 }}
        >
          {(['orders', 'shopping'] as const).map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'tab--active' : ''}`}
              onClick={() => { setActiveTab(tab); setSearchText(''); }}
              style={{
                padding: '16px 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : 'none',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-400)',
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab === 'orders' ? 'Order list' : 'Shopping list'}
            </button>
          ))}
        </div>

        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder={activeTab === 'orders' ? 'Search by customer or order ID' : 'Search items'}
          onExport={() => antMessage.info('Exporting...')}
        />

        <div className="tabContent tabContent--active">
          {activeTab === 'orders' ? (
            sessionOrders.length > 0 ? (
              <Table
                columns={orderColumns}
                dataSource={sessionOrders.map(o => ({ ...o, key: o.id }))}
                pagination={{ pageSize: 10 }}
                className="dataTable"
              />
            ) : (
              <EmptyState
                title="No orders yet"
                description={isActive ? 'Orders added to this session will show here' : 'Activate the session to start adding orders'}
                icon={orderIcon}
                action={isActive ? { label: 'Add New Order', onClick: () => setIsOrderModalOpen(true) } : undefined}
              />
            )
          ) : (
            shoppingList.length > 0 ? (
              <Table
                columns={shoppingColumns}
                dataSource={shoppingList.map(i => ({ ...i, key: i.itemId }))}
                pagination={{ pageSize: 10 }}
                className="dataTable"
              />
            ) : (
              <EmptyState
                title="Shopping list empty"
                description="Aggregated list of items will show here once orders are placed"
                icon={orderIcon}
              />
            )
          )}
        </div>
      </section>

      <AddOrderModal
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        sessionId={session.id}
      />

      <ConfirmationModal
        isOpen={isToggleModalOpen}
        onClose={() => setIsToggleModalOpen(false)}
        onConfirm={handleToggleStatus}
        title={toggleLabel}
        message={
          session.status === 'active'
            ? `Deactivating "${session.title}" will stop new orders. No points will be changed.`
            : `Activating "${session.title}" will allocate grade-level points to all currently active users.`
        }
        confirmLabel={`Yes, ${toggleLabel}`}
      />

      <ConfirmationModal
        isOpen={!!cancelOrderId}
        onClose={() => setCancelOrderId(null)}
        onConfirm={handleCancelOrder}
        title="Cancel Order & Refund"
        message={
          cancellingOrder
            ? `Cancel order ${cancellingOrder.id} and refund ${cancellingOrder.totalPoints} PT to the customer? This cannot be undone.`
            : 'Cancel this order and refund points to the customer? This cannot be undone.'
        }
        confirmLabel="Yes, Cancel & Refund"
      />
    </div>
  );
};

export default SessionDetailsPage;
