import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, message as antMessage } from 'antd';
import { useDataStore } from '@/shared/store/data.store';
import FieldInput from '@/components/common/FieldInput';

interface PointConfigModalProps {
  open: boolean;
  onClose: () => void;
}

const PointConfigModal: React.FC<PointConfigModalProps> = ({ open, onClose }) => {
  const { settings, updateSettings } = useDataStore();
  const [form] = Form.useForm();
  const [naira, setNaira] = useState(settings.nairaPerPoint);
  const [points, setPoints] = useState(1);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        naira: settings.nairaPerPoint,
        points: 1
      });
      setNaira(settings.nairaPerPoint);
      setPoints(1);
    }
  }, [open, settings.nairaPerPoint, form]);

  const handleSubmit = (values: { naira: number; points: number }) => {
    const nairaPerPt = values.naira / values.points;
    updateSettings({ nairaPerPoint: nairaPerPt });
    antMessage.success('Point configuration updated successfully');
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, backgroundColor: 'var(--gray-50)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
      styles={{
        body: { padding: '24px 0 0' }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changed) => {
          if (changed.naira !== undefined) setNaira(changed.naira);
          if (changed.points !== undefined) setPoints(changed.points);
        }}
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 48px 1fr', alignItems: 'center', gap: 8 }}>
          <Form.Item
            label={<span style={{ color: 'var(--text-900)' }}>Amount In Naira</span>}
            name="naira"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 1, message: 'Must be at least 1', transform: (v) => Number(v) },
            ]}
          >
            <FieldInput type="number" placeholder="200" min={1} />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5"></path>
              <path d="M4 20L21 3"></path>
              <path d="M21 16v5h-5"></path>
              <path d="M15 15l6 6"></path>
              <path d="M4 4l5 5"></path>
            </svg>
          </div>

          <Form.Item
            label={<span style={{ color: 'var(--text-900)' }}>Amount In points</span>}
            name="points"
            rules={[
              { required: true, message: 'Required' },
              { type: 'number', min: 1, message: 'Must be at least 1', transform: (v) => Number(v) },
            ]}
          >
            <FieldInput type="number" placeholder="1" min={1} rightElement="PT" />
          </Form.Item>
        </div>

        <div style={{ 
          backgroundColor: 'var(--gray-50)', 
          padding: '12px 16px', 
          borderRadius: 8, 
          textAlign: 'center',
          marginBottom: 32,
          border: '1px solid var(--gray-100)'
        }}>
          <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 14 }}>
            Every ₦{naira || '-'} is equivalent to {points || '-'}PT
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
            htmlType="submit"
            className="adminActionBtn"
            style={{ flex: 1, height: 44, borderRadius: 8, fontWeight: 600, justifyContent: 'center' }}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PointConfigModal;
