import React, { useState, useRef } from 'react';
import { Table, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import EmptyState from '@/components/common/EmptyState';
import PanelHeader from '@/components/common/PanelHeader';

interface StoreItem {
  id: string;
  title: string;
  brand: string;
  unit: string;
  amountNaira: number;
  amountPoints: number;
  status: 'active' | 'inactive';
  date: string;
}

const StorePage: React.FC = () => {
  const [modalType, setModalType] = useState<'single' | 'bulk' | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const [data, setData] = useState<StoreItem[]>([
    { id: '1', title: 'Noodles 20X45g', brand: 'Indomie', unit: 'Carton', amountNaira: 5000, amountPoints: 50, status: 'active', date: '01/10/2025' },
  ]);

  // Single item form state
  const [itemName, setItemName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [unit, setUnit] = useState('');
  const [amountNaira, setAmountNaira] = useState('');
  const [amountPoints, setAmountPoints] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const isSingleFormValid = itemName.trim() && brandName.trim() && unit.trim() && amountNaira.trim() && amountPoints.trim();

  const resetSingleForm = () => {
    setItemName(''); setBrandName(''); setUnit('');
    setAmountNaira(''); setAmountPoints(''); setImagePreview('');
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSingleFormValid) return;
    setData(prev => [...prev, {
      id: Date.now().toString(),
      title: itemName,
      brand: brandName,
      unit,
      amountNaira: Number(amountNaira),
      amountPoints: Number(amountPoints),
      status: 'active',
      date: new Date().toLocaleDateString('en-GB'),
    }]);
    resetSingleForm();
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
    { title: 'Amount (₦)', dataIndex: 'amountNaira', key: 'amountNaira', render: (v) => `₦${v.toLocaleString()}` },
    { title: 'Points', dataIndex: 'amountPoints', key: 'amountPoints', render: (v) => `${v}PT` },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      render: (status) => (
        <span className={`statusBadge ${status === 'active' ? 'statusBadge--active' : ''}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'View Item' },
              { key: 'edit', label: 'Edit Item' },
              { key: 'deactivate', label: 'Deactivate' },
              { key: 'delete', label: 'Delete Item', danger: true },
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
        showingValue="All Items"
        action={{
          label: "Add New Item",
          dropdownItems: [
            { key: 'single', label: 'Single Item', onClick: () => setModalType('single') },
            { key: 'bulk', label: 'Bulk Upload', onClick: () => { setHasFile(false); setModalType('bulk'); } },
          ],
        }}
      />

      <section className="cardSection" style={{ padding: 0, overflow: 'hidden', minHeight: 400 }}>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="secondaryButton">Search title</button>
            <button className="secondaryButton">Date</button>
            <button className="adminActionBtn" style={{ padding: '0 24px' }}>Apply</button>
          </div>
          <button className="secondaryButton">Export</button>
        </div>
        {data.length > 0 ? (
          <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} className="dataTable" />
        ) : (
          <EmptyState
            title="No Items yet"
            description="Items added to the store will show here"
            action={{ label: "Add New Item", onClick: () => setModalType('single') }}
          />
        )}
      </section>

      {/* Add Single Item Modal */}
      <Modal
        open={modalType === 'single'}
        onCancel={() => { resetSingleForm(); setModalType(null); }}
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
              <div className="modalHeader__title">Add New Item</div>
            </div>
            <button className="modalHeader__close" type="button" onClick={() => { resetSingleForm(); setModalType(null); }} aria-label="Close">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#667085" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="modalHeader__desc">Share the item details you would like to list below.</div>
        </header>

        <form className="modalBody" onSubmit={handleSingleSubmit} noValidate>
          <div className="fieldGroup">
            <label className="field">
              <span className="field__label">Upload Image (Optional)</span>
              <div
                onClick={() => setImagePreview('https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80&w=150&h=150')}
                style={{ width: 80, height: 80, border: '1px solid #EAECF0', borderRadius: 8, display: 'grid', placeItems: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#475467" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div style={{ position: 'absolute', bottom: -8, right: -8, width: 24, height: 24, background: 'white', border: '1px solid #EAECF0', borderRadius: '50%', display: 'grid', placeItems: 'center', zIndex: 2 }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M12 5v14m-7-7h14" stroke="#475467" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
              </div>
            </label>

            <label className="field">
              <span className="field__label">Item Name</span>
              <input className="field__input" name="itemName" placeholder="e.g Noodles 20X45g" required value={itemName} onChange={e => setItemName(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Brand Name</span>
              <input className="field__input" name="brandName" placeholder="e.g Indomie" required value={brandName} onChange={e => setBrandName(e.target.value)} />
            </label>
            <label className="field">
              <span className="field__label">Unit of Measurement</span>
              <div className="field__inputWrap">
                <select className="field__input" name="unit" required style={{ appearance: 'none' }} value={unit} onChange={e => setUnit(e.target.value)}>
                  <option value="" disabled>Select an option</option>
                  <option value="Carton">Carton</option>
                  <option value="Pack">Pack</option>
                  <option value="Pieces">Pieces</option>
                </select>
                <span className="field__icon" style={{ pointerEvents: 'none' }} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </label>
            <label className="field">
              <span className="field__label">Item Description (Optional)</span>
              <input className="field__input" name="itemDesc" placeholder="e.g A product of Dufil Prima Foods" />
            </label>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
              <label className="field" style={{ flex: 1 }}>
                <span className="field__label">Amount In Naira</span>
                <input className="field__input" name="amountNaira" placeholder="e.g 200" type="number" required value={amountNaira} onChange={e => setAmountNaira(e.target.value)} />
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '1px solid #EAECF0', marginTop: 24 }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4-4m-4 4l4 4" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <label className="field" style={{ flex: 1 }}>
                <span className="field__label">Amount In Points</span>
                <div className="field__inputWrap">
                  <input className="field__input" name="amountPoints" placeholder="0" type="number" required style={{ background: '#F9FAFB' }} value={amountPoints} onChange={e => setAmountPoints(e.target.value)} />
                  <span className="field__icon" style={{ fontSize: 14, fontWeight: 500, color: '#475467', right: 16, width: 'auto' }}>PT</span>
                </div>
              </label>
            </div>
          </div>

          <div className="modalActions" style={{ justifyContent: 'center', gap: 12, marginTop: 24 }}>
            <button className="secondaryButton" type="button" style={{ flex: 1 }} onClick={() => { resetSingleForm(); setModalType(null); }}>Cancel</button>
            <button className="authButton" type="submit" disabled={!isSingleFormValid} style={{ flex: 1 }}>Submit</button>
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

export default StorePage;
