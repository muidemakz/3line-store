import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import Assets

import arrowRightIcon from '@/assets/arrow-right.svg';
import editIcon from '@/assets/edit.svg';
import historyIcon from '@/assets/sidebar-sessions.svg';
import storeIcon from '@/assets/sidebar-store.svg';
import usersIcon from '@/assets/sidebar-users.svg';
import suggestionsIcon from '@/assets/sidebar-suggestions.svg';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  miniIcon: string;
  onClick?: () => void;
}> = ({ title, value, miniIcon, onClick }) => (
  <article className="statCard" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="statCard__header">
      <img src={miniIcon} alt="" className="statCard__miniIcon" />
      <div className="statCard__spacer" />
    </div>
    <div className="statCard__titleRow">
      <div className="statCard__title">{title}</div>
    </div>
    <div className="statCard__bottom">
      <div className="statCard__value">{value}</div>
      <img src={arrowRightIcon} alt="" className="statCard__arrow" />
    </div>
  </article>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="panel__content">
      {/* Stats Grid */}
      <section className="statsRow">
        <StatCard 
          title="Total Users" 
          value={0} 
          miniIcon={usersIcon} 
          onClick={() => navigate('/users')}
        />
        <StatCard 
          title="Active Sessions" 
          value={0} 
          miniIcon={historyIcon} 
          onClick={() => navigate('/sessions')}
        />
        <StatCard 
          title="Total Stores" 
          value={0} 
          miniIcon={storeIcon} 
          onClick={() => navigate('/store')}
        />
        <StatCard 
          title="Suggestions" 
          value={0} 
          miniIcon={suggestionsIcon} 
          onClick={() => navigate('/suggestions')}
        />
      </section>

      {/* Content Row Matching Legacy Dashboard Grid (522px 1fr) */}
      <section className="contentRow" style={{ display: 'grid', gridTemplateColumns: '522px 1fr', gap: 16 }}>
        <article className="cardSection dashboardSettingsCard">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="sectionTitle">Grade levels & points</h2>
            <button className="miniIconButton" onClick={() => navigate('/settings')}>
              <img src={editIcon} alt="" />
            </button>
          </header>
          <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-400)' }}>No grade levels defined yet.</span>
          </div>
        </article>

        <article className="cardSection dashboardSessionsCard">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="sectionTitle">Active Session</h2>
            <button className="miniIconButton" onClick={() => navigate('/sessions')}>
              <img src={editIcon} alt="" />
            </button>
          </header>
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <img src={historyIcon} alt="" style={{ width: 48, opacity: 0.2, marginBottom: 16 }} />
              <div style={{ fontSize: 14, color: 'var(--text-400)', marginBottom: 16 }}>No active session found.</div>
              <button 
                className="adminActionBtn" 
                style={{ background: 'var(--accent)', color: 'white', padding: '10px 24px', borderRadius: 8, border: 0, fontWeight: 600, cursor: 'pointer' }}
              >
                Start New Session
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
