import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/axios';
import PointConfigModal from './components/PointConfigModal';
import GradeLevelModal from './components/GradeLevelModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { formatPoints } from '@/shared/utils/points';

import editIcon from '@/assets/edit.svg';
import styles from './SettingsPage.module.css';

// ─── API helpers ──────────────────────────────────────────
const fetchGradeLevels = () =>
  axiosInstance.get('/grade-levels').then(r => r.data.data ?? []);

const fetchPointConfig = () =>
  axiosInstance.get('/settings/point-config').then(r => r.data.data?.nairaPerPoint ?? 500);

const SettingsPage: React.FC = () => {
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { data: gradeLevels = [] } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: fetchGradeLevels,
    staleTime: 60_000,
  });

  const { data: nairaPerPoint = 500 } = useQuery({
    queryKey: ['point-config'],
    queryFn: fetchPointConfig,
    staleTime: 60_000,
  });

  return (
    <div className={`panel__content ${styles.page}`}>
      <h2 className={styles.heading}>Settings</h2>

      <div className={styles.stack}>

        {/* ── Point Configuration ── */}
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <span className={styles.cardIconWrap} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </span>
              <div className={styles.cardMeta}>
                <p className={styles.cardTitle}>Point Configuration</p>
                <p className={styles.cardDesc}>Adjust the conversion rate between Naira and Store Points.</p>
              </div>
            </div>
            <button
              className={styles.cardEditBtn}
              onClick={() => setIsPointModalOpen(true)}
              aria-label="Edit point configuration"
            >
              <img src={editIcon} alt="" />
            </button>
          </div>

          <div className={styles.dataRow}>
            <span className={styles.dataLabel}>Amount per 1 Point</span>
            <span className={styles.dataValue}>
              {nairaPerPoint > 0 ? `₦${nairaPerPoint.toLocaleString()}` : 'Not configured'}
            </span>
          </div>
        </article>

        {/* ── Grade Levels ── */}
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <span className={styles.cardIconWrap} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l10 7-10 7L2 10l10-7z" />
                  <path d="M2 17l10 7 10-7" />
                  <path d="M2 12l10 7 10-7" />
                </svg>
              </span>
              <div className={styles.cardMeta}>
                <p className={styles.cardTitle}>Grade Levels & Points</p>
                <p className={styles.cardDesc}>Manage user grade levels and their associated point allocations.</p>
              </div>
            </div>
            <button
              className={styles.cardEditBtn}
              onClick={() => setIsGradeModalOpen(true)}
              aria-label="Edit grade levels"
            >
              <img src={editIcon} alt="" />
            </button>
          </div>

          <div className={styles.gradeCount}>
            <span className={styles.gradeCountNumber}>{gradeLevels.length}</span>
            <span className={styles.gradeCountLabel}>
              {gradeLevels.length === 1 ? 'Grade Level' : 'Grade Levels'}
            </span>
          </div>

          <div className={styles.gradeList}>
            {gradeLevels.length === 0 ? (
              <p className={styles.gradeEmpty}>No grade levels configured yet.</p>
            ) : (
              gradeLevels.map((grade: any) => (
                <div key={grade.id} className={styles.gradeRow}>
                  <span className={styles.gradeRowName}>{grade.name}</span>
                  <span className={styles.gradeRowPoints}>{formatPoints(grade.defaultPoints)}</span>
                </div>
              ))
            )}
          </div>
        </article>

        {/* ── Change Password ── */}
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <span className={styles.cardIconWrap} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <div className={styles.cardMeta}>
                <p className={styles.cardTitle}>Change Password</p>
                <p className={styles.cardDesc}>Update your account password to keep your account secure.</p>
              </div>
            </div>
            <button
              className={styles.cardEditBtn}
              onClick={() => setIsPasswordModalOpen(true)}
              aria-label="Change password"
            >
              <img src={editIcon} alt="" />
            </button>
          </div>
        </article>

      </div>

      <PointConfigModal
        open={isPointModalOpen}
        onClose={() => setIsPointModalOpen(false)}
      />
      <GradeLevelModal
        open={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
      />
      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default SettingsPage;
