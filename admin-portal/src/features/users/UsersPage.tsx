import React, { useState } from 'react';
import { Table, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';

import usersIcon from '@/assets/sidebar-users.svg';

interface UserItem {
  id: string;
  name: string;
  email: string;
  userType: string;
  gradeLevel: string;
  status: 'active' | 'inactive';
  date: string;
}

const UsersPage: React.FC = () => {
  const [modalType, setModalType] = useState<'single' | 'bulk' | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [data, setData] = useState<UserItem[]>([
    { id: '1', name: 'John Doe', email: 'john@example.com', userType: 'Admin', gradeLevel: 'Level 1', status: 'active', date: '01/10/2025' },
  ]);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  const isSingleValid = userName.trim() && userEmail.trim() && userType && gradeLevel;

  const resetForm = () => { setUserName(''); setUserEmail(''); setUserType(''); setGradeLevel(''); };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSingleValid) return;
    setData(prev => [...prev, {
      id: Date.now().toString(),
      name: userName,
      email: userEmail,
      userType,
      gradeLevel,
      status: 'active',
      date: new Date().toLocaleDateString('en-GB'),
    }]);
    resetForm();
    setModalType(null);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFile) return;
    setHasFile(false);
    setModalType(null);
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: "User's Name", dataIndex: 'name', key: 'name',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'User Type', dataIndex: 'userType', key: 'userType' },
    { title: 'Grade Level', dataIndex: 'gradeLevel', key: 'gradeLevel' },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status) => (
        <span className={`statusBadge ${status === 'active' ? 'statusBadge--active' : ''}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    { title: 'Date Joined', dataIndex: 'date', key: 'date' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Profile' },
              { key: 'edit', label: 'Edit User' },
              { key: 'deactivate', label: 'Deactivate', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <div className="tableActionDots" style={{ cursor: 'pointer', padding: '4px 8px' }}>...</div>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="panel__content">
      <PanelHeader
        showingValue="All Users"
        action={{
          label: "Add New User",
          dropdownItems: [
            { key: 'single', label: 'Single User', onClick: () => setModalType('single') },
            { key: 'bulk', label: 'Bulk Upload', onClick: () => { setHasFile(false); setModalType('bulk'); } },
          ],
        }}
      />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="secondaryButton">Search users</button>
            <button className="secondaryButton">Role</button>
            <button className="adminActionBtn" style={{ padding: '0 24px' }}>Apply</button>
          </div>
          <button className="secondaryButton">Export</button>
        </div>
        {data.length > 0 ? (
          <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} className="dataTable" />
        ) : (
          <EmptyState
            title="No Users yet"
            description="Users added to the portal will show here"
            icon={usersIcon}
            action={{ label: "Add New User", onClick: () => setModalType('single') }}
          />
        )}
      </section>

      {/* Add Single User Modal */}
      <Modal
        open={modalType === 'single'}
        onCancel={() => { resetForm(); setModalType(null); }}
        footer={null} closable={false} destroyOnClose width={480}
        styles={{ body: { padding: 0 } }}
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Add New User</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={() => { resetForm(); setModalType(null); }} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Provide the new user details you would like to add below.</div>
        </header>

        <form className="modalBody" onSubmit={handleSingleSubmit} noValidate>
          <div className="fieldGroup">
            <label className="field">
              <span className="field__label">User's Name</span>
              <input className="field__input" name="userName" placeholder="e.g James Oyeniyi" required value={userName} onChange={e => setUserName(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">User's Email</span>
              <input className="field__input" type="email" name="userEmail" placeholder="jamesomoniyi@mail.com" required value={userEmail} onChange={e => setUserEmail(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">User Type</span>
              <div className="field__inputWrap">
                <select className="field__input" name="userType" required style={{ appearance: 'none' }} value={userType} onChange={e => setUserType(e.target.value)}>
                  <option value="" disabled>Select An Option</option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                <span className="field__icon" style={{ pointerEvents: 'none' }} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </label>
            <label className="field">
              <span className="field__label">Grade Level</span>
              <div className="field__inputWrap">
                <select className="field__input" name="gradeLevel" required style={{ appearance: 'none' }} value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}>
                  <option value="" disabled>Select An Option</option>
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                </select>
                <span className="field__icon" style={{ pointerEvents: 'none' }} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </label>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={() => { resetForm(); setModalType(null); }}>Cancel</button>
            <button
              className="authButton" type="submit" disabled={!isSingleValid}
              style={{ flex: 1, backgroundColor: isSingleValid ? '#00002A' : '#d5d7da', borderColor: isSingleValid ? '#00002A' : '#d5d7da' }}
            >Create New</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        open={modalType === 'bulk'}
        onCancel={() => { setHasFile(false); setModalType(null); }}
        footer={null} closable={false} destroyOnClose width={480}
        styles={{ body: { padding: 0 } }}
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" stroke="#667085" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Upload Bulk</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={() => { setHasFile(false); setModalType(null); }} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Upload the file below</div>
        </header>

        <form className="modalBody" onSubmit={handleBulkSubmit} noValidate>
          <button
            className={`fileDrop${hasFile ? ' fileDrop--selected' : ''}`}
            type="button"
            onClick={() => setHasFile(true)}
          >
            <span className="fileDrop__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
                <path d="M7 16a4 4 0 010-8 5 5 0 019.7 1.3A3.5 3.5 0 1117 16" stroke="#667085" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 12v7m0-7l-3 3m3-3l3 3" stroke="#667085" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="fileDrop__text">
              <span>Drag your file here, or <span className="fileDrop__browse">browse</span></span>
              <span className="fileDrop__sub">supports: CSV, XLSX</span>
            </span>
          </button>

          <div className="fileHelp">
            <span className="fileHelp__muted">Need help with format?</span>
            <a className="fileHelp__link" href="#" role="button">Download a sample file ↓</a>
          </div>

          <div className="modalActions">
            <button className="secondaryButton" type="button" onClick={() => { setHasFile(false); setModalType(null); }}>Cancel</button>
            <button className="authButton" type="submit" disabled={!hasFile}>Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
