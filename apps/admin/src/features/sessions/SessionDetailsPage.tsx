import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Modal, Form, DatePicker, Select, InputNumber, Button } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import TableFilterBar from '@/components/common/TableFilterBar';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { axiosInstance } from '@/shared/api/axios';
import { formatDate } from '@/shared/utils/date';
import { deriveSessionStatus, sessionStatusLabel, sessionStatusClass } from '@/shared/utils/session';
import { formatPoints } from '@/shared/utils/points';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';
import { notifyError, notifySuccess } from '@/shared/lib/toast';

import orderIcon from '@/assets/sidebar-suggestions.svg';

// ─── Types ────────────────────────────────────────────────
interface OrderItem {
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
  orderItems: OrderItem[];
}

interface BackendSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count: { products: number; orders: number; userPoints: number };
}

interface ShoppingRow {
  productId: string;
  title: string;
  totalQty: number;
  pointsPrice: number;
}

interface EnrolledUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  allocatedPoints: number;
  remainingPoints: number;
}

interface AdminProduct {
  id: string;
  title: string;
  brand?: string;
  pointsPrice: number;
}

interface NewOrderItem {
  productId: string;
  quantity: number;
}

// ─── API fetchers ─────────────────────────────────────────
async function fetchSessions(): Promise<BackendSession[]> {
  const res = await axiosInstance.get('/sessions');
  const raw = res.data.data;
  return Array.isArray(raw) ? raw : [];
}

async function fetchOrders(sessionId: string): Promise<BackendOrder[]> {
  const res = await axiosInstance.get(`/orders/admin/all?sessionId=${sessionId}`);
  const raw = res.data.data;
  return Array.isArray(raw) ? raw : [];
}

async function fetchEnrolledUsers(sessionId: string): Promise<EnrolledUser[]> {
  const res = await axiosInstance.get(`/orders/admin/enrolled-users/${sessionId}`);
  return Array.isArray(res.data.data) ? res.data.data : [];
}

async function fetchAllProducts(): Promise<AdminProduct[]> {
  const res = await axiosInstance.get('/products/admin/all');
  return Array.isArray(res.data.data) ? res.data.data : [];
}

function statusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING':    return 'gold';
    case 'PROCESSING': return 'blue';
    case 'SHIPPED':    return 'cyan';
    case 'DELIVERED':  return 'green';
    case 'CANCELLED':  return 'red';
    default:           return 'default';
  }
}

