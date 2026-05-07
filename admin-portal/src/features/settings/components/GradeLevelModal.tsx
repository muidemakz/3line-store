import React, { useState, useEffect } from 'react';
import { Modal, Button, message as antMessage } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDataStore } from '@/shared/store/data.store';
import type { GradeLevel } from '@/shared/store/data.store';
import FieldInput from '@/components/common/FieldInput';

interface GradeLevelModalProps {
  open: boolean;
  onClose: () => void;
}

const GradeLevelModal: React.FC<GradeLevelModalProps> = ({ open, onClose }) => {
  const { gradeLevels, setGradeLevels } = useDataStore();
  const [localGrades, setLocalGrades] = useState<GradeLevel[]>([]);

  useEffect(() => {
    if (open) {
      if (gradeLevels.length > 0) {
        setLocalGrades([...gradeLevels]);
      } else {
        setLocalGrades([{ id: Date.now().toString(), name: 'Level 1', points: 8 }]);
      }
    }
  }, [open, gradeLevels]);

  const addGrade = () => {
    setLocalGrades([...localGrades, { 
      id: Date.now().toString(), 
      name: `Level ${localGrades.length + 1}`, 
      points: 0 
    }]);
  };

  const removeGrade = (id: string) => {
    if (localGrades.length > 1) {
      setLocalGrades(localGrades.filter(g => g.id !== id));
    }
  };

  const updateGrade = (id: string, field: keyof GradeLevel, value: string | number) => {
    setLocalGrades(localGrades.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  const handleSubmit = () => {
    // Validate
    if (localGrades.some(g => !g.name || g.points <= 0)) {
      antMessage.error('Please fill all grade names and valid points');
      return;
    }
    setGradeLevels(localGrades);
    antMessage.success('Grade level configuration updated');
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, backgroundColor: 'var(--gray-50)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3l10 7-10 7L2 10l10-7z" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 14l10 7 10-7" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-900)' }}>Grade Level Configuration</div>
            <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-600)' }}>Set up the grade levels and assigned points.</div>
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      styles={{
        body: { padding: '24px 0 0' }
      }}
    >
      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 8 }}>
        {localGrades.map((grade, index) => (
          <div 
            key={grade.id} 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 40px', 
              gap: 16, 
              alignItems: 'end',
              marginBottom: index === localGrades.length - 1 ? 24 : 16
            }}
          >
            <div>
              {index === 0 && <label className="field__label">Grade Label <span style={{ color: 'var(--danger)' }}>*</span></label>}
              <FieldInput
                value={grade.name}
                onChange={e => updateGrade(grade.id, 'name', e.target.value)}
                placeholder="Level 1"
              />
            </div>
            <div>
              {index === 0 && <label className="field__label">Points <span style={{ color: 'var(--danger)' }}>*</span></label>}
              <FieldInput
                type="number"
                value={grade.points}
                onChange={e => updateGrade(grade.id, 'points', Number(e.target.value))}
                placeholder="0"
                min={1}
                rightElement="PT"
              />
            </div>
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={localGrades.length <= 1}
              onClick={() => removeGrade(grade.id)}
              style={{ height: 44, padding: 0 }}
            />
          </div>
        ))}

        <Button 
          type="dashed" 
          onClick={addGrade} 
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
          className="adminActionBtn"
          style={{ flex: 1, height: 44, borderRadius: 8, fontWeight: 600, justifyContent: 'center' }}
        >
          Submit
        </Button>
      </div>
    </Modal>
  );
};

export default GradeLevelModal;
