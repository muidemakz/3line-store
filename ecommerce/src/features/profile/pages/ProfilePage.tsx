import { PageShell } from '@/components/layout/PageShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTypography } from '@/components/ui/AppTypography';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const session = useAuthStore((s) => s.session);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('auth_token');
    useAuthStore.setState({ session: null });
    navigate('/sign-in', { replace: true });
  };

  return (
    <PageShell
      title="Profile"
      description="Account details issued by your administrator."
      actions={<AppButton variant="secondary" onClick={handleSignOut}>Sign out</AppButton>}
    >
      <AppCard>
        <div className="stack-12">
          <AppTypography variant="titleMd">Account</AppTypography>
          <AppTypography variant="body">Name: {session?.user.name ?? '—'}</AppTypography>
          <AppTypography variant="body">Email: {session?.user.email ?? '—'}</AppTypography>
          <AppTypography variant="bodySmall" color="var(--app-text-secondary)">
            Points balance and grade level will load from the session API.
          </AppTypography>
        </div>
      </AppCard>
    </PageShell>
  );
}
