import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Dropdown, Modal, Form, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { axiosInstance } from '@/shared/api/axios';
import { formatDate } from '@/shared/utils/date';
import { formatPoints } from '@/shared/utils/points';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';
import { notifyError, notifySuccess } from '@/shared/lib/toast';

// ─── Types ────────────────────────────────────────────────
interface BackendProduct {
  id: string;
  title: string;
  brand?: string;
  unit?: string;
  description: string;
  image?: string;
  nairaPrice: number;
  pointsPrice: number;
  createdAt: string;
  session?: { id: string; name: string };
}

interface ProductFormValues {
  title: string;
  brand?: string;
  unit?: string;
  description: string;
  nairaPrice: string;
  pointsPrice?: string;
}

// ─── Unit options (shared) ────────────────────────────────
const UNIT_OPTIONS = [
  { value: 'Pieces',      label: 'Pieces' },
  { value: 'Row',         label: 'Row' },
  { value: 'Half Carton', label: 'Half Carton' },
  { value: 'Full Carton', label: 'Full Carton' },
];

// ─── API helpers ──────────────────────────────────────────
async function fetchProducts(): Promise<BackendProduct[]> {
  const res = await axiosInstance.get('/products/admin/all');
  const raw = res.data.data;
  return Array.isArray(raw) ? raw : [];
}

async function fetchPointRate(): Promise<number> {
  const res = await axiosInstance.get('/settings/point-config');
  return res.data.data?.nairaPerPoint ?? 500;
}

