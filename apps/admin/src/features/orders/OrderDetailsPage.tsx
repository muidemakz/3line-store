import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, message as antMessage } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useDataStore } from '@/shared/store/data.store';
import { formatDate } from '@/shared/utils/date';
import { orderStatusLabel, orderStatusClass } from '@/shared/utils/order';
import { resolveItemMeta } from '@/shared/utils/items';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import EmptyState from '@/components/common/EmptyState';

import orderIcon from '@/assets/sidebar-suggestions.svg';

interface LineItem {
  key: string;
  itemId: string;
  title: string;
  unit: string;
  qty: number;
  unitPoints: number;
  totalPoints: number;
}

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, users, items, sessions, approveOrder, cancelOrder } = useDataStore();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="panel__content">
        <EmptyState title="Order not found" description="The order you are looking for does not exist." />
      </div>
    );
  }

  const customer = users.find(u => u.id === order.userId);
  const session = sessions.find(s => s.id === order.sessionId);

  const lineItems: LineItem[] = order.items.map(orderItem => {
    const { title, unit } = resolveItemMeta(orderItem.itemId, items);
    return {
      key: orderItem.itemId,
      itemId: orderItem.itemId,
      title,
      unit,
      qty: orderItem.qty,
      unitPoints: orderItem.points, // price snapshot at time of order
      totalPoints: orderItem.points * orderItem.qty,
    };
  });

  const handleApprove = () => {
    approveOrder(order.id);
    antMessage.success('Order approved');
  };

  const handleCancel = () => {
    cancelOrder(order.id);
    antMessage.success(`Order cancelled — ${order.totalPoints} PT refunded to ${customer?.name ?? 'user'}`);
    // modal closes itself via onClose after onConfirm
  };

  const columns: ColumnsType<LineItem> = [
    {
      title: 'Item',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Unit Points',
      dataIndex: 'unitPoints',
      key: 'unitPoints',
      render: (val: number) => (
        <span>
          {val} PT
          <span style={{ fontSize: 11, color: 'var(--text-400)', marginLeft: 4 }}>(at order time)</span>
        </span>
      ),
    },
    {
      title: 'Total Points',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (val: number) => <span style={{ fontWeight: 600 }}>{val} PT</span>,
    },
  ];

  const isPending = order.status === 'pending';
  const isCancellable = order.status !== 'cancelled';

  const infoCards: { label: string; value: React.ReactNode }[] = [
    { label: 'Customer', value: customer?.name ?? '—' },
    { label: 'Session', value: session?.title ?? '—' },
    { label: 'Total Points', value: `${order.totalPoints} PT` },
    {
      label: 'Status',
      value: (
        <span className={orderStatusClass(order.status)}>
          {orderStatusLabel(order.status)}
        </span>
      ),
    },
  ];

  return (
    <div className="panel__content">
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button className="iconButton" onClick={() => navigate(-1)}>
            <span aria-hidden="true">←</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="authTitle" style={{ textAlign: 'left', fontSize: 24, margin: 0 }}>
                Order {order.id}
              </h1>
              <span className={orderStatusClass(order.status)}>
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-400)', marginTop: 4 }}>
              Placed on {formatDate(order.createdAt)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {isPending && (
            <button className="authButton" style={{ width: 'auto', padding: '0 24px' }} onClick={handleApprove}>
              Approve Order
            </button>
          )}
          {isCancellable && (
            <button
              className="secondaryButton"
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
              onClick={() => setIsCancelModalOpen(true)}
            >
              Cancel & Refund
            </button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {infoCards.map(({ label, value }) => (
          <div key={label} className="cardSection" style={{ padding: '16px 20px', minHeight: 'auto' }}>
            <div style={{ fontSize: 12, color: 'var(--text-400)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-900)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Items table */}
      <section className="cardSection" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--gray-200)' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Order Items</span>
          <span style={{ fontSize: 12, color: 'var(--text-400)', marginLeft: 8 }}>
            Points shown are locked at the time this order was placed
          </span>
        </div>
        <Table
          columns={columns}
          dataSource={lineItems}
          pagination={false}
          className="dataTable"
        />
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-200)' }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            Total: <span style={{ color: 'var(--accent)', marginLeft: 8 }}>{order.totalPoints} PT</span>
          </div>
        </div>
      </section>

      {order.status === 'cancelled' && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(217, 45, 32, 0.06)',
            border: '1px solid rgba(217, 45, 32, 0.2)',
            fontSize: 13,
            color: 'var(--danger)',
          }}
        >
          This order was cancelled. <strong>{order.totalPoints} PT</strong> were refunded to {customer?.name ?? 'the user'}'s balance.
        </div>
      )}

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order & Refund"
        message={`Cancel order ${order.id} and refund ${order.totalPoints} PT to ${customer?.name ?? 'the user'}? This cannot be undone.`}
        confirmLabel="Yes, Cancel & Refund"
      />
    </div>
  );
};

export default OrderDetailsPage;
