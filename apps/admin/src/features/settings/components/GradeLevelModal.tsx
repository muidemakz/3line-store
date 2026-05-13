import React, { useState, useEffect } from 'react';
import { Modal, Button, message as antMessage } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/shared/api/axios';
import FieldInput from '@/components/common/FieldInput';

interface GradeLevel {
  id: string;
  name: string;
  defaultPoints: number;
}

interface LocalGrade {
  id: string;           // real DB id or temp "new-<ts>" for unsaved rows
  name: string;
  defaultPoints: number;
  isNew?: boolean;      // true = not yet persisted
  isDirty?: boolean;    // true = modified but not yet saved
}

interface GradeLevelModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── API helpers ──────────────────────────────────────────
const api = {
  list: (): Promise<GradeLevel[]> =>
    axiosInstance.get('/grade-levels').then(r => r.data.data ?? []),
  create: (data: { name: string; defaultPoints: number }) =>
    axiosInstance.post('/grade-levels', data).then(r => r.data.data),
  update: (id: string, data: { name?: string; defaultPoints?: number }) =>
    axiosInstance.patch(`/grade-levels/${id}`, data).then(r => r.data.data),
  remove: (id: string) =>
    axiosInstance.delete(`/grade-levels/${id}`),
};

const GradeLevelModal: React.FC<GradeLevelModalProps> = ({ open, onClose }) => {
  const queryClient = useQueryClient();
  const [localGrades, setLocalGrades] = useState<LocalGrade[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['grade-levels'],
    queryFn: api.list,
    staleTime: 60_000,
  });

  // Sync remote grades into local state when modal opens
  useEffect(() => {
    if (open) {
      if (grades.length > 0) {
        setLocalGrades(grades.map(g => ({ ...g, isNew: false, isDirty: false })));
      } else if (!isLoading) {
        setLocalGrades([{ id: `new-${Date.now()}`, name: '', defaultPoints: 0, isNew: true }]);
      }
    }
  }, [open, grades, isLoading]);

  const addRow = () => {
    setLocalGrades(prev => [
      ...prev,
      { id: `new-${Date.now()}`, name: '', defaultPoints: 0, isNew: true },
    ]);
  };

  const removeRow = (id: string) => {
    if (localGrades.length > 1) {
      setLocalGrades(prev => prev.filter(g => g.id !== id));
    }
  };

  const updateRow = (id: string, field: 'name' | 'defaultPoints', value: string | number) => {
    setLocalGrades(prev =>
      prev.map(g => g.id === id ? { ...g, [field]: value, isDirty: true } : g)
    );
  };

  const handleSubmit = async () => {
    if (localGrades.some(g => !g.name.trim() || g.defaultPoints < 0)) {
      antMessage.error('Please fill in all grade names and set valid point values');
      return;
    }

    setSaving(true);
    try {
      // Find which existing DB grades were removed
      const currentIds = new Set(localGrades.filter(g => !g.isNew).map(g => g.id));
      const deletedIds = grades.filter(g => !currentIds.has(g.id)).map(g => g.id);

      await Promise.all([
        // Delete removed grades
        ...deletedIds.map(id => api.remove(id)),

        // Create new grades
        ...localGrades
          .filter(g => g.isNew)
          .map(g => api.create({ name: g.name.trim(), defaultPoints: Number(g.defaultPoints) })),

        // Update modified existing grades
        ...localGrades
          .filter(g => !g.isNew && g.isDirty)
          .map(g => api.update(g.id, { name: g.name.trim(), defaultPoints: Number(g.defaultPoints) })),
      ]);

      await queryClient.invalidateQueries({ queryKey: ['grade-levels'] });
      antMessage.success('Grade levels saved');
      onClose();
    } catch (err: any) {
      antMessage.error(err?.response?.data?.message ?? 'Failed to save grade levels');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, backgroundColor: 'var(--gray-50)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l10 7-10 7L2 10l10-7z" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 14l10 7 10-7" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-900)' }}>Grade Level Configuration</div>
            <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-600)' }}>Set up grade levels and their point allocations.</div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      styles={{ body: { padding: '24px 0 0' } }}
    >
      {isLoading ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-400)' }}>Loading…</div>
      ) : (
        <>
          <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 8 }}>
            {localGrades.map((grade, index) => (
              <div
                key={grade.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 40px',
                  gap: 16,
                  alignItems: 'end',
                  marginBottom: index === localGrades.length - 1 ? 24 : 16,
                }}
              >
                <div>
                  {index === 0 && (
                    <label className="field__label">Grade Label <span style={{ color: 'var(--danger)' }}>*</span></label>
                  )}
                  <FieldInput
                    value={grade.name}
                    onChange={e => updateRow(grade.id, 'name', e.target.value)}
                    placeholder="e.g. Grade A"
                  />
                </div>
                <div>
                  {index === 0 && (
                    <label className="field__label">Points <span style={{ color: 'var(--danger)' }}>*</span></label>
                  )}
                  <FieldInput
                    type="number"
                    value={grade.defaultPoints}
                    onChange={e => updateRow(grade.id, 'defaultPoints', Number(e.target.value))}
                    placeholder="0"
                    min={0}
                    rightElement="PT"
                  />
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={localGrades.length <= 1}
                  onClick={() => removeRow(grade.id)}
                  style={{ height: 44, padding: 0 }}
                />
              </div>
            ))}

            <Button
              type="dashed"
              onClick={addRow}
              block
              icon={<PlusOutlined />}
              style={{ height: 44, borderRadius: 8, color: 'var(--accent)', borderColor: 'var(--accent)' }}
            >
              Add New Grade Level
            </Button>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
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
              loading={saving}
              className="adminActionBtn"
              style={{ flex: 1, height: 44, borderRadius: 8, fontWeight: 600, justifyContent: 'center' }}
            >
              Save Changes
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default GradeLevelModal;
