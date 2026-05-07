import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, InputNumber } from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useDataStore } from '@/shared/store/data.store';

interface GradeItem {
  level: string;
  points: string | number;
}

interface OnboardingModalProps {
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { updateSettings, setGradeLevels } = useDataStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [nairaPerPt, setNairaPerPt] = useState<number | string>('');
  const [grades, setGrades] = useState<GradeItem[]>([{ level: 'Level 1', points: '' }]);

  // Check if already completed
  useEffect(() => {
    const isComplete = localStorage.getItem('onboardingComplete');
    if (isComplete) {
      setIsVisible(false);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem('onboardingComplete', '1');
    setIsVisible(false);
    onComplete();
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (nairaPerPt) {
      updateSettings({ nairaPerPoint: Number(nairaPerPt) });
    }
    const validGrades = grades.filter(g => g.level && g.points);
    if (validGrades.length > 0) {
      setGradeLevels(validGrades.map((g, i) => ({
        id: (i + 1).toString(),
        name: g.level,
        points: Number(g.points),
      })));
    }
    localStorage.setItem('onboardingComplete', '1');
    setIsVisible(false);
    onComplete();
  };

  const renderProgress = () => (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          background: i === currentStep ? 'var(--accent)' : 'var(--gray-300)',
          transition: 'background 0.3s'
        }} />
      ))}
    </div>
  );

  const renderWelcome = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '100%', 
        height: 140, 
        background: 'var(--accent)', 
        borderRadius: 12, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 8,
        marginBottom: 24,
        position: 'relative',
        color: 'white'
      }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          borderRadius: '50%', 
          border: '1px solid rgba(255,255,255,0.3)', 
          display: 'grid', 
          placeItems: 'center' 
        }}>
          <InfoCircleOutlined style={{ fontSize: 24 }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>3LINE STORE</div>
      </div>
      
      <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-900)', marginBottom: 12 }}>Welcome to 3Line Store</h2>
      <p style={{ fontSize: 14, color: 'var(--text-600)', lineHeight: '1.6', marginBottom: 24 }}>
        Welcome to the 3Line Store! We're excited to help you get started. To make the setup process smoother, we encourage you to take a guided set up process.
      </p>

      {renderProgress()}

      <div style={{ display: 'flex', gap: 12 }}>
        <Button size="large" block className="secondaryButton" onClick={handleSkip} style={{ justifyContent: 'center' }}>Skip</Button>
        <Button size="large" block type="primary" className="adminActionBtn" onClick={handleNext} style={{ justifyContent: 'center' }}>Start Set Up</Button>
      </div>
    </div>
  );

  const renderPointConfig = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Step 1 of 2</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
          <ArrowLeftOutlined rotate={90} className="icon--dark-optimized" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-900)' }}>Point Configuration</h2>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-600)', marginBottom: 24 }}>Set the rate for your desired point value.</p>

      {renderProgress()}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label className="field__label">Amount in Naira</label>
          <InputNumber 
            style={{ width: '100%' }} 
            className="field__input" 
            placeholder="e.g 200" 
            value={nairaPerPt as number} 
            onChange={val => setNairaPerPt(val || '')} 
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className="field__label">Amount in Points</label>
          <div style={{ position: 'relative' }}>
            <Input disabled value="1" className="field__input" style={{ background: 'var(--gray-100)', border: '1px solid var(--gray-200)' }} />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: 'var(--text-400)' }}>PT</span>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--gray-50)', padding: '12px', borderRadius: 8, fontSize: 13, color: 'var(--text-600)', marginBottom: 24, border: '1px solid var(--gray-200)' }}>
        {nairaPerPt ? `Every ₦${Number(nairaPerPt).toLocaleString()} is equivalent to 1PT` : 'Enter an amount in Naira to see the conversion.'}
      </div>

      <Button 
        size="large" 
        block 
        type="primary" 
        className="adminActionBtn" 
        disabled={!nairaPerPt} 
        onClick={handleNext}
        style={{ justifyContent: 'center' }}
      >
        Next Step
      </Button>
    </div>
  );

  const renderGradeLevels = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>Step 2 of 2</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gray-100)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
          <MinusCircleOutlined rotate={90} className="icon--dark-optimized" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--text-900)' }}>Grade Level Configuration</h2>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-600)', marginBottom: 24 }}>Set up the grade levels and assigned points.</p>

      {renderProgress()}

      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16, paddingRight: 8 }}>
        {grades.map((grade, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              {idx === 0 && <label className="field__label">Grade Level <span style={{ color: 'var(--danger)' }}>*</span></label>}
              <Input 
                className="field__input"
                placeholder={`e.g. Level ${idx + 1}`} 
                value={grade.level} 
                onChange={e => {
                  const newGrades = [...grades];
                  newGrades[idx].level = e.target.value;
                  setGrades(newGrades);
                }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              {idx === 0 && <label className="field__label">Allocated Points <span style={{ color: 'var(--danger)' }}>*</span></label>}
              <div style={{ position: 'relative' }}>
                <InputNumber 
                  style={{ width: '100%' }} 
                  className="field__input"
                  placeholder="e.g. 3000" 
                  value={grade.points as number} 
                  onChange={val => {
                    const newGrades = [...grades];
                    newGrades[idx].points = val || '';
                    setGrades(newGrades);
                  }} 
                />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: 'var(--text-400)' }}>PT</span>
              </div>
            </div>
            <Button 
              type="text" 
              danger 
              icon={<MinusCircleOutlined />} 
              disabled={grades.length === 1}
              onClick={() => setGrades(grades.filter((_, i) => i !== idx))}
              style={{ padding: 4, height: 56 }}
            />
          </div>
        ))}
      </div>

      <Button 
        type="dashed" 
        block 
        icon={<PlusOutlined />} 
        onClick={() => setGrades([...grades, { level: '', points: '' }])}
        style={{ marginBottom: 24, height: 48, borderRadius: 8 }}
      >
        Add New Grade Level
      </Button>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button size="large" block className="secondaryButton" onClick={handleBack} style={{ justifyContent: 'center' }}>Back</Button>
        <Button size="large" block type="primary" className="adminActionBtn" onClick={handleSubmit} style={{ justifyContent: 'center' }}>Complete Setup</Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={isVisible}
        footer={null}
        closable={false}
        centered
        width={500}
        className="onboardingModal"
        styles={{ 
          mask: { backdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.4)' },
          body: { padding: 32 }
        }}
      >
        {currentStep === 0 && renderWelcome()}
        {currentStep === 1 && renderPointConfig()}
        {currentStep === 2 && renderGradeLevels()}
      </Modal>

      {/* Temporary Reset Trigger for testing purposes */}
      <div 
        style={{ position: 'fixed', bottom: 10, left: 10, opacity: 0.1, cursor: 'pointer', zIndex: 9999 }}
        onClick={() => {
          localStorage.removeItem('onboardingComplete');
          window.location.reload();
        }}
      >
        Reset Onboarding
      </div>
    </>
  );
};

export default OnboardingModal;
