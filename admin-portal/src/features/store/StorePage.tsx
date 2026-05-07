import React, { useState, useMemo } from 'react';
import { Table, Dropdown, Modal, Form, Input, Select, DatePicker, Alert } from 'antd';
import type { Dayjs } from 'dayjs';

type RangeValue = [Dayjs | null, Dayjs | null] | null;
import { nairaToPoints, formatPoints } from '@/shared/utils/points';
import { formatDate } from '@/shared/utils/date';
import { capitalize } from '@/shared/utils/string';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';
import TableFilterBar from '@/components/common/TableFilterBar';
import { useDataStore } from '@/shared/store/data.store';
import type { StoreItem } from '@/shared/store/data.store';
import ConfirmationModal from '@/shared/components/modals/ConfirmationModal';
import { useSearch, matchesSearch } from '@/shared/hooks/useSearch';
import { useConfirmModal } from '@/shared/hooks/useConfirmModal';

interface ItemFormValues {
  itemName: string;
  brandName: string;
  unit: string;
  amountNaira: string;
  itemDesc?: string;
}

const StorePage: React.FC = () => {
  const [modalType, setModalType] = useState<'single' | 'bulk' | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const { items: data, addItem, deleteItem, toggleItemStatus, settings } = useDataStore();

  const [singleForm] = Form.useForm();
  const amountNairaWatch = Form.useWatch('amountNaira', singleForm);
  const computedPoints = nairaToPoints(Number(amountNairaWatch) || 0, settings.nairaPerPoint);

  const { searchText, setSearchText, debouncedSearch } = useSearch();
  const [dateRange, setDateRange] = useState<RangeValue>(null);
  const [imagePreview, setImagePreview] = useState('');
  const confirm = useConfirmModal();

  const filteredData = useMemo(() =>
    data.filter(item =>
      matchesSearch(item.title, debouncedSearch) || matchesSearch(item.brand, debouncedSearch)
    ),
    [data, debouncedSearch]
  );

  const handleSingleSubmit = (values: ItemFormValues) => {
    addItem({
      title: values.itemName,
      brand: values.brandName,
      unit: values.unit,
      amountNaira: Number(values.amountNaira),
      status: 'active',
    });
    singleForm.resetFields();
    setImagePreview('');
    setModalType(null);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFile) return;
    setHasFile(false);
    setModalType(null);
  };

  const columns: ColumnsType<StoreItem> = [
    {
      title: 'Item Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: 600, color: 'var(--text-900)' }}>{text}</span>,
    },
    { title: 'Brand', dataIndex: 'brand', key: 'brand' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit' },
    { title: 'Amount (₦)', dataIndex: 'amountNaira', key: 'amountNaira', render: (v: number) => `₦${v.toLocaleString()}` },
    { title: 'Points', dataIndex: 'amountPoints', key: 'amountPoints', render: (v: number) => formatPoints(v) },
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
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => formatDate(val) },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Item' },
              { key: 'edit', label: 'Edit Item' },
              {
                key: 'deactivate',
                label: record.status === 'active' ? 'Deactivate' : 'Activate',
                onClick: () => confirm.open({
                  title: record.status === 'active' ? 'Deactivate Item' : 'Activate Item',
                  message: `Are you sure you want to ${record.status === 'active' ? 'deactivate' : 'activate'} "${record.title}"?`,
                  confirmLabel: 'Yes, Confirm',
                  onConfirm: () => toggleItemStatus(record.id),
                }),
              },
              {
                key: 'delete',
                label: 'Delete Item',
                danger: true,
                onClick: () => confirm.open({
                  title: 'Delete Item',
                  message: `Are you sure you want to delete "${record.title}"?`,
                  confirmLabel: 'Yes, Delete',
                  onConfirm: () => deleteItem(record.id),
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

  const closeModal = () => { singleForm.resetFields(); setImagePreview(''); setModalType(null); };
  const closeBulkModal = () => { setHasFile(false); setModalType(null); };

  return (
    <div className="panel__content">
      <PanelHeader
        showingValue="All Items"
        action={{
          label: 'Add New Item',
          dropdownItems: [
            { key: 'single', label: 'Single Item', onClick: () => setModalType('single') },
            { key: 'bulk', label: 'Bulk Upload', onClick: () => { setHasFile(false); setModalType('bulk'); } },
          ],
        }}
      />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <TableFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          searchPlaceholder="Search title or brand..."
          onExport={() => {}}
          hasActiveFilters={!!dateRange}
          onClear={() => setDateRange(null)}
        >
          <DatePicker.RangePicker
            style={{ height: 40, borderRadius: 8 }}
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
          />
        </TableFilterBar>

        {filteredData.length > 0 ? (
          <Table columns={columns} dataSource={filteredData} rowKey="id" pagination={{ pageSize: 10 }} className="dataTable" />
        ) : (
          <EmptyState
            title="No Items match"
            description={data.length === 0 ? 'Items added to the store will show here' : 'Try adjusting your search criteria'}
            action={data.length === 0 ? { label: 'Add New Item', onClick: () => setModalType('single') } : undefined}
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

      {/* Add Single Item Modal */}
      <Modal
        open={modalType === 'single'}
        onCancel={closeModal}
        footer={null}
        closable={false}
        destroyOnClose
        width={480}
        styles={{ body: { padding: 0 } }}
      >
        <header className="modalHeader">
          <div className="modalHeader__titleRow">
            <span className="modalHeader__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="modalHeader__titles">
              <div className="modalHeader__title">Add New Item</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeModal} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Share the item details you would like to list below.</div>
        </header>

        <Form
          form={singleForm}
          layout="vertical"
          onFinish={handleSingleSubmit}
          className="modalBody"
          requiredMark={false}
        >
          <div className="fieldGroup">
            <label className="field">
              <span className="field__label">Upload Image (Optional)</span>
              <div
                onClick={() => setImagePreview('https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=150&h=150')}
                style={{ width: 80, height: 80, border: '1px solid var(--gray-200)', background: 'var(--gray-50)', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div style={{ position: 'absolute', bottom: -8, right: -8, width: 24, height: 24, background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: '50%', display: 'grid', placeItems: 'center', zIndex: 2 }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" className="icon--dark-optimized"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
              </div>
            </label>

            <div className="field">
              <Form.Item
                label={<span className="field__label">Item Name</span>}
                name="itemName"
                rules={[{ required: true, message: 'Please enter an item name' }]}
              >
                <Input className="field__input" placeholder="e.g Noodles 20X45g" />
              </Form.Item>
            </div>

            <div className="field">
              <Form.Item
                label={<span className="field__label">Brand Name</span>}
                name="brandName"
                rules={[{ required: true, message: 'Please enter a brand' }]}
              >
                <Input className="field__input" placeholder="e.g Indomie" />
              </Form.Item>
            </div>

            <div className="field">
              <Form.Item
                label={<span className="field__label">Unit of Measurement</span>}
                name="unit"
                rules={[{ required: true, message: 'Please select a unit' }]}
              >
                <Select
                  className="field__input"
                  style={{ width: '100%', padding: 0 }}
                  placeholder="Select an option"
                  options={[
                    { value: 'Carton', label: 'Carton' },
                    { value: 'Pack', label: 'Pack' },
                    { value: 'Pieces', label: 'Pieces' },
                  ]}
                />
              </Form.Item>
            </div>

            <div className="field">
              <Form.Item
                label={<span className="field__label">Item Description (Optional)</span>}
                name="itemDesc"
              >
                <Input className="field__input" placeholder="e.g A product of Dufil Prima Foods" />
              </Form.Item>
            </div>

            {settings.nairaPerPoint === 0 && (
              <Alert
                type="warning"
                showIcon
                message="Point configuration not set. Go to Settings to configure the Naira-to-Points rate before adding items."
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <Form.Item
                  label={<span className="field__label">Amount In Naira</span>}
                  name="amountNaira"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input className="field__input" placeholder="e.g 200" type="number" />
                </Form.Item>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--gray-200)', marginTop: 8 }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" className="icon--dark-optimized">
                  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                <div className="field__label" style={{ marginBottom: 8 }}>Amount In Points</div>
                <div
                  className="field__input"
                  style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 8, padding: '0 12px', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-600)' }}
                >
                  <span>{computedPoints}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-400)' }}>PT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={closeModal}>Cancel</button>
            <button className="authButton" type="submit" style={{ flex: 1 }}>Submit</button>
          </div>
        </Form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        open={modalType === 'bulk'}
        onCancel={closeBulkModal}
        footer={null}
        closable={false}
        destroyOnClose
        width={480}
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
              <div className="modalHeader__title">Upload Bulk</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={closeBulkModal} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" className="icon--dark-optimized">
                <path d="M7 16a4 4 0 010-8 5 5 0 019.7 1.3A3.5 3.5 0 1117 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 12v7m0-7l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
            <button className="secondaryButton" type="button" onClick={closeBulkModal}>Cancel</button>
            <button className="authButton" type="submit" disabled={!hasFile}>Submit</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StorePage;
