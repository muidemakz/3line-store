import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Dropdown, Modal, Form, Input, Select, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { axiosInstance } from '@/shared/api/axios';
import { formatDate } from '@/shared/utils/date';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';
import { notifyError, notifySuccess } from '@/shared/lib/toast';

// ─── Types ────────────────────────────────────────────────
interface GradeLevel {
  id: string;
  name: string;
  defaultPoints: number;
}

interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  gradeLevel?: GradeLevel | null;
  gradeLevelId?: string | null;
  createdAt: string;
  _count?: { orders: number };
}

interface CreateUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gradeLevelId?: string;
  phone?: string;
}

interface CreatedCredentials {
  email: string;
  tempPassword: string;
  firstName: string;
  lastName: string;
}

interface EditUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gradeLevelId?: string;
  phone?: string;
}

// ─── API helpers ──────────────────────────────────────────
async function fetchUsers(): Promise<BackendUser[]> {
  const res = await axiosInstance.get('/users?limit=200');
  const raw = res.data.data;
  return Array.isArray(raw) ? raw : [];
}

async function fetchGradeLevels(): Promise<GradeLevel[]> {
  const res = await axiosInstance.get('/grade-levels');
  const raw = res.data.data;
  return Array.isArray(raw) ? raw : [];
}

async function createUser(data: object): Promise<BackendUser & { tempPassword?: string }> {
  const res = await axiosInstance.post('/users', data);
  return res.data.data;
}

async function updateUserStatus(id: string, status: string): Promise<BackendUser> {
  const res = await axiosInstance.patch(`/users/${id}/status`, { status });
  return res.data.data;
}

async function updateUser(id: string, data: object): Promise<BackendUser> {
  const res = await axiosInstance.patch(`/users/${id}`, data);
  return res.data.data;
}