async function createProduct(formData: FormData): Promise<BackendProduct> {
  const res = await axiosInstance.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

async function updateProduct({ id, formData }: { id: string; formData: FormData }): Promise<BackendProduct> {
  const res = await axiosInstance.patch(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

async function deleteProduct(id: string): Promise<void> {
  await axiosInstance.delete(`/products/${id}`);
}

// ─── Shared modal header ──────────────────────────────────
const ModalHeader = ({ title, desc, onClose }: { title: string; desc?: string; onClose: () => void }) => (
  <header className="modalHeader">
    <div className="modalHeader__titleRow">
      <span className="modalHeader__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="modalHeader__titles">
        <div className="modalHeader__title">{title}</div>
      </div>
      <button className="modalHeader__close" type="button" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
    {desc && <div className="modalHeader__desc">{desc}</div>}
  </header>
);

// ─── Component ────────────────────────────────────────────
const StorePage: React.FC = () => {
  const queryClient = useQueryClient();

  // ── Add modal state ───────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [addForm] = Form.useForm();
  const addFileRef = useRef<HTMLInputElement>(null);
  const [addNairaInput, setAddNairaInput] = useState('');
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

  // ── Edit modal state ──────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm();
  const editFileRef = useRef<HTMLInputElement>(null);
  const [editNairaInput, setEditNairaInput] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<BackendProduct | null>(null);

  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const confirm = useConfirmModal();

  // ── Queries ───────────────────────────────────────────────
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
    staleTime: 30_000,
  });

  const { data: nairaPerPoint = 500 } = useQuery({
    queryKey: ['point-config'],
    queryFn: fetchPointRate,
    staleTime: 60_000,
  });

  const calcPoints = (naira: string) =>
    naira && Number(naira) > 0 ? Math.ceil(Number(naira) / nairaPerPoint) : null;

  const addCalcPoints  = calcPoints(addNairaInput);
  const editCalcPoints = calcPoints(editNairaInput);

  // ── Mutations ─────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeAdd();
      notifySuccess('Product added successfully');
    },
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to add product'),
  });

  const editMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      closeEdit();
      notifySuccess('Product updated');
    },
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
    onError: (err: any) => notifyError(err.response?.data?.message ?? 'Failed to delete product'),
  });

  // ── Filtered data ─────────────────────────────────────────
  const filtered = useMemo(() =>
    products.filter(p =>
      matchesSearch(p.title, debouncedSearch) ||
      matchesSearch(p.brand ?? '', debouncedSearch)
    ),
    [products, debouncedSearch]
  );

  // ── Close helpers ─────────────────────────────────────────
  const closeAdd = () => {
    addForm.resetFields();
    setAddNairaInput('');
    setAddImageFile(null);
    setAddImagePreview(null);
    setAddOpen(false);
  };

  const closeEdit = () => {
    editForm.resetFields();
    setEditNairaInput('');
    setEditImageFile(null);
    setEditImagePreview(null);
    setEditTarget(null);
    setEditOpen(false);
  };

  // ── Open edit ─────────────────────────────────────────────
  const openEdit = (product: BackendProduct) => {
    setEditTarget(product);
    editForm.setFieldsValue({
      title:       product.title,
      brand:       product.brand ?? '',
      unit:        product.unit ?? undefined,
      description: product.description,
      nairaPrice:  String(product.nairaPrice),
      pointsPrice: String(product.pointsPrice),
    });
    setEditNairaInput(String(product.nairaPrice));
    setEditImagePreview(product.image ?? null);
    setEditOpen(true);
  };

  // ── Image helpers ─────────────────────────────────────────
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (s: string | null) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Submit: Add ───────────────────────────────────────────
  const handleAdd = (values: ProductFormValues) => {
    const fd = new FormData();
    fd.append('title', values.title.trim());
    fd.append('description', values.description.trim());
    fd.append('nairaPrice', String(Number(values.nairaPrice)));
    if (values.brand?.trim())   fd.append('brand', values.brand.trim());
    if (values.unit?.trim())    fd.append('unit', values.unit.trim());
    if (values.pointsPrice)     fd.append('pointsPrice', String(Number(values.pointsPrice)));
    if (addImageFile)           fd.append('image', addImageFile);
    createMutation.mutate(fd);
  };

  // ── Submit: Edit ──────────────────────────────────────────
  const handleEdit = (values: ProductFormValues) => {
    if (!editTarget) return;
    const fd = new FormData();
    fd.append('title', values.title.trim());
    fd.append('description', values.description.trim());
    fd.append('nairaPrice', String(Number(values.nairaPrice)));
    if (values.brand?.trim())   fd.append('brand', values.brand.trim());
    if (values.unit?.trim())    fd.append('unit', values.unit.trim());
    if (values.pointsPrice)     fd.append('pointsPrice', String(Number(values.pointsPrice)));
    if (editImageFile)          fd.append('image', editImageFile);
    editMutation.mutate({ id: editTarget.id, formData: fd });
  };

  // ── Image picker UI (reused for add + edit) ───────────────
  const ImagePicker = ({
    preview,
    fileRef,
    onChangeFile,
    onRemove,
  }: {
    preview: string | null;
    fileRef: React.RefObject<HTMLInputElement | null>;
    onChangeFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
  }) => (
    <div className="field" style={{ marginBottom: 16 }}>
      <label className="field__label" style={{ display: 'block', marginBottom: 8 }}>Product Image</label>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChangeFile} />
      {preview ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={preview} alt="preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gray-200)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button type="button" className="secondaryButton" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => fileRef.current?.click()}>Change</button>
            <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 13, padding: 0, textAlign: 'left' }}>Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => fileRef.current?.click()}
          style={{ width: '100%', height: 80, border: '1.5px dashed var(--gray-300)', borderRadius: 8, background: 'var(--gray-50)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-400)', fontSize: 13 }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
          </svg>
          Click to upload image
        </button>
      )}
    </div>
  );

  // ── Product form fields (reused) ──────────────────────────
  const ProductFields = ({ nairaInput, onNairaChange, calcPts }: {
    nairaInput: string;
    onNairaChange: (v: string) => void;
    calcPts: number | null;
  }) => (
    <>
      <div className="field">
        <Form.Item label={<span className="field__label">Product Name <span style={{ color: 'red' }}>*</span></span>} name="title" rules={[{ required: true, message: 'Required' }]}>
          <Input className="field__input" placeholder="e.g. Noodles 20×45g" />
        </Form.Item>
      </div>
      <div className="modalGrid2">
        <div className="field">
          <Form.Item label={<span className="field__label">Brand Name</span>} name="brand">
            <Input className="field__input" placeholder="e.g. Indomie" />
          </Form.Item>
        </div>
        <div className="field">
          <Form.Item label={<span className="field__label">Unit of Measurement</span>} name="unit">
            <Select className="field__input" placeholder="Select unit" options={UNIT_OPTIONS} />
          </Form.Item>
        </div>
      </div>
      <div className="field">
        <Form.Item label={<span className="field__label">Description <span style={{ color: 'red' }}>*</span></span>} name="description" rules={[{ required: true, message: 'Required' }]}>
          <Input.TextArea className="field__input" rows={2} placeholder="Brief product description" />
        </Form.Item>
      </div>
      <div className="modalGrid2">
        <div className="field">
          <Form.Item label={<span className="field__label">Naira Price <span style={{ color: 'red' }}>*</span></span>} name="nairaPrice" rules={[{ required: true, message: 'Required' }]}>
            <Input className="field__input" placeholder="e.g. 2500" type="number" min="0" prefix="₦"
              value={nairaInput} onChange={e => onNairaChange(e.target.value)} />
          </Form.Item>
        </div>
        <div className="field">
          <Form.Item
            label={<span className="field__label">Points Price</span>}
            name="pointsPrice"
            extra={calcPts != null ? `Auto: ${calcPts} PT (₦${nairaPerPoint.toLocaleString()} = 1 PT)` : 'Leave blank to auto-calculate'}
          >
            <Input className="field__input" placeholder="Auto" type="number" min="0" suffix="PT" />
          </Form.Item>
        </div>
      </div>
    </>
  );

  // ── Columns ───────────────────────────────────────────────
  const columns: ColumnsType<BackendProduct> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {record.image ? (
            <img src={record.image} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--gray-200)', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--gray-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-400)" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-900)' }}>{record.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-400)' }}>
              {[record.brand, record.unit].filter(Boolean).join(' · ') || record.description?.slice(0, 50)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Price (₦)',
      dataIndex: 'nairaPrice',
      key: 'nairaPrice',
      render: (v: number) => `₦${Number(v).toLocaleString()}`,
    },
    {
      title: 'Points',
      dataIndex: 'pointsPrice',
      key: 'pointsPrice',
      render: (v: number) => formatPoints(v),
    },
    {
      title: 'Added',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val: string) => formatDate(val),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit Product',
                onClick: (e) => { e.domEvent.stopPropagation(); openEdit(record); },
              },
              {
                key: 'delete',
                label: 'Delete Product',
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  confirm.open({
                    title: 'Delete Product',
                    message: `Delete "${record.title}"? This cannot be undone.`,
                    confirmLabel: 'Yes, Delete',
                    onConfirm: () => deleteMutation.mutate(record.id),
                  });
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <div className="tableActionDots" onClick={e => e.stopPropagation()}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 13a1 1 0 100-2 1 1 0 000 2zm0-6a1 1 0 100-2 1 1 0 000 2zm0 12a1 1 0 100-2 1 1 0 000 2z" strokeLinecap="round" />
            </svg>
          </div>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="panel__content">
      <PanelHeader
        showingValue={`${products.length} Product${products.length !== 1 ? 's' : ''}`}
        action={{ label: 'Add New Product', onClick: () => setAddOpen(true) }}
      />

      <section className="cardSection" style={{ padding: 0, minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search products..."
          onExport={() => {}}
        />

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-400)' }}>Loading products…</div>
        ) : error ? (
          <EmptyState
            title="Failed to load products"
            description={(error as any)?.response?.status === 401 ? 'Session expired — please log out and sign in again.' : 'Could not reach the backend. Make sure the server is running.'}
          />
        ) : filtered.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filtered.map(p => ({ ...p, key: p.id }))}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="dataTable"
          />
        ) : (
          <EmptyState
            title={products.length === 0 ? 'No products yet' : 'No products match'}
            description={products.length === 0 ? 'Add your first product to appear in the marketplace' : 'Try adjusting your search'}
            action={products.length === 0 ? { label: 'Add New Product', onClick: () => setAddOpen(true) } : undefined}
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

      {/* ── Add Product Modal ─────────────────────────────── */}
      <Modal open={addOpen} onCancel={closeAdd} footer={null} closable={false} destroyOnClose width={520} styles={{ body: { padding: 0, maxHeight: '90vh', overflowY: 'auto' } }}>
        <ModalHeader title="Add New Product" desc="Product will be available in the marketplace across all sessions." onClose={closeAdd} />
        <Form form={addForm} layout="vertical" onFinish={handleAdd} className="modalBody" requiredMark={false}>
          <ImagePicker
            preview={addImagePreview}
            fileRef={addFileRef}
            onChangeFile={e => handleImageChange(e, setAddImageFile, setAddImagePreview)}
            onRemove={() => { setAddImageFile(null); setAddImagePreview(null); if (addFileRef.current) addFileRef.current.value = ''; }}
          />
          <ProductFields nairaInput={addNairaInput} onNairaChange={setAddNairaInput} calcPts={addCalcPoints} />
          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeAdd}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding…' : 'Add Product'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* ── Edit Product Modal ────────────────────────────── */}
      <Modal open={editOpen} onCancel={closeEdit} footer={null} closable={false} destroyOnClose width={520} styles={{ body: { padding: 0, maxHeight: '90vh', overflowY: 'auto' } }}>
        <ModalHeader title="Edit Product" desc={`Editing: ${editTarget?.title ?? ''}`} onClose={closeEdit} />
        <Form form={editForm} layout="vertical" onFinish={handleEdit} className="modalBody" requiredMark={false}>
          <ImagePicker
            preview={editImagePreview}
            fileRef={editFileRef}
            onChangeFile={e => handleImageChange(e, setEditImageFile, setEditImagePreview)}
            onRemove={() => { setEditImageFile(null); setEditImagePreview(editTarget?.image ?? null); if (editFileRef.current) editFileRef.current.value = ''; }}
          />
          <ProductFields nairaInput={editNairaInput} onNairaChange={setEditNairaInput} calcPts={editCalcPoints} />
          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeEdit}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }} disabled={editMutation.isPending}>
              {editMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StorePage;
