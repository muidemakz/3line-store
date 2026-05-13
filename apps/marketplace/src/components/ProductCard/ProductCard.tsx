import { useApp } from '../../context/AppContext'
import type { Product } from '../../shared/api/products'
import styles from './ProductCard.module.css'

const ImagePlaceholder = () => (
  <div className={styles.imagePlaceholder}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  </div>
)

export default function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart, updateCartQuantity } = useApp()
  const cartItem = cart.find(i => i.productId === product.id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.image ? (
          <img
            className={styles.image}
            src={product.image}
            alt={product.title}
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder />
        )}

        {quantity === 0 ? (
          <button className={styles.addBtn} onClick={() => addToCart(product, 1)} title="Add to cart">
            +
          </button>
        ) : (
          <div className={styles.qtyControls}>
            <button className={styles.qtyBtn} onClick={() => updateCartQuantity(product.id, quantity - 1)}>−</button>
            <span className={styles.qtyValue}>{quantity}</span>
            <button className={styles.qtyBtn} onClick={() => updateCartQuantity(product.id, quantity + 1)}>+</button>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{product.title}</span>
        <span className={styles.price}>{quantity > 0 ? quantity * product.pointsPrice : product.pointsPrice}PTS</span>
      </div>
    </div>
  )
}
