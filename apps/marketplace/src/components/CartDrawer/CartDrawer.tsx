import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './CartDrawer.module.css'

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const EmptyCartIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

export default function CartDrawer() {
  const {
    currentPage,
    setCurrentPage,
    cart,
    cartTotal,
    currentSessionPoints,
    updateCartQuantity,
    clearCart,
    checkout,
  } = useApp()

  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  if (currentPage !== 'cart') return null

  const remaining = currentSessionPoints - cartTotal
  const canCheckout = cart.length > 0 && remaining >= 0 && !isCheckingOut

  async function handleCheckout() {
    setCheckoutError(null)
    setIsCheckingOut(true)
    try {
      await checkout()
      // Success — go back to marketplace
      setCurrentPage('marketplace')
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={() => setCurrentPage('marketplace')} />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <CartIcon />
            Cart
          </div>
          <button className={styles.closeBtn} onClick={() => setCurrentPage('marketplace')}>
            <XIcon />
          </button>
        </div>

        {cart.length > 0 ? (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Available Point Balance</span>
                <span className={styles.summaryValue}>{currentSessionPoints} PTS</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Cumulative Total In Cart</span>
                <span className={styles.summaryValueRed}>- {cartTotal} PTS</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Points Remaining After Checkout</span>
                <span className={styles.summaryValueBold}>{remaining} PTS</span>
              </div>
            </div>

            <div className={styles.itemsList}>
              {cart.map(item => (
                <div key={item.productId} className={styles.item}>
                  {item.product.image ? (
                    <img
                      className={styles.itemImage}
                      src={item.product.image}
                      alt={item.product.title}
                    />
                  ) : (
                    <div className={styles.itemImagePlaceholder}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                  )}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.product.title}</div>
                    <div className={styles.itemPts}>-{item.product.pointsPrice * item.quantity} PTS</div>
                  </div>
                  <div className={styles.itemQty}>
                    <button className={styles.qtyBtn} onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}>−</button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            {checkoutError && (
              <div style={{
                margin: '0 16px',
                padding: '10px 14px',
                background: '#fef2f2',
                color: '#b91c1c',
                borderRadius: '8px',
                fontSize: '13px',
              }}>
                {checkoutError}
              </div>
            )}

            {remaining < 0 && (
              <div style={{
                margin: '0 16px',
                padding: '10px 14px',
                background: '#fff7ed',
                color: '#c2410c',
                borderRadius: '8px',
                fontSize: '13px',
              }}>
                You need {Math.abs(remaining)} more PTS to complete this order.
              </div>
            )}

            <div className={styles.footer}>
              <button className={styles.clearBtn} onClick={clearCart} disabled={isCheckingOut}>
                Clear Cart
              </button>
              <button
                className={styles.checkoutBtn}
                onClick={handleCheckout}
                disabled={!canCheckout}
                style={{ opacity: !canCheckout ? 0.6 : 1 }}
              >
                {isCheckingOut ? 'Placing order...' : `Checkout ~ ${cartTotal} PTS`}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyCart}>
            <EmptyCartIcon />
            <p className={styles.emptyCartTitle}>Your cart is empty</p>
            <p className={styles.emptyCartSub}>Add items from the marketplace</p>
            <button
              className={styles.checkoutBtn}
              style={{ marginTop: '16px', flex: 'unset', alignSelf: 'center', padding: '12px 32px', width: 'auto' }}
              onClick={() => setCurrentPage('marketplace')}
            >
              Browse Items
            </button>
          </div>
        )}
      </div>
    </>
  )
}
