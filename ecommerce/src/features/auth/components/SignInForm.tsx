import { Form } from 'antd';
import type { Rule } from 'antd/es/form';
import type { ReactNode } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppInput } from '@/components/ui/AppInput';
import { AppTypography } from '@/components/ui/AppTypography';
import { useSignInMutation } from '@/features/auth/hooks/useSignInMutation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { SignInPayload } from '@/features/auth/types/auth.types';

const emailRules: Rule[] = [
  { required: true, message: 'Official email is required' },
  { type: 'email', message: 'Enter a valid email address' }
];

const passwordRules: Rule[] = [{ required: true, message: 'Password is required' }];

function passwordToggle(
  isPasswordVisible: boolean,
  setPasswordVisible: (visible: boolean) => void
): ReactNode {
  return (
    <button
      type="button"
      className="auth-password-toggle"
      onClick={() => setPasswordVisible(!isPasswordVisible)}
    >
      {isPasswordVisible ? 'Hide' : 'Show'}
    </button>
  );
}

export function SignInForm() {
  const [form] = Form.useForm<SignInPayload>();
  const { mutate, isPending, error } = useSignInMutation();
  const { rememberMe, isPasswordVisible, setRememberMe, setPasswordVisible } = useAuthStore();
  const emailValue = Form.useWatch('email', form);
  const passwordValue = Form.useWatch('password', form);

  const passwordError = error?.response?.data?.message ?? error?.message;
  const canSubmit = !!emailValue?.trim() && !!passwordValue?.trim();

  const handleSubmit = (values: Omit<SignInPayload, 'rememberMe'>) => {
    mutate({
      ...values,
      rememberMe
    });
  };

  return (
    <AppCard className="auth-card">
      <div className="auth-card__inner">
        <AppTypography variant="h3">Sign in</AppTypography>

        <Form
          form={form}
          layout="vertical"
          className="auth-form"
          requiredMark={false}
          initialValues={{
            email: '',
            password: ''
          }}
          onFinish={handleSubmit}
        >
          <Form.Item<SignInPayload> label="Official Email" name="email" rules={emailRules}>
            <AppInput placeholder="Enter your official email" />
          </Form.Item>

          <Form.Item<SignInPayload>
            label="Password"
            name="password"
            rules={passwordRules}
            validateStatus={passwordError ? 'error' : undefined}
            help={passwordError}
          >
            <AppInput.Password
              placeholder="Enter your password"
              visibilityToggle={false}
              type={isPasswordVisible ? 'text' : 'password'}
              iconRender={() => null}
              suffix={passwordToggle(isPasswordVisible, setPasswordVisible)}
            />
          </Form.Item>

          <div className="auth-form__meta">
            <AppCheckbox
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            >
              Remember me
            </AppCheckbox>
            <a className="auth-link" href="/forgot-password">
              Forgot Password?
            </a>
          </div>

          <Form.Item className="auth-form__submit">
            <AppButton htmlType="submit" block disabled={!canSubmit} loading={isPending}>
              Sign In
            </AppButton>
          </Form.Item>
        </Form>
      </div>
    </AppCard>
  );
}
