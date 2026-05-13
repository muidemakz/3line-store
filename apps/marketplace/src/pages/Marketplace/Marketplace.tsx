import { useApp } from '../../context/AppContext'
import ProductCard from '../../components/ProductCard/ProductCard'
import styles from './Marketplace.module.css'

const SearchIcon = () => (
  <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)

const SuggestIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12" />
    <path d="M22 7H2v5h20V7Z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
  </svg>
)

const EmptyBoxIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

export default function Marketplace() {
  const { searchQuery, setSearchQuery, setCurrentPage, cart, cartTotal, products, isLoadingProducts } = useApp()

  const filteredProducts = products.filter(product => {
    // Temporarily disable session filter until backend endpoint is ready
    // if (activeSession && product.sessionId !== activeSession.id) {
    //   return false;
    // }

    // Filter by search query only
    if (searchQuery) {
      return product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return true
  })

  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Marketplace 🛍️</h1>
          <p className={styles.subtitle}>Welcome to marketplace</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.searchBar}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search Item: Name, Brand"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.suggestBtn} onClick={() => setCurrentPage('suggestions')}>
            <SuggestIconSmall />
            Suggest Item
          </button>
        </div>
      </div>

      {isLoadingProducts ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}><EmptyBoxIcon /></span>
          <p className={styles.emptyTitle}>No Items Yet</p>
          <p className={styles.emptySubtitle}>No items added yet by admin</p>
          <button className={styles.emptyBtn} onClick={() => setCurrentPage('suggestions')}>
            + Suggest Item
          </button>
        </div>
      ) : (
        <div className={styles.gridWrapper}>
          <div className={styles.grid}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Floating cart strip when items in cart */}
      {cartItemCount > 0 && (
        <div className={styles.cartStrip}>
          <div className={styles.cartStripAvatars}>
            {cart.slice(0, 3).map(item => (
              <div key={item.productId} className={styles.cartStripAvatar}>
                {item.quantity}
              </div>
            ))}
          </div>
          <button className={styles.cartStripBtn} onClick={() => setCurrentPage('cart')}>
            {cartTotal}P ~ Cart
          </button>
        </div>
      )}
    </main>
  )
}
