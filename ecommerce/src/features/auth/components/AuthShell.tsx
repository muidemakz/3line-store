import type { PropsWithChildren } from 'react';
import bgImage from '@/assets/images/bg.png';

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <div className="auth-screen" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="auth-screen__background">
        <span className="auth-ornament auth-ornament--left" />
        <span className="auth-ornament auth-ornament--right" />
        <span className="auth-ornament auth-ornament--bottom" />
        <span className="auth-blur auth-blur--left" />
        <span className="auth-blur auth-blur--bottom" />
      </div>

      <div className="auth-screen__content">
        <header className="auth-header">
          <div className="auth-brand">
            <span className="auth-brand__title">Checkitout</span>
            <span className="auth-brand__sub">Customer</span>
          </div>
          <a className="auth-help-link" href="mailto:help@3linestore.com">
            Get Help
          </a>
        </header>

        <div className="auth-accent" aria-hidden="true">
          m
        </div>

        {children}

        <footer className="auth-footer">
          <span>3Line Store</span>
          <strong>Checkitout</strong>
        </footer>
      </div>
    </div>
  );
}
