import React, { useState, useMemo } from 'react';
import { Modal, Button, Badge, Space, Divider, message as antMessage } from 'antd';
import { PlusOutlined, MinusOutlined, DeleteOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { useDataStore } from '@/shared/store/data.store';
import type { UserItem, StoreItem } from '@/shared/store/data.store';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { matchesSearch } from '@/shared/hooks/useSearch';
import FieldInput from '@/components/common/FieldInput';

interface AddOrderModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ open, onClose, sessionId }) => {
  const { users, items, addOrder } = useDataStore();
  const [step, setStep] = useState(1);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [cart, setCart] = useState<{ item: StoreItem; qty: number }[]>([]);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.status === 'active' &&
      (matchesSearch(u.name, debouncedSearch) || matchesSearch(u.email, debouncedSearch))
    );
  }, [users, debouncedSearch]);

  const filteredItems = useMemo(() => {
    return items.filter(i =>
      i.status === 'active' &&
      (matchesSearch(i.title, debouncedSearch) || matchesSearch(i.brand, debouncedSearch))
    );
  }, [items, debouncedSearch]);

  const cartTotalPoints = useMemo(() => {
    return cart.reduce((sum, entry) => sum + (entry.item.amountPoints * entry.qty), 0);
  }, [cart]);

  const handleAddToCart = (item: StoreItem) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { item, qty: 1 }]);
    }
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.item.id === itemId) {
        const newQty = Math.max(1, c.qty + delta);
        return { ...c, qty: newQty };
      }
      return c;
    }));
  };

  const removeItem = (itemId: string) => {
    setCart(cart.filter(c => c.item.id !== itemId));
  };

  const handleNext = () => {
    if (step === 1 && !selectedUser) {
      antMessage.warning('Please select a user first');
      return;
    }
    if (step === 2 && cart.length === 0) {
      antMessage.warning('Please add at least one item to cart');
      return;
    }
    setSearchText('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleCheckout = () => {
    if (!selectedUser) return;
    try {
      addOrder({
        sessionId,
        userId: selectedUser.id,
        items: cart.map(c => ({
          itemId: c.item.id,
          qty: c.qty,
          points: c.item.amountPoints,
        })),
        totalPoints: cartTotalPoints,
        status: 'pending',
      });
      antMessage.success('Order created successfully');
      resetAndClose();
    } catch (err) {
      antMessage.error(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedUser(null);
    setCart([]);
    setSearchText('');
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="modalBody" style={{ padding: '0 24px 24px' }}>
            <div style={{ marginBottom: 20 }}>
              <FieldInput
                size="small"
                leftIcon={
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                }
                placeholder="Search users by name or email"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredUsers.map(u => (
                <div 
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  style={{ 
                    padding: 16, 
                    borderRadius: 12, 
                    border: `2px solid ${selectedUser?.id === u.id ? 'var(--accent)' : 'var(--gray-200)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: selectedUser?.id === u.id ? 'var(--gray-100)' : 'var(--white)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gray-200)', display: 'grid', placeItems: 'center' }}>
                    <UserOutlined style={{ color: 'var(--gray-500)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-900)' }}>{u.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-400)' }}>{u.email} • {u.gradeLevel}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-400)' }}>Points Balance</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{u.points} PT</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="modalBody" style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <FieldInput
                size="small"
                leftIcon={
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                  </svg>
                }
                placeholder="Search items..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
              <Badge count={cart.length}>
                <Button icon={<ShoppingCartOutlined />} onClick={() => setStep(3)}>Review Cart</Button>
              </Badge>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {filteredItems.map(item => {
                const inCart = cart.find(c => c.item.id === item.id);
                return (
                  <div key={item.id} style={{ padding: 12, borderRadius: 12, border: '1px solid var(--gray-200)', background: 'var(--white)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-400)' }}>{item.brand} • {item.unit}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.amountPoints} PT</div>
                      <Button size="small" type={inCart ? 'primary' : 'default'} icon={<PlusOutlined />} onClick={() => handleAddToCart(item)}>
                        {inCart ? `Add (${inCart.qty})` : 'Add'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="modalBody" style={{ padding: '0 24px 24px' }}>
            <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)', padding: 16, borderRadius: 12, marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-400)' }}>Ordering for:</div>
                <div style={{ fontWeight: 600 }}>{selectedUser?.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: 'var(--text-400)' }}>Available Points:</div>
                <div style={{ fontWeight: 600, color: cartTotalPoints > (selectedUser?.points || 0) ? 'var(--danger)' : 'var(--accent)' }}>
                  {selectedUser?.points} PT
                </div>
              </div>
            </div>
            
            <div style={{ maxHeight: 350, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map(entry => (
                <div key={entry.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{entry.item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-400)' }}>{entry.item.amountPoints} PT per unit</div>
                  </div>
                  <Space size="large" align="center">
                    <Space>
                      <Button size="small" icon={<MinusOutlined />} onClick={() => updateQty(entry.item.id, -1)} />
                      <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{entry.qty}</span>
                      <Button size="small" icon={<PlusOutlined />} onClick={() => updateQty(entry.item.id, 1)} />
                    </Space>
                    <div style={{ width: 80, textAlign: 'right', fontWeight: 700 }}>{entry.item.amountPoints * entry.qty} PT</div>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(entry.item.id)} />
                  </Space>
                </div>
              ))}
            </div>

            <Divider />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Total Points Required</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: cartTotalPoints > (selectedUser?.points || 0) ? 'var(--danger)' : 'var(--accent)' }}>
                {cartTotalPoints} PT
              </div>
            </div>
            
            {cartTotalPoints > (selectedUser?.points || 0) && (
              <div className="confirmIconWrap" style={{ width: '100%', height: 'auto', padding: 8, borderRadius: 8, marginTop: 12, display: 'flex', justifyContent: 'center', border: '1px solid rgba(217, 45, 32, 0.2)' }}>
                <span style={{ color: 'var(--danger)', fontSize: 13 }}>Warning: Total points exceed user balance!</span>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 1: return 'Select User';
      case 2: return 'Add Items to Cart';
      case 3: return 'Review Order';
      default: return '';
    }
  };

  return (
    <Modal
      open={open}
      onCancel={resetAndClose}
      footer={null}
      closable={false}
      width={step === 2 ? 600 : 480}
      styles={{ body: { padding: 0 } }}
    >
      <header className="modalHeader">
        <div className="modalHeader__titleRow">
          <span className="modalHeader__icon">
            <ShoppingCartOutlined style={{ fontSize: 20, color: 'var(--gray-500)' }} />
          </span>
          <div className="modalHeader__titles">
            <div className="modalHeader__title">{getTitle()}</div>
            <div className="modalHeader__desc">Step {step} of 3</div>
          </div>
          <button className="modalHeader__close" onClick={resetAndClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className="icon--dark-optimized">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {renderStep()}

      <div className="modalActions" style={{ padding: '0 24px 24px', justifyContent: 'center', gap: 12 }}>
        {step > 1 && (
          <button className="secondaryButton" style={{ flex: 1 }} onClick={handleBack}>Back</button>
        )}
        {step < 3 ? (
          <button className="authButton" style={{ flex: 1 }} onClick={handleNext}>Next</button>
        ) : (
          <button 
            className="authButton" 
            style={{ flex: 1 }} 
            onClick={handleCheckout}
            disabled={cartTotalPoints > (selectedUser?.points || 0) || cart.length === 0}
          >
            Confirm & Checkout
          </button>
        )}
      </div>
    </Modal>
  );
};

export default AddOrderModal;
