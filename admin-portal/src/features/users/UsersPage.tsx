import React, { useState, useMemo } from 'react';
import { Table, Dropdown, Modal, Form, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import { useDataStore } from '@/shared/store/data.store';
import type { UserItem } from '@/shared/store/data.store';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';
import { capitalize } from '@/shared/utils/string';
import { formatDate } from '@/shared/utils/date';

import usersIcon from '@/assets/sidebar-users.svg';

interface UserFormValues {
  userName: string;
  userEmail: string;
  userType: string;
  gradeLevel: string;
}

const UsersPage: React.FC = () => {
  const [modalType, setModalType] = useState<'single' | 'bulk' | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const { users: data, addUser, deleteUser, toggleUserStatus, gradeLevels } = useDataStore();

  const [singleForm] = Form.useForm();
  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const [roleFilter, setRoleFilter] = useState('');
  const confirm = useConfirmModal();

  const filteredData = useMemo(() =>
    data.filter(user =>
      (matchesSearch(user.name, debouncedSearch) || matchesSearch(user.email, debouncedSearch)) &&
      (!roleFilter || user.userType === roleFilter)
    ),
    [data, debouncedSearch, roleFilter]
  );

  const handleSingleSubmit = (values: UserFormValues) => {
    addUser({
      name: values.userName,
      email: values.userEmail,
      userType: values.userType,
      gradeLevel: values.gradeLevel,
      status: 'active',
    });
    singleForm.resetFields();
    setModalType(null);
  };

  const columns: ColumnsType<UserItem> = [
    { title: 'Date Added', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => formatDate(val) },
    { title: 'Name', dataIndex: 'name', key: 'name', render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Grade Level', dataIndex: 'gradeLevel', key: 'gradeLevel' },
    {
      title: 'Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (type: string) => (
        <span style={{ color: type === 'Admin' ? 'var(--accent)' : 'var(--text-600)', fontWeight: type === 'Admin' ? 600 : 400 }}>
          {type}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`statusBadge ${status === 'active' ? 'statusBadge--active' : ''}`}>
          {capitalize(status)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Profile' },
              { key: 'edit', label: 'Edit User' },
              {
                key: 'status',
                label: record.status === 'active' ? 'Deactivate' : 'Activate',
                onClick: () => confirm.open({
                  title: record.status === 'active' ? 'Deactivate User' : 'Activate User',
                  message: `Are you sure you want to ${record.status === 'active' ? 'deactivate' : 'activate'} ${record.name}?`,
                  confirmLabel: 'Yes, Confirm',
                  onConfirm: () => toggleUserStatus(record.id),
                }),
              },
              {
                key: 'delete',
                label: 'Delete User',
                danger: true,
                onClick: () => confirm.open({
                  title: 'Delete User',
                  message: `Are you sure you want to delete ${record.name}?`,
                  confirmLabel: 'Yes, Delete',
                  onConfirm: () => deleteUser(record.id),
                }),
              },
            ],
          }}
          trigger={['click']}
        >
          <div className="tableActionDots">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100-2 1 1 0 000 2z" strokeLinecap="round" />
            </svg>
          </div>
        </Dropdown>
      ),
    },
  ];

  const closeModal = () => { singleForm.resetFields(); setModalType(null); };
  const closeBulkModal = () => { setHasFile(false); setModalType(null); };

  return (
    <div className="panel__content">
      <PanelHeader
        showingValue="All Users"
        action={{
          label: 'Add New User',
          dropdownItems: [
            { key: 'single', label: 'Single User', onClick: () => setModalType('single') },
            { key: 'bulk', label: 'Bulk Upload', onClick: () => setModalType('bulk') },
          ],
        }}
      />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search users..."
          onExport={() => {}}
          hasActiveFilters={!!roleFilter}
          onClear={() => setRoleFilter('')}
        >
          <Select
            placeholder="Role"
            allowClear
            value={roleFilter || undefined}
            onChange={val => setRoleFilter(val ?? '')}
            style={{ width: 120, height: 40 }}
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'User', label: 'User' },
            ]}
          />
        </TableFilterBar>

        {filteredData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredData.map(u => ({ ...u, key: u.id }))}
            pagination={{ pageSize: 10 }}
            className="dataTable"
          />
        ) : (
          <EmptyState
            title="No Users match"
            description={data.length === 0 ? 'Users added to the portal will show here' : 'Try adjusting your search criteria'}
            icon={usersIcon}
            action={data.length === 0 ? { label: 'Add New User', onClick: () => setModalType('single') } : undefined}
          />
        )}
      </section>

      <ConfirmationModal
        isOpen={confirm.isOpen}
        onClose={confirm.close}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
      />

      {/* Add Single User Modal */}
      <Modal
        title={null}
        open={modalType === 'single'}
        onCancel={closeModal}
        footer={null}
        closable={false}
        destroyOnClose
        width={480}
        centered
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Add New User</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeModal}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Provide the new user details you would like to add below.</div>
        </header>

        <Form
          form={singleForm}
          layout="vertical"
          onFinish={handleSingleSubmit}
          className="modalBody"
          requiredMark={false}
        >
          <div className="fieldGroup">
            <div className="field">
              <Form.Item
                label={<span className="field__label">User's Name</span>}
                name="userName"
                rules={[{ required: true, message: 'Please enter a name' }]}
              >
                <Input className="field__input" placeholder="e.g James Oyeniyi" />
              </Form.Item>
            </div>

            <div className="field">
              <Form.Item
                label={<span className="field__label">User's Email</span>}
                name="userEmail"
                rules={[
                  { required: true, message: 'Please enter an email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input className="field__input" type="email" placeholder="jamesomoniyi@mail.com" />
              </Form.Item>
            </div>

            <div className="field">
              <Form.Item
                label={<span className="field__label">User Type</span>}
                name="userType"
                rules={[{ required: true, message: 'Please select a type' }]}
              >
                <Select
                  className="field__input"
                  style={{ width: '100%', padding: 0 }}
                  placeholder="Select An Option"
                  options={[
                    { value: 'User', label: 'User' },
                    { value: 'Admin', label: 'Admin' },
                  ]}
                />
              </Form.Item>
            </div>

            <div className="field">
              <Form.Item
                label={<span className="field__label">Grade Level</span>}
                name="gradeLevel"
                rules={[{ required: true, message: 'Please select a grade level' }]}
              >
                <Select
                  className="field__input"
                  style={{ width: '100%', padding: 0 }}
                  placeholder={gradeLevels.length === 0 ? 'No grade levels configured' : 'Select An Option'}
                  disabled={gradeLevels.length === 0}
                  options={gradeLevels.map(g => ({
                    value: g.name,
                    label: `${g.name} (${g.points} PT)`,
                  }))}
                />
              </Form.Item>
            </div>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }}>Create New</button>
          </div>
        </Form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        title={null}
        open={modalType === 'bulk'}
        onCancel={closeBulkModal}
        footer={null}
        closable={false}
        destroyOnClose
        width={480}
        centered
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Upload Bulk</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeBulkModal}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Upload the file below</div>
        </header>

        <div className="modalBody">
          <button className={`fileDrop ${hasFile ? 'fileDrop--selected' : ''}`} type="button" onClick={() => setHasFile(true)}>
            <div className="fileDrop__icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" className="icon--dark-optimized">
                <path d="M7 16a4 4 0 010-8 5 5 0 019.7 1.3A3.5 3.5 0 1117 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 12v7m0-7l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="fileDrop__text">
              <span>Drag your file here, or <span className="fileDrop__browse">browse</span></span>
              <span className="fileDrop__sub">supports: CSV, XLSX</span>
            </div>
          </button>

          <div className="fileHelp">
            <span className="fileHelp__muted">Need help with format?</span>
            <a className="fileHelp__link" href="#" role="button">Download a sample file ↓</a>
          </div>

          <div className="modalActions">
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeBulkModal}>Cancel</button>
            <button className="authButton" type="button" style={{ flex: 1 }} disabled={!hasFile} onClick={closeBulkModal}>Submit</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
