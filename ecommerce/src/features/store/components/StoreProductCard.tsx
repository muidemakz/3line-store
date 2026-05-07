import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTypography } from '@/components/ui/AppTypography';
import { useCartStore } from '@/features/cart/store/cart.store';
import type { Product } from '@/shared/types/api.entities';
import { notifyProductSelected } from '@/features/store/utils/storeNotifications';

interface StoreProductCardProps {
  product: Product;
}

export function StoreProductCard({ product }: StoreProductCardProps) {
  const addToCart = useCartStore((s) => s.add);

  return (
    <AppCard cover={<img alt={product.title} src={product.thumbnail} className="product-image" />}>
      <div className="stack-16">
        <div className="stack-8">
          <span className="category-pill">{product.category}</span>
          <AppTypography variant="titleSm">{product.title}</AppTypography>
          <AppTypography variant="body" color="var(--app-text-secondary)">
            {product.description}
          </AppTypography>
        </div>

        <div className="cluster-12">
          <AppTypography variant="label" color="var(--app-text-secondary)">
            ₦{product.price.toFixed(2)}
          </AppTypography>
          <AppTypography variant="label" color="var(--app-text-secondary)">
            Stock: {product.stock}
          </AppTypography>
        </div>

        <div className="cluster-12">
          <AppButton onClick={() => addToCart(product)}>Add to cart</AppButton>
          <AppButton variant="secondary" onClick={() => notifyProductSelected(product.title)}>
            View item
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}