async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/users/${id}`);
}

// ─── Status badge helpers ──────────────────────────────────
const statusColor: Record<string, string> = {
  ACTIVE: 'green',
  INACTIVE: 'default',
  SUSPENDED: 'red',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

const roleColor: Record<string, string> = {
  USER: 'blue',
  ADMIN: 'purple',
  SUPER_ADMIN: 'gold',
};

const roleLabel: Record<string, string> = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

// ─── Component ────────────────────────────────────────────
const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalType, setModalType] = useState<'single' | 'bulk' | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editTarget, setEditTarget] = useState<BackendUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const confirm = useConfirmModal();

  // ── Queries ───────────────────────────────────────────────
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
    staleTime: 30_000,
  });

  const { data: gradeLevels = [] } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: fetchGradeLevels,
    staleTime: 120_000,
  });

  // ── Mutations ─────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      form.resetFields();
      setModalType(null);
      // Show credentials modal — tempPassword is present when SMTP is not configured
      if (data.tempPassword) {
        setCreatedCredentials({
          email: data.email,
          tempPassword: data.tempPassword,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } else {
        notifySuccess('User created! Login credentials have been sent to their email.');
      }
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message ?? 'Failed to create user');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message ?? 'Failed to update user status');
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      editForm.resetFields();
      setEditOpen(false);
      setEditTarget(null);
      notifySuccess('User updated successfully');
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message ?? 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      notifyError(err.response?.data?.message ?? 'Failed to delete user');
    },
  });

  // ── Filtered data ─────────────────────────────────────────
  const filtered = useMemo(() =>
    users.filter(u => {
      const fullName = `${u.firstName} ${u.lastName}`;
      const matchesText = matchesSearch(fullName, debouncedSearch) || matchesSearch(u.email, debouncedSearch);
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesText && matchesRole;
    }),
    [users, debouncedSearch, roleFilter]
  );

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (values: CreateUserFormValues) => {
    createMutation.mutate({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      gradeLevelId: values.gradeLevelId || undefined,
      phone: values.phone?.trim() || undefined,
    });
  };

  // ── Columns ───────────────────────────────────────────────
  const columns: ColumnsType<BackendUser> = [
    {
      title: 'Date Added',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => formatDate(val),
      width: 110,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-900)' }}>{r.firstName} {r.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-400)' }}>{r.email}</div>
        </div>
      ),
    },
    {
      title: 'Grade Level',
      key: 'gradeLevel',
      render: (_, r) => r.gradeLevel
        ? <span style={{ fontSize: 13 }}>{r.gradeLevel.name} <span style={{ color: 'var(--text-400)', fontSize: 12 }}>({r.gradeLevel.defaultPoints} PT)</span></span>
        : <span style={{ color: 'var(--text-400)' }}>—</span>,
    },
    {
      title: 'Role',
      key: 'role',
      render: (_, r) => (
        <Tag color={roleColor[r.role] ?? 'default'}>{roleLabel[r.role] ?? r.role}</Tag>
      ),
    },
    {
      title: 'Orders',
      key: 'orders',
      render: (_, r) => r._count?.orders ?? 0,
      width: 80,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, r) => (
        <Tag color={statusColor[r.status] ?? 'default'}>{statusLabel[r.status] ?? r.status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isActive = record.status === 'ACTIVE';
        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit User',
                  onClick: (e) => { e.domEvent.stopPropagation(); openEdit(record); },
                },
                {
                  key: 'status',
                  label: isActive ? 'Deactivate' : 'Activate',
                  onClick: (e) => { e.domEvent.stopPropagation(); confirm.open({
                    title: isActive ? 'Deactivate User' : 'Activate User',
                    message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${record.firstName} ${record.lastName}?`,
                    confirmLabel: 'Yes, Confirm',
                    onConfirm: () => statusMutation.mutate({
                      id: record.id,
                      status: isActive ? 'INACTIVE' : 'ACTIVE',
                    }),
                  }); },
                },
                {
                  key: 'delete',
                  label: 'Delete User',
                  danger: true,
                  onClick: (e) => { e.domEvent.stopPropagation(); confirm.open({
                    title: 'Delete User',
                    message: `Delete ${record.firstName} ${record.lastName}? This cannot be undone.`,
                    confirmLabel: 'Yes, Delete',
                    onConfirm: () => deleteMutation.mutate(record.id),
                  }); },
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
        );
      },
    },
  ];

  const openEdit = (user: BackendUser) => {
    setEditTarget(user);
    editForm.setFieldsValue({
      firstName:    user.firstName,
      lastName:     user.lastName,
      email:        user.email,
      role:         user.role,
      gradeLevelId: user.gradeLevelId ?? undefined,
      phone:        user.phone ?? '',
    });
    setEditOpen(true);
  };

  const closeEdit = () => { editForm.resetFields(); setEditOpen(false); setEditTarget(null); };

  const handleEditSubmit = (values: EditUserFormValues) => {
    if (!editTarget) return;
    editMutation.mutate({
      id: editTarget.id,
      data: {
        firstName:    values.firstName.trim(),
        lastName:     values.lastName.trim(),
        email:        values.email.trim().toLowerCase(),
        role:         values.role,
        gradeLevelId: values.gradeLevelId || null,
        phone:        values.phone?.trim() || null,
      },
    });
  };

  const closeModal = () => { form.resetFields(); setModalType(null); };
  const closeBulkModal = () => { setHasFile(false); setModalType(null); };

  return (
    <div className="panel__content">
      <PanelHeader
        showingValue={`${users.length} User${users.length !== 1 ? 's' : ''}`}
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
          searchPlaceholder="Search by name or email..."
          onExport={() => {}}
          hasActiveFilters={!!roleFilter}
          onClear={() => setRoleFilter('')}
        >
          <Select
            placeholder="Role"
            allowClear
            value={roleFilter || undefined}
            onChange={val => setRoleFilter(val ?? '')}
            style={{ width: 140, height: 40 }}
            options={[
              { value: 'USER', label: 'User' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
            ]}
          />
        </TableFilterBar>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-400)' }}>Loading users…</div>
        ) : error ? (
          <EmptyState
            title="Failed to load users"
            description={(error as any)?.response?.status === 401 ? 'Session expired — please log out and sign in again.' : 'Could not reach the backend. Make sure the server is running.'}
          />
        ) : filtered.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filtered.map(u => ({ ...u, key: u.id }))}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="dataTable"
          />
        ) : (
          <EmptyState
            title={users.length === 0 ? 'No users yet' : 'No users match'}
            description={users.length === 0 ? 'Users added to the portal will appear here' : 'Try adjusting your search or filter'}
            action={users.length === 0 ? { label: 'Add New User', onClick: () => setModalType('single') } : undefined}
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

      {/* ── Add Single User Modal ─────────────────────────── */}
      <Modal
        open={modalType === 'single'}
        onCancel={closeModal}
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
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Add New User</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeModal} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">
            A secure password will be auto-generated and emailed to the user.
          </div>
        </header>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="modalBody"
          requiredMark={false}
        >
          {/* Name row */}
          <div className="modalGrid2">
            <div className="field">
              <Form.Item
                label={<span className="field__label">First Name <span style={{ color: 'red' }}>*</span></span>}
                name="firstName"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input className="field__input" placeholder="e.g. James" />
              </Form.Item>
            </div>
            <div className="field">
              <Form.Item
                label={<span className="field__label">Last Name <span style={{ color: 'red' }}>*</span></span>}
                name="lastName"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input className="field__input" placeholder="e.g. Oyeniyi" />
              </Form.Item>
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <Form.Item
              label={<span className="field__label">Email Address <span style={{ color: 'red' }}>*</span></span>}
              name="email"
              rules={[
                { required: true, message: 'Required' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input className="field__input" type="email" placeholder="jamesoyeniyi@mail.com" />
            </Form.Item>
          </div>

          {/* Role */}
          <div className="field">
            <Form.Item
              label={<span className="field__label">User Role <span style={{ color: 'red' }}>*</span></span>}
              name="role"
              initialValue="USER"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Select
                className="field__input"
                style={{ width: '100%' }}
                options={[
                  { value: 'USER', label: 'User (Marketplace access)' },
                  { value: 'ADMIN', label: 'Admin (Admin panel access)' },
                ]}
              />
            </Form.Item>
          </div>

          {/* Grade Level */}
          <div className="field">
            <Form.Item
              label={<span className="field__label">Grade Level</span>}
              name="gradeLevelId"
              extra={gradeLevels.length === 0 ? 'No grade levels found. Create one in Settings first.' : 'Determines starting points allocation'}
            >
              <Select
                className="field__input"
                style={{ width: '100%' }}
                placeholder={gradeLevels.length === 0 ? 'No grade levels configured' : 'Select a grade level'}
                allowClear
                disabled={gradeLevels.length === 0}
                options={gradeLevels.map(g => ({
                  value: g.id,
                  label: `${g.name} — ${g.defaultPoints} PT`,
                }))}
              />
            </Form.Item>
          </div>

          {/* Phone (optional) */}
          <div className="field">
            <Form.Item
              label={<span className="field__label">Phone (optional)</span>}
              name="phone"
            >
              <Input className="field__input" placeholder="+234 800 000 0000" />
            </Form.Item>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeModal}>
              Cancel
            </button>
            <button
              className="authButton"
              type="submit"
              style={{ flex: 1 }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* ── Edit User Modal ──────────────────────────────── */}
      <Modal
        open={editOpen}
        onCancel={closeEdit}
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
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Edit User</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeEdit} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">
            Editing: <strong>{editTarget?.firstName} {editTarget?.lastName}</strong>
          </div>
        </header>

        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="modalBody"
          requiredMark={false}
        >
          {/* Name row */}
          <div className="modalGrid2">
            <div className="field">
              <Form.Item label={<span className="field__label">First Name <span style={{ color: 'red' }}>*</span></span>} name="firstName" rules={[{ required: true, message: 'Required' }]}>
                <Input className="field__input" placeholder="e.g. James" />
              </Form.Item>
            </div>
            <div className="field">
              <Form.Item label={<span className="field__label">Last Name <span style={{ color: 'red' }}>*</span></span>} name="lastName" rules={[{ required: true, message: 'Required' }]}>
                <Input className="field__input" placeholder="e.g. Oyeniyi" />
              </Form.Item>
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <Form.Item
              label={<span className="field__label">Email Address <span style={{ color: 'red' }}>*</span></span>}
              name="email"
              rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Enter a valid email' }]}
            >
              <Input className="field__input" type="email" placeholder="user@mail.com" />
            </Form.Item>
          </div>

          {/* Role */}
          <div className="field">
            <Form.Item label={<span className="field__label">User Role <span style={{ color: 'red' }}>*</span></span>} name="role" rules={[{ required: true, message: 'Required' }]}>
              <Select className="field__input" style={{ width: '100%' }}
                options={[
                  { value: 'USER',  label: 'User (Marketplace access)' },
                  { value: 'ADMIN', label: 'Admin (Admin panel access)' },
                ]}
              />
            </Form.Item>
          </div>

          {/* Grade Level */}
          <div className="field">
            <Form.Item
              label={<span className="field__label">Grade Level</span>}
              name="gradeLevelId"
              extra={gradeLevels.length === 0 ? 'No grade levels found. Create one in Settings first.' : 'Determines points allocation'}
            >
              <Select
                className="field__input"
                style={{ width: '100%' }}
                placeholder={gradeLevels.length === 0 ? 'No grade levels configured' : 'Select a grade level'}
                allowClear
                disabled={gradeLevels.length === 0}
                options={gradeLevels.map(g => ({ value: g.id, label: `${g.name} — ${g.defaultPoints} PT` }))}
              />
            </Form.Item>
          </div>

          {/* Phone */}
          <div className="field">
            <Form.Item label={<span className="field__label">Phone (optional)</span>} name="phone">
              <Input className="field__input" placeholder="+234 800 000 0000" />
            </Form.Item>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeEdit}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }} disabled={editMutation.isPending}>
              {editMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* ── Bulk Upload Modal ─────────────────────────────── */}
      <Modal
        open={modalType === 'bulk'}
        onCancel={closeBulkModal}
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
                <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Bulk Upload</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeBulkModal} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Upload a CSV or XLSX file with user data</div>
        </header>

        <div className="modalBody">
          <button
            className={`fileDrop ${hasFile ? 'fileDrop--selected' : ''}`}
            type="button"
            onClick={() => setHasFile(true)}
          >
            <div className="fileDrop__icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" className="icon--dark-optimized">
                <path d="M7 16a4 4 0 010-8 5 5 0 019.7 1.3A3.5 3.5 0 1117 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 12v7m0-7l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="fileDrop__text">
              <span>Drag your file here, or <span className="fileDrop__browse">browse</span></span>
              <span className="fileDrop__sub">Supports: CSV, XLSX</span>
            </div>
          </button>

          <div className="fileHelp">
            <span className="fileHelp__muted">Need help with format?</span>
            <a className="fileHelp__link" href="#" role="button">Download a sample file ↓</a>
          </div>

          <div className="modalActions">
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeBulkModal}>Cancel</button>
            <button
              className="authButton"
              type="button"
              style={{ flex: 1 }}
              disabled={!hasFile}
              onClick={closeBulkModal}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>

      {/* ── User Credentials Modal (shown when email is not configured) ── */}
      <Modal
        open={!!createdCredentials}
        onCancel={() => setCreatedCredentials(null)}
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
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 3l-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">User Credentials</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={() => setCreatedCredentials(null)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">
            User <strong>{createdCredentials?.firstName} {createdCredentials?.lastName}</strong> has been created. Share these credentials with them.
          </div>
        </header>

        <div className="modalBody">
          <div style={{
            background: 'var(--color-warning-50, #FFFBEB)',
            border: '1.5px solid var(--color-warning-200, #FDE68A)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 13,
            color: 'var(--color-warning-800, #92400E)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <span>Email delivery is not configured. Copy and share these credentials manually. The password <strong>will not be shown again.</strong></span>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label className="field__label" style={{ display: 'block', marginBottom: 6 }}>Email Address</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-gray-50)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 8,
              padding: '10px 14px',
              fontFamily: 'monospace',
              fontSize: 14,
            }}>
              <span style={{ flex: 1 }}>{createdCredentials?.email}</span>
              <button
                type="button"
                title="Copy email"
                style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: 'var(--text-400)' }}
                onClick={() => { navigator.clipboard.writeText(createdCredentials?.email ?? ''); notifySuccess('Email copied!'); }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 24 }}>
            <label className="field__label" style={{ display: 'block', marginBottom: 6 }}>Temporary Password</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--color-gray-50)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 8,
              padding: '10px 14px',
              fontFamily: 'monospace',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              <span style={{ flex: 1 }}>{createdCredentials?.tempPassword}</span>
              <button
                type="button"
                title="Copy password"
                style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: 'var(--text-400)' }}
                onClick={() => { navigator.clipboard.writeText(createdCredentials?.tempPassword ?? ''); notifySuccess('Password copied!'); }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center' }}>
            <button
              className="authButton"
              type="button"
              style={{ flex: 1 }}
              onClick={() => {
                navigator.clipboard.writeText(
                  `Email: ${createdCredentials?.email}\nPassword: ${createdCredentials?.tempPassword}`
                );
                notifySuccess('Credentials copied to clipboard!');
                setCreatedCredentials(null);
              }}
            >
              Copy Both &amp; Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
