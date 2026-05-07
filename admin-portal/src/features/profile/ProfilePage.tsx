import React, { useState } from 'react';
import { message } from 'antd';
import FieldInput from '@/components/common/FieldInput';
import ChangePasswordModal from '@/features/settings/components/ChangePasswordModal';
import styles from './ProfilePage.module.css';

const ADMIN_DEFAULT = {
  name: 'Omiran Damilola',
  email: 'omiran@3linestore.com',
  role: 'SuperAdmin',
};

const ProfilePage: React.FC = () => {
  const [name, setName] = useState(ADMIN_DEFAULT.name);
  const [email, setEmail] = useState(ADMIN_DEFAULT.email);
  const [saved, setSaved] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      message.error('Name and email are required.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className={`panel__content ${styles.page}`}>
      <h2 className={styles.heading}>Profile</h2>

      <div className={styles.stack}>

        {/* ── Avatar overview ── */}
        <div className={styles.avatarCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.avatarMeta}>
            <p className={styles.avatarName}>{name}</p>
            <p className={styles.avatarRole}>{ADMIN_DEFAULT.role}</p>
          </div>
        </div>

        {/* ── Account details (read-only) ── */}
        <article className={styles.card}>
          <p className={styles.cardTitle}>Account Details</p>
          <div className={styles.fields}>
            <div className={styles.readRow}>
              <span className={styles.readLabel}>Role</span>
              <span className={styles.readValue}>{ADMIN_DEFAULT.role}</span>
            </div>
          </div>
        </article>

        {/* ── Edit profile ── */}
        <article className={styles.card}>
          <p className={styles.cardTitle}>Edit Profile</p>
          <div className={styles.fields}>
            <FieldInput
              id="profile-name"
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <FieldInput
              id="profile-email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.saveRow}>
            {saved && (
              <span className={styles.savedBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Saved
              </span>
            )}
            <button className={styles.saveBtn} onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </article>

        {/* ── Security ── */}
        <article className={styles.card}>
          <p className={styles.cardTitle}>Security</p>
          <button className={styles.saveBtn} onClick={() => setIsPasswordModalOpen(true)}>
            Change Password
          </button>
        </article>

      </div>

      <ChangePasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
