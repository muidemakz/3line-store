import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';

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
    <div className="statCard__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div className="statCard__title">{title}</div>
      <img src={miniIcon} alt="" className="statCard__miniIcon" />
    </div>
    <div className="statCard__bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
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
          title="Active Sessions" 
          value={0} 
          miniIcon={historyIcon} 
          onClick={() => navigate('/sessions')}
        />
        <StatCard 
          title="Total Items" 
          value={0} 
          miniIcon={storeIcon} 
          onClick={() => navigate('/store')}
        />
        <StatCard 
          title="Total Users" 
          value={0} 
          miniIcon={usersIcon} 
          onClick={() => navigate('/users')}
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
        <div style={{ backgroundColor: '#f5f5f5', border: '1px solid var(--gray-200)', padding: 20, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#181d27' }}>Settings</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
            {/* Point Configuration Card */}
            <article className="cardSection" style={{ minHeight: 'auto', padding: 20, backgroundColor: 'var(--white)'}}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#181d27' }}>Point Configuration</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-400)', marginTop: 8 }}>Adjust the conversion rate between Naira and Store Points.</p>
                </div>
                <button className="miniIconButton">
                  <img src={editIcon} alt="" />
                </button>
              </header>
              <div style={{ background: '#f2f7ff', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--gray-700)' }}>Amount per 1 Point</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>₦-</span>
              </div>
            </article>

            {/* Grade Levels Card */}
            <article className="cardSection" style={{ minHeight: 'auto', padding: 20, flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--white)' }}>
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#181d27' }}>Grade levels & points</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-400)', marginTop: 8 }}>Manage user grade levels and their associated point allocations.</p>
                </div>
                <button className="miniIconButton" onClick={() => navigate('/settings')}>
                  <img src={editIcon} alt="" />
                </button>
              </header>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                <EmptyState 
                  title="No grade levels yet" 
                  description="Grade levels and points defined will show here"
                  action={{
                    label: "Set Up Grades",
                    onClick: () => navigate('/settings')
                  }}
                />
              </div>
            </article>
          </div>
        </div>

        <article className="cardSection dashboardSessionsCard">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="sectionTitle">Active Session</h2>
            <button className="miniIconButton" onClick={() => navigate('/sessions')}>
              <img src={editIcon} alt="" />
            </button>
          </header>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState 
              title="No active session" 
              description="Active sessions will appear here"
              icon={historyIcon}
              action={{
                label: "Start New Session",
                onClick: () => navigate('/sessions')
              }}
            />
          </div>
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
