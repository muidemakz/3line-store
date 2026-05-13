import { PageShell } from '@/components/layout/PageShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTypography } from '@/components/ui/AppTypography';
import { useCartStore } from '@/features/cart/store/cart.store';
import { Link, useNavigate } from 'react-router-dom';

export function CartPage() {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const remove = useCartStore((s) => s.remove);

  return (
    <PageShell
      title="Cart"
      description="Review items before you check out. Checkout syncs with your active session in the admin portal."
      actions={
        <AppButton disabled={lines.length === 0} onClick={() => navigate('/checkout')}>
          Checkout
        </AppButton>
      }
    >
      {lines.length === 0 ? (
        <AppCard>
          <div className="empty-state">
            <AppTypography variant="titleSm">Your cart is empty</AppTypography>
            <AppTypography variant="body" color="var(--app-text-secondary)">
              Add items from the store to continue.
            </AppTypography>
            <Link to="/store">
              <AppButton style={{ marginTop: 16 }}>Browse store</AppButton>
            </Link>
          </div>
        </AppCard>
      ) : (
        <div className="stack-16">
          {lines.map((line) => (
            <AppCard key={String(line.product.id)}>
              <div className="cluster-12" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div className="stack-8">
                  <AppTypography variant="titleSm">{line.product.title}</AppTypography>
                  <AppTypography variant="bodySmall" color="var(--app-text-secondary)">
                    Qty {line.quantity} · ₦{(line.product.price * line.quantity).toFixed(2)}
                  </AppTypography>
                </div>
                <AppButton variant="text" onClick={() => remove(line.product.id)}>
                  Remove
                </AppButton>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
