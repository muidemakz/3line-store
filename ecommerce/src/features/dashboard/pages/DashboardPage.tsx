import { PageShell } from '@/components/layout/PageShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppStatusBadge } from '@/components/ui/AppStatusBadge';
import { AppTypography } from '@/components/ui/AppTypography';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <PageShell
      title="Dashboard"
      description="Your active session, points balance, and quick links to the store."
      actions={<AppButton variant="secondary" onClick={() => navigate('/store')}>Go to store</AppButton>}
    >
      <div className="stack-16">
        <AppCard>
          <div className="stack-12">
            <div className="cluster-12" style={{ alignItems: 'center' }}>
              <AppTypography variant="titleMd">Active session</AppTypography>
              <AppStatusBadge status="active">Active</AppStatusBadge>
            </div>
            <AppTypography variant="body" color="var(--app-text-secondary)">
              Session details and orders sync with the admin portal. Connect to{' '}
              <code>/sessions</code> when the API is wired.
            </AppTypography>
          </div>
        </AppCard>

        <AppCard>
          <div className="stack-8">
            <AppTypography variant="titleSm">Points balance</AppTypography>
            <AppTypography variant="titleLg" color="var(--accent)">
              —
            </AppTypography>
            <AppTypography variant="bodySmall" color="var(--app-text-secondary)">
              Allocated points follow your grade level and the Naira-to-points rate from admin
              settings.
            </AppTypography>
          </div>
        </AppCard>
      </div>
    </PageShell>
  );
}
