import React from 'react';
import { Modal } from 'antd';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'delete' | 'deactivate';
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Yes, I Do',
  cancelLabel = "No, I Don't"
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={400}
      styles={{ body: { padding: 0 } }}
    >
      <div className="premiumModalCard" style={{ boxShadow: 'none', borderRadius: 0, animation: 'none', width: '100%', maxHeight: 'unset' }}>
        <div className="confirmIconWrap">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="icon--dark-optimized">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="confirmTitle">{title}</div>
        <div className="confirmText">{message}</div>
        <div className="confirmActions">
          <button className="secondaryButton" type="button" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            className="authButton"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
