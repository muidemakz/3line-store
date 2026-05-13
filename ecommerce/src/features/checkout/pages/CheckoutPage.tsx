import { PageShell } from '@/components/layout/PageShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTypography } from '@/components/ui/AppTypography';
import { useCartStore } from '@/features/cart/store/cart.store';
import { notifySuccess } from '@/shared/lib/toast';
import { Link, useNavigate } from 'react-router-dom';

export function CheckoutPage() {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  const handlePlaceOrder = () => {
    clear();
    notifySuccess('Order placed — this will call your API in a later step.');
    navigate('/orders');
  };

  return (
    <PageShell
      title="Checkout"
      description="Confirm your order. Successful checkouts update session details for administrators."
      actions={<AppButton onClick={handlePlaceOrder}>Place order</AppButton>}
    >
      <AppCard>
        <div className="stack-16">
          <AppTypography variant="titleMd">Summary</AppTypography>
          {lines.length === 0 ? (
            <AppTypography variant="body" color="var(--app-text-secondary)">
              Your cart is empty.{' '}
              <Link to="/store" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                Return to store
              </Link>
            </AppTypography>
          ) : (
            <>
              {lines.map((line) => (
                <div key={String(line.product.id)} className="cluster-12">
                  <AppTypography variant="body">{line.product.title}</AppTypography>
                  <AppTypography variant="body">×{line.quantity}</AppTypography>
                  <AppTypography variant="body">₦{(line.product.price * line.quantity).toFixed(2)}</AppTypography>
                </div>
              ))}
              <div className="section-divider" />
              <AppTypography variant="titleSm">Total ₦{subtotal.toFixed(2)}</AppTypography>
            </>
          )}
        </div>
      </AppCard>
    </PageShell>
  );
}
