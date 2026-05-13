import React, { useState, useEffect } from 'react';
import { Modal, Button, message as antMessage } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/axios';
import FieldInput from '@/components/common/FieldInput';

interface PointConfigModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── API helpers ──────────────────────────────────────────
const fetchPointConfig = async (): Promise<number> => {
  const res = await axiosInstance.get('/settings/point-config');
  return res.data.data?.nairaPerPoint ?? 500;
};

const savePointConfig = async (nairaPerPoint: number): Promise<number> => {
  const res = await axiosInstance.put('/settings/point-config', { nairaPerPoint });
  return res.data.data?.nairaPerPoint;
};

const PointConfigModal: React.FC<PointConfigModalProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [naira, setNaira] = useState<number | string>('');
  const [points, setPoints] = useState<number | string>(1);

  const { data: currentRate, isLoading } = useQuery({
    queryKey: ['point-config'],
    queryFn: fetchPointConfig,
    staleTime: 60_000,
  });

  // Populate fields when modal opens with current rate
  useEffect(() => {
    if (open && currentRate != null) {
      // Show rate as "₦X = 1PT"
      setNaira(currentRate);
      setPoints(1);
    }
  }, [open, currentRate]);

  const mutation = useMutation({
    mutationFn: savePointConfig,
    onSuccess: (newRate) => {
      queryClient.setQueryData(['point-config'], newRate);
      queryClient.invalidateQueries({ queryKey: ['point-config'] });
      antMessage.success('Point configuration updated successfully');
      onClose();
    },
    onError: (err: any) => {
      antMessage.error(err?.response?.data?.message ?? 'Failed to save point configuration');
    },
  });

  const handleSubmit = () => {
    const n = Number(naira);
    const p = Number(points);
    if (!n || n <= 0 || !p || p <= 0) {
      antMessage.error('Both values must be greater than 0');
      return;
    }
    // Convert to naira-per-1-point ratio
    const rate = n / p;
    mutation.mutate(rate);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, backgroundColor: 'var(--gray-50)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-900)' }}>Point Configuration</div>
            <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-600)' }}>Set the rate for your desired point value.</div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
      styles={{ body: { padding: '24px 0 0' } }}
    >
      {isLoading ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-400)' }}>Loading…</div>
      ) : (
        <div style={{ marginTop: 24, padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', alignItems: 'center', gap: 8 }}>
            <div>
              <label className="field__label" style={{ display: 'block', marginBottom: 6 }}>Amount In Naira</label>
              <FieldInput
                type="number"
                placeholder="e.g. 500"
                min={1}
                value={naira}
                onChange={e => setNaira(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" /><path d="M4 20L21 3" />
                <path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" />
              </svg>
            </div>

            <div>
              <label className="field__label" style={{ display: 'block', marginBottom: 6 }}>Amount In Points</label>
              <FieldInput
                type="number"
                placeholder="1"
                min={1}
                value={points}
                rightElement="PT"
                onChange={e => setPoints(e.target.value)}
              />
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--gray-50)',
            padding: '12px 16px',
            borderRadius: 8,
            textAlign: 'center',
            marginTop: 16,
            marginBottom: 32,
            border: '1px solid var(--gray-100)',
          }}>
            <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 14 }}>
              Every ₦{naira || '—'} is equivalent to {points || '—'} PT
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              onClick={onClose}
              className="secondaryButton"
              style={{ flex: 1, height: 44, borderRadius: 8, fontWeight: 600, justifyContent: 'center' }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={mutation.isPending}
              className="adminActionBtn"
              style={{ flex: 1, height: 44, borderRadius: 8, fontWeight: 600, justifyContent: 'center' }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PointConfigModal;
