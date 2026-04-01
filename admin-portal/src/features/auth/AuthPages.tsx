import React from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log('Login values:', values);
    navigate('/dashboard');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'radial-gradient(circle at top, #ffffff 0%, #f8fafc 48%, #eef4ff 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0 }}>Sign in</Title>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. name@example.com" />
          </Form.Item>

          <Form.Item
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Password</span>
                <Link to="/forgot-password" style={{ fontSize: 13 }}>Forgot Password?</Link>
              </div>
            }
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Enter Password Here" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ height: 48, borderRadius: 8, marginTop: 16 }}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Copyright © 2026 3Line Store</Text>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {

  const onFinish = (values: any) => {
    console.log('Forgot password values:', values);
    // In a real app, send reset link
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'radial-gradient(circle at top, #ffffff 0%, #f8fafc 48%, #eef4ff 100%)'
    }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Forgot Password</Title>
          <Text type="secondary">Enter your email and we'll send you a link to reset your password.</Text>
        </div>

        <Form
          name="forgot-password"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
            style={{ marginBottom: 32 }}
          >
            <Input prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="e.g. name@example.com" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block style={{ height: 48, borderRadius: 8 }}>
              Send Reset Link
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: 14 }}>Back to Login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};