// ─── Component ────────────────────────────────────────────
const SessionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'orders' | 'shopping'>('orders');
  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const confirm = useConfirmModal();

  const [activateOpen, setActivateOpen] = useState(false);
  const [activateForm] = Form.useForm();

  // ── Add Order state ───────────────────────────────────────
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [orderUserId, setOrderUserId]   = useState<string | null>(null);
  const [orderItems, setOrderItems]     = useState<NewOrderItem[]>([{ productId: '', quantity: 1 }]);

  // ── Queries ───────────────────────────────────────────────
  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['admin-sessions'],
    queryFn: fetchSessions,
    staleTime: 60_000,
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-orders', id],
    queryFn: () => fetchOrders(id!),
    enabled: !!id,
    staleTime: 30_000,
  });

  const { data: enrolledUsers = [] } = useQuery({
    queryKey: ['enrolled-users', id],
    queryFn: () => fetchEnrolledUsers(id!),
    enabled: !!id && addOrderOpen,
    staleTime: 30_000,
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchAllProducts,
    enabled: addOrderOpen,
    staleTime: 60_000,
  });

  const session = sessions.find(s => s.id === id);
  const isLoading = loadingSessions || loadingOrders;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
  };

  // ── Mutations ─────────────────────────────────────────────
  const activateMutation = useMutation({
    mutationFn: (v: { startDate: Dayjs; endDate: Dayjs }) =>
      axiosInstance.patch(`/sessions/${id}/activate`, {
        startDate: v.startDate.toISOString(),
        endDate:   v.endDate.toISOString(),
      }),
    onSuccess: () => {
      invalidate();
      notifySuccess('Session activated. Points allocated to all active users.');
      setActivateOpen(false);
    },
    onError: (err: any) =>
      notifyError(err.response?.data?.message ?? 'Failed to activate session'),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => axiosInstance.patch(`/sessions/${id}/deactivate`),
    onSuccess: () => { invalidate(); notifySuccess('Session deactivated'); },
    onError: (err: any) =>
      notifyError(err.response?.data?.message ?? 'Failed to deactivate session'),
  });

  const addOrderMutation = useMutation({
    mutationFn: (body: { sessionId: string; userId: string; items: NewOrderItem[] }) =>
      axiosInstance.post('/orders/admin/create', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders', id] });
      queryClient.invalidateQueries({ queryKey: ['enrolled-users', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] });
      notifySuccess('Order created successfully');
      closeAddOrder();
    },
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to create order'),
  });

  const closeAddOrder = () => {
    setAddOrderOpen(false);
    setOrderUserId(null);
    setOrderItems([{ productId: '' as string, quantity: 1 }]);
  };

  // Derived: selected user's remaining points
  const selectedUserPoints = enrolledUsers.find(u => u.userId === orderUserId)?.remainingPoints ?? 0;

  // Derived: total points for current order items
  const orderTotalPoints = orderItems.reduce((sum, item) => {
    const product = allProducts.find(p => p.id === item.productId);
    return sum + (product ? product.pointsPrice * item.quantity : 0);
  }, 0);

  const handleAddOrder = () => {
    if (!orderUserId) { notifyError('Select a user'); return; }
    const validItems = orderItems.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) { notifyError('Add at least one product'); return; }
    addOrderMutation.mutate({ sessionId: id!, userId: orderUserId, items: validItems });
  };

  const openActivate = () => {
    activateForm.setFieldsValue({
      startDate: session ? dayjs(session.startDate) : undefined,
      endDate:   session ? dayjs(session.endDate)   : undefined,
    });
    setActivateOpen(true);
  };

  // ─── Derived metrics ──────────────────────────────────────
  const metrics = useMemo(() => ({
    ordersCount:        orders.length,
    totalPointsSpent:   orders.reduce((sum, o) => sum + o.totalPoints, 0),
    participatingUsers: new Set(orders.map(o => o.userId)).size,
    enrolledUsers:      session?._count.userPoints ?? 0,
  }), [orders, session]);

  // ─── Order list (filtered) ────────────────────────────────
  const filteredOrders = useMemo(() =>
    orders.filter(o =>
      matchesSearch(`${o.user.firstName} ${o.user.lastName}`, debouncedSearch) ||
      matchesSearch(o.user.email, debouncedSearch) ||
      matchesSearch(o.id, debouncedSearch)
    ),
    [orders, debouncedSearch]
  );

  // ─── Shopping list (aggregated by product) ────────────────
  const shoppingList = useMemo<ShoppingRow[]>(() => {
    const agg: Record<string, ShoppingRow> = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!agg[item.productId]) {
          agg[item.productId] = {
            productId:   item.productId,
            title:       item.product.title,
            totalQty:    0,
            pointsPrice: item.pointsPrice,
          };
        }
        agg[item.productId].totalQty += item.quantity;
      });
    });
    return Object.values(agg)
      .filter(row => matchesSearch(row.title, debouncedSearch))
      .sort((a, b) => b.totalQty - a.totalQty);
  }, [orders, debouncedSearch]);

  // ─── Table columns ────────────────────────────────────────
  const orderColumns: ColumnsType<BackendOrder> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <span style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace' }}>
          {text.slice(0, 14)}…
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
      render: (val: number) => <span style={{ fontWeight: 700 }}>{formatPoints(val)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColor(status)}>
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

  const shoppingColumns: ColumnsType<ShoppingRow> = [
    {
      title: 'Product',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Total Qty Ordered',
      dataIndex: 'totalQty',
      key: 'totalQty',
      render: (val: number) => `${val} units`,
    },
    {
      title: 'Unit Points',
      dataIndex: 'pointsPrice',
      key: 'pointsPrice',
      render: (val: number) => formatPoints(val),
    },
    {
      title: 'Total Points',
      key: 'totalPoints',
      render: (_, record: ShoppingRow) => (
        <span style={{ fontWeight: 700 }}>{formatPoints(record.pointsPrice * record.totalQty)}</span>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────
  if (!isLoading && !session) {
    return (
      <div className="panel__content">
        <EmptyState title="Session not found" description="The session you are looking for does not exist." />
      </div>
    );
  }

  const sessionStatus = session
    ? deriveSessionStatus(session.startDate, session.endDate, session.isActive)
    : 'upcoming';

  return (
    <div className="panel__content">

      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>

        {/* Left: back + title */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button className="iconButton" onClick={() => navigate('/sessions')}>
            <span aria-hidden="true">←</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="authTitle" style={{ textAlign: 'left', fontSize: 24, margin: 0 }}>
                {session?.name ?? 'Loading…'}
              </h1>
              {session && (
                <span className={sessionStatusClass(sessionStatus)}>
                  {sessionStatusLabel(sessionStatus)}
                </span>
              )}
            </div>
            {session && (
              <div style={{ fontSize: 13, color: 'var(--text-400)', marginTop: 4 }}>
                {formatDate(session.startDate)} — {formatDate(session.endDate)}
              </div>
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        {session && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="secondaryButton"
              style={{ minWidth: 120 }}
              onClick={() => setAddOrderOpen(true)}
            >
              + Add Order
            </button>

            {session.isActive ? (
              <button
                className="secondaryButton"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)', minWidth: 130 }}
                disabled={deactivateMutation.isPending}
                onClick={() =>
                  confirm.open({
                    title:        'Deactivate Session',
                    message:      `Deactivate "${session.name}"? It will no longer be visible in the marketplace.`,
                    confirmLabel: 'Yes, Deactivate',
                    onConfirm:    () => deactivateMutation.mutate(),
                  })
                }
              >
                {deactivateMutation.isPending ? 'Deactivating…' : 'Deactivate Session'}
              </button>
            ) : (
              <button
                className="authButton"
                style={{ minWidth: 130 }}
                onClick={openActivate}
              >
                Activate Session
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Metrics row ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Enrolled Users',      value: metrics.enrolledUsers },
          { label: 'Total Orders',         value: metrics.ordersCount },
          { label: 'Points Spent',         value: formatPoints(metrics.totalPointsSpent, '—') },
          { label: 'Participating Users',  value: metrics.participatingUsers },
        ].map(({ label, value }) => (
          <div key={label} className="cardSection" style={{ padding: '16px 20px', minHeight: 'auto' }}>
            <div style={{ fontSize: 12, color: 'var(--text-400)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-900)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs + table ──────────────────────────────────── */}
      <section className="cardSection" style={{ padding: 0 }}>
        <div className="tabs" style={{ padding: '0 24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: 24 }}>
          {(['orders', 'shopping'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchText(''); }}
              style={{
                padding:      '16px 0',
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : 'none',
                color:        activeTab === tab ? 'var(--accent)' : 'var(--text-400)',
                fontWeight:   activeTab === tab ? 600 : 400,
              }}
            >
              {tab === 'orders' ? 'Order list' : 'Shopping list'}
            </button>
          ))}
        </div>

        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder={activeTab === 'orders' ? 'Search by customer, email or order ID' : 'Search products'}
          onExport={() => {}}
        />

        <div>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-400)' }}>Loading…</div>
          ) : activeTab === 'orders' ? (
            filteredOrders.length > 0 ? (
              <Table
                columns={orderColumns}
                dataSource={filteredOrders.map(o => ({ ...o, key: o.id }))}
                pagination={{ pageSize: 10 }}
                className="dataTable"
              />
            ) : (
              <EmptyState
                title="No orders yet"
                description="Orders placed in this session will appear here"
                icon={orderIcon}
              />
            )
          ) : (
            shoppingList.length > 0 ? (
              <Table
                columns={shoppingColumns}
                dataSource={shoppingList.map(r => ({ ...r, key: r.productId }))}
                pagination={{ pageSize: 20 }}
                className="dataTable"
              />
            ) : (
              <EmptyState
                title="Shopping list empty"
                description="Once orders are placed, items will be aggregated here"
                icon={orderIcon}
              />
            )
          )}
        </div>
      </section>

      {/* ── Confirmation modal (deactivate) ───────────────── */}
      <ConfirmationModal
        isOpen={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
      />

      {/* ── Add Order modal ──────────────────────────────── */}
      <Modal
        open={addOrderOpen}
        onCancel={closeAddOrder}
        footer={null}
        closable={false}
        destroyOnClose
        width={560}
        styles={{ body: { padding: 0, maxHeight: '90vh', overflowY: 'auto' } }}
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Add Order</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeAddOrder} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">
            Create an order on behalf of an enrolled user for <strong>{session?.name}</strong>.
          </div>
        </header>

        <div className="modalBody">
          {/* User selector */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label className="field__label" style={{ display: 'block', marginBottom: 6 }}>
              User <span style={{ color: 'red' }}>*</span>
            </label>
            <Select
              style={{ width: '100%', height: 44 }}
              placeholder="Select an enrolled user"
              value={orderUserId ?? undefined}
              onChange={v => setOrderUserId(v)}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={enrolledUsers.map(u => ({
                value: u.userId,
                label: `${u.firstName} ${u.lastName} (${u.remainingPoints} PT remaining)`,
              }))}
            />
          </div>

          {/* Points preview */}
          {orderUserId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--gray-100)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              <span style={{ color: 'var(--text-600)' }}>User's remaining points</span>
              <span style={{ fontWeight: 700, color: selectedUserPoints >= orderTotalPoints ? 'var(--text-900)' : 'var(--danger)' }}>
                {formatPoints(selectedUserPoints)}
              </span>
            </div>
          )}

          {/* Order items */}
          <div style={{ marginBottom: 8 }}>
            <label className="field__label" style={{ display: 'block', marginBottom: 8 }}>
              Products <span style={{ color: 'red' }}>*</span>
            </label>

            {orderItems.map((item, idx) => {
              const product = allProducts.find(p => p.id === item.productId);
              return (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 32px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <Select
                    style={{ height: 40 }}
                    placeholder="Select product"
                    value={item.productId || undefined}
                    onChange={v => {
                      const updated = [...orderItems];
                      updated[idx] = { ...updated[idx], productId: v };
                      setOrderItems(updated);
                    }}
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={allProducts.map(p => ({
                      value: p.id,
                      label: `${p.title}${p.brand ? ` (${p.brand})` : ''} — ${formatPoints(p.pointsPrice)}`,
                    }))}
                  />
                  <InputNumber
                    min={1}
                    value={item.quantity}
                    style={{ width: '100%', height: 40 }}
                    onChange={v => {
                      const updated = [...orderItems];
                      updated[idx] = { ...updated[idx], quantity: v ?? 1 };
                      setOrderItems(updated);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                    disabled={orderItems.length === 1}
                    style={{ background: 'none', border: 'none', cursor: orderItems.length === 1 ? 'not-allowed' : 'pointer', color: 'var(--danger)', fontSize: 18, padding: 0, lineHeight: 1 }}
                  >
                    ×
                  </button>
                  {product && (
                    <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--text-400)', marginTop: -4 }}>
                      {formatPoints(product.pointsPrice)} PT × {item.quantity} = {formatPoints(product.pointsPrice * item.quantity)} PT
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              type="dashed"
              size="small"
              onClick={() => setOrderItems([...orderItems, { productId: '', quantity: 1 }])}
              style={{ width: '100%', marginTop: 4 }}
            >
              + Add another product
            </Button>
          </div>

          {/* Total */}
          {orderTotalPoints > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: 12, marginTop: 12, fontWeight: 700 }}>
              <span>Total Points Required</span>
              <span style={{ color: orderTotalPoints > selectedUserPoints ? 'var(--danger)' : 'var(--text-900)' }}>
                {formatPoints(orderTotalPoints)} PT
              </span>
            </div>
          )}

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeAddOrder}>
              Cancel
            </button>
            <button
              className="authButton"
              type="button"
              style={{ flex: 1 }}
              disabled={addOrderMutation.isPending || !orderUserId || orderItems.every(i => !i.productId)}
              onClick={handleAddOrder}
            >
              {addOrderMutation.isPending ? 'Creating…' : 'Create Order'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Activate modal ────────────────────────────────── */}
      <Modal
        open={activateOpen}
        onCancel={() => setActivateOpen(false)}
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
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Activate Session</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={() => setActivateOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        <Form
          form={activateForm}
          layout="vertical"
          onFinish={activateMutation.mutate}
          className="modalBody"
          requiredMark={false}
        >
          <p style={{ color: 'var(--text-600)', fontSize: 14, marginBottom: 20 }}>
            Confirm or adjust the dates for <strong>{session?.name}</strong>. Once activated,
            it will be visible in the marketplace and points will be allocated to all active users.
          </p>

          <div className="modalGrid2">
            <div className="field">
              <Form.Item
                label={<span className="field__label">Start Date</span>}
                name="startDate"
                rules={[{ required: true, message: 'Required' }]}
              >
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

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={() => setActivateOpen(false)}>
              Cancel
            </button>
            <button className="authButton" type="submit" style={{ flex: 1 }} disabled={activateMutation.isPending}>
              {activateMutation.isPending ? 'Activating…' : 'Activate Session'}
            </button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default SessionDetailsPage;
