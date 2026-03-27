import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppTypography } from '@/components/ui/AppTypography';
import type { Product } from '@/features/products/types/products.types';
import { notifyProductSelected } from '@/features/products/utils/productNotifications';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
            ${product.price.toFixed(2)}
          </AppTypography>
          <AppTypography variant="label" color="var(--app-text-secondary)">
            Stock: {product.stock}
          </AppTypography>
        </div>

        <AppButton variant="secondary" onClick={() => notifyProductSelected(product.title)}>
          View Product
        </AppButton>
      </div>
    </AppCard>
  );
}
