import React, { useState } from 'react';
import { Modal, message as antMessage } from 'antd';
import FieldInput from '@/components/common/FieldInput';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ open, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);

  const mismatch = confirmTouched && confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    oldPassword.length > 0 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmTouched(true);
    if (!canSubmit) return;
    antMessage.success('Password updated successfully');
    handleClose();
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setConfirmTouched(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={false}
      destroyOnClose
      width={480}
      centered
      styles={{ body: { padding: 0 } }}
    >
      <header className="modalHeader">
        <div className="modalHeader__titleRow">
          <span className="modalHeader__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="modalHeader__titles">
            <div className="modalHeader__title">Change Password</div>
          </div>
          <button className="modalHeader__close" type="button" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="modalHeader__desc">Enter your current password and choose a new one.</div>
      </header>

      <form className="modalBody" onSubmit={handleSubmit} noValidate>
        <div className="fieldGroup">
          <div className="field">
            <FieldInput
              id="old-password"
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <FieldInput
              id="new-password"
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <FieldInput
              id="confirm-password"
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value);
                setConfirmTouched(true);
              }}
              required
            />
            {mismatch && (
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--danger)', lineHeight: 1.4 }}>
                Passwords do not match.
              </p>
            )}
          </div>
        </div>

        <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
          <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={handleClose}>
            Cancel
          </button>
          <button className="authButton" type="submit" style={{ flex: 1 }} disabled={!canSubmit}>
            Update Password
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
