import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { ordersService } from '../../shared/api/orders'
import type { Order } from '../../shared/api/orders'
import styles from './OrderHistory.module.css'

const EmptyBoxIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

export default function OrderHistory() {
  const { sessions, setCurrentPage } = useApp()

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load orders whenever the selected session changes (null = all sessions)
  useEffect(() => {
    let cancelled = false
    const fetch = async () => {
      setIsLoading(true)
      try {
        const result = await ordersService.getMyOrders(
          selectedSessionId ? { sessionId: selectedSessionId } : undefined
        )
        if (!cancelled) setFilteredOrders(result)
      } catch {
        if (!cancelled) setFilteredOrders([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetch()
    return () => { cancelled = true }
  }, [selectedSessionId])

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Order History</h1>
          <span className={styles.countBadge}>{filteredOrders.length}</span>
        </div>
        <p className={styles.subtitle}>View all your order history</p>
      </div>

      {/* Session filter tabs */}
      {sessions.length > 0 && (
        <div className={styles.sessionTabs}>
          <button
            className={`${styles.sessionTab} ${selectedSessionId === null ? styles.sessionTabActive : ''}`}
            onClick={() => setSelectedSessionId(null)}
          >
            All Sessions
          </button>
          {sessions.map(s => (
            <button
              key={s.id}
              className={`${styles.sessionTab} ${selectedSessionId === s.id ? styles.sessionTabActive : ''}`}
              onClick={() => setSelectedSessionId(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.content}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><EmptyBoxIcon /></span>
            <p className={styles.emptyTitle}>No Orders Found</p>
            <p className={styles.emptySubtitle}>
              {selectedSessionId
                ? 'No orders for this session yet'
                : 'Your past orders would appear here'}
            </p>
            <button className={styles.placeOrderBtn} onClick={() => setCurrentPage('marketplace')}>
              + Place Order
            </button>
          </div>
        ) : (
          <div className={styles.orderList}>
            {filteredOrders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderLeft}>
                  <span className={styles.orderId}>#{order.id.slice(0, 8)}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  {order.session && (
                    <span className={styles.orderSession}>{order.session.name}</span>
                  )}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <span className={styles.orderItems}>
                      {order.orderItems.map(i =>
                        `${i.product?.title ?? 'Item'} ×${i.quantity}`
                      ).join(', ')}
                    </span>
                  )}
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.orderPoints}>{order.totalPoints} PTS</span>
                  <span className={`${styles.statusBadge} ${
                    order.status === 'DELIVERED' ? styles.statusDelivered :
                    order.status === 'CANCELLED' ? styles.statusCancelled :
                    styles.statusPending
                  }`}>
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
