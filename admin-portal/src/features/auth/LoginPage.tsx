import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button } from 'antd';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Login Success:', values);
    // Simulate login
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="authBody" style={{ 
      minHeight: '100vh', 
      background: 'var(--bg)', 
      display: 'grid', 
      placeItems: 'center',
      padding: '16px'
    }}>
      <main className="authPage" style={{ width: '100%', maxWidth: '507px' }}>
        <section className="authCard" style={{
          background: 'var(--white)',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '-16px 16px 1px rgba(0, 1, 44, 0.03)'
        }}>
          <div className="authForm" style={{
            maxWidth: '427px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}>
            <header className="authHeader" style={{ textAlign: 'center' }}>
              <h1 className="authTitle" style={{
                fontFamily: 'var(--font-title)',
                fontSize: '30px',
                fontWeight: 700,
                color: 'var(--text-900)',
                margin: 0
              }}>Sign in</h1>
            </header>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="authFields authFields--compact"
              style={{ width: '100%' }}
            >
              <Form.Item
                label={<span className="field__label">Email</span>}
                name="email"
                rules={[{ required: true, message: 'Please input your email!' }, { type: 'email' }]}
              >
                <Input placeholder="e.g. name@example.com" className="field__input" />
              </Form.Item>

              <Form.Item
                label={<span className="field__label">Password</span>}
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Input.Password placeholder="Enter Password Here" className="field__input" />
                  <a className="authInlineLink" href="#" style={{
                    alignSelf: 'flex-end',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    textDecoration: 'underline'
                  }}>Forgot Password?</a>
                </div>
              </Form.Item>

              <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  className="adminActionBtn"
                  style={{ width: '100%', height: '48px', justifyContent: 'center' }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </div>
        </section>

        <footer className="authFooter" style={{ marginTop: '32px', textAlign: 'center' }}>
          <small className="authFooter__copy" style={{ color: 'var(--text-400)', fontSize: '14px' }}>
            Copyright &copy; 2026 3Line Store
          </small>
        </footer>
      </main>
    </div>
  );
};

export default LoginPage;
