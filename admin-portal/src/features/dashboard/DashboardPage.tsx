import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import StatCard from '@/components/common/StatCard';
import EmptyState from '@/components/common/EmptyState';
import { useDataStore } from '@/shared/store/data.store';
import type { SessionItem } from '@/shared/store/data.store';
import PointConfigModal from '@/features/settings/components/PointConfigModal';
import GradeLevelModal from '@/features/settings/components/GradeLevelModal';
import editIcon from '@/assets/edit.svg';
import historyIcon from '@/assets/sidebar-sessions.svg';
import storeIcon from '@/assets/sidebar-store.svg';
import usersIcon from '@/assets/sidebar-users.svg';
import { formatDate } from '@/shared/utils/date';
import { formatPoints } from '@/shared/utils/points';
import styles from './DashboardPage.module.css';

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, items, users, settings, gradeLevels } = useDataStore();
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  const activeSessions = sessions.filter(s => s.status === 'active');

  const columns: ColumnsType<SessionItem> = [
    {
      title: 'Session Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <span className="statusBadge statusBadge--active">
          <span className={styles.dot} />
          Active
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: SessionItem) => (
        <button
          className={styles.eyeBtn}
          onClick={() => navigate(`/sessions/${record.id}`)}
          aria-label="View session details"
        >
          <EyeIcon />
        </button>
      ),
    },
  ];

  return (
    <div className="panel__content">

      {/* ── 3 stat cards ── */}
      <section className="statsRow">
        <StatCard
          title="Active Sessions"
          value={activeSessions.length}
          miniIcon={historyIcon}
          onClick={() => navigate('/sessions')}
        />
        <StatCard
          title="Total Items"
          value={items.length}
          miniIcon={storeIcon}
          onClick={() => navigate('/store')}
        />
        <StatCard
          title="Total Users"
          value={users.length}
          miniIcon={usersIcon}
          onClick={() => navigate('/users')}
        />
      </section>

      {/* ── Content row: 362px settings | active sessions table ── */}
      <div className={styles.contentRow}>

        {/* Left — Settings panel */}
        <div className={styles.settingsPanel}>
          <p className={styles.settingsPanelTitle}>Settings</p>

          {/* Point Configuration */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>Point Configuration</p>
              <button
                className={styles.editBtn}
                onClick={() => setIsPointModalOpen(true)}
                aria-label="Edit point configuration"
              >
                <img src={editIcon} alt="" />
              </button>
            </div>
            <div className={styles.amountRow}>
              <span className={styles.amountLabel}>Amount per 1 Point</span>
              <span className={styles.amountValue}>
                {settings.nairaPerPoint > 0
                  ? `₦${settings.nairaPerPoint.toLocaleString()}`
                  : '₦—'}
              </span>
            </div>
          </div>

          {/* Grade Levels & Points */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>Grade Levels & Points</p>
              <button
                className={styles.editBtn}
                onClick={() => setIsGradeModalOpen(true)}
                aria-label="Edit grade levels"
              >
                <img src={editIcon} alt="" />
              </button>
            </div>
            <div className={styles.gradeCount}>
              <span className={styles.gradeCountNum}>{gradeLevels.length}</span>
              <span className={styles.gradeCountLabel}>
                {gradeLevels.length === 1 ? 'Grade Level' : 'Grade Levels'}
              </span>
            </div>
            {gradeLevels.length > 0 && (
              <div className={styles.gradeList}>
                {gradeLevels.map(grade => (
                  <div key={grade.id} className={styles.gradeRow}>
                    <span className={styles.gradeRowName}>{grade.name}</span>
                    <span className={styles.gradeRowPoints}>{formatPoints(grade.points)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Active Sessions table */}
        <div className={styles.sessionsPanel}>
          <p className={styles.sessionsPanelTitle}>Active Sessions</p>

          {activeSessions.length === 0 ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                title="No Active Session yet"
                description="Active Sessions will show here"
                icon={historyIcon}
                action={{
                  label: 'Add New Session',
                  onClick: () => navigate('/sessions'),
                }}
              />
            </div>
          ) : (
            <Table<SessionItem>
              dataSource={activeSessions}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 8, showSizeChanger: false }}
              size="middle"
            />
          )}
        </div>
      </div>

      <PointConfigModal
        open={isPointModalOpen}
        onClose={() => setIsPointModalOpen(false)}
      />
      <GradeLevelModal
        open={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
