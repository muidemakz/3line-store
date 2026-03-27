import type { PropsWithChildren, ReactNode } from 'react';
import { AppTypography } from '@/components/ui/AppTypography';

interface PageShellProps extends PropsWithChildren {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div className="app-shell">
      <div className="page-shell">
        <header className="page-hero">
          <div className="stack-8">
            <AppTypography variant="h3">{title}</AppTypography>
            <AppTypography variant="body" color="var(--app-text-secondary)">
              {description}
            </AppTypography>
          </div>
          {actions}
        </header>
        {children}
      </div>
    </div>
  );
}
