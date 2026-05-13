import { PageShell } from '@/components/layout/PageShell';
import { AppCard } from '@/components/ui/AppCard';
import { AppTypography } from '@/components/ui/AppTypography';

export function OrdersPage() {
  return (
    <PageShell
      title="Order history"
      description="Past orders for your account. Wire to GET /orders when the API is ready."
    >
      <AppCard>
        <div className="empty-state">
          <AppTypography variant="titleSm">No orders yet</AppTypography>
          <AppTypography variant="body" color="var(--app-text-secondary)">
            Completed orders from checkout will appear here.
          </AppTypography>
        </div>
      </AppCard>
    </PageShell>
  );
}
