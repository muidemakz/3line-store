import type { Rule } from 'antd/es/form';
import { isAxiosError } from 'axios';
import type { ReactNode } from 'react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppCheckbox } from '@/components/ui/AppCheckbox';
import { AppForm } from '@/components/ui/AppForm';
import { AppInput } from '@/components/ui/AppInput';
import { AppTypography } from '@/components/ui/AppTypography';
import { useSignInMutation } from '@/features/auth/hooks/useSignInMutation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { SignInPayload } from '@/features/auth/types/auth.types';
import { isDevAuthMockEnabled } from '@/shared/lib/devAuthMock';

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
  const authMock = isDevAuthMockEnabled();

  const emailRules: Rule[] = authMock
    ? [{ required: true, message: 'Enter your username or email' }]
    : [
        { required: true, message: 'Official email is required' },
        { type: 'email', message: 'Enter a valid email address' }
      ];

  const [form] = AppForm.useForm<SignInPayload>();
  const { mutate, isPending, error } = useSignInMutation();
  const { rememberMe, isPasswordVisible, setRememberMe, setPasswordVisible } = useAuthStore();
  const emailValue = AppForm.useWatch('email', form);
  const passwordValue = AppForm.useWatch('password', form);

  const passwordError = isAxiosError(error)
    ? error.response?.data?.message ?? error.message
    : error?.message;
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
        {authMock ? (
          <AppTypography variant="bodySmall" color="var(--app-text-secondary)">
            Local demo mode: first field is pre-filled with DummyJSON test user{' '}
            <strong>emilys</strong> / <strong>emilyspass</strong>. Set{' '}
            <code style={{ fontSize: 12 }}>VITE_API_BASE_URL</code> in{' '}
            <code style={{ fontSize: 12 }}>.env.local</code> to use your real API instead.
          </AppTypography>
        ) : null}

        <AppForm
          form={form}
          layout="vertical"
          className="auth-form"
          requiredMark={false}
          initialValues={{
            email: authMock ? 'emilys' : '',
            password: authMock ? 'emilyspass' : ''
          }}
          onFinish={handleSubmit}
        >
          <AppForm.Item<SignInPayload>
            label={authMock ? 'Username or email' : 'Official Email'}
            name="email"
            rules={emailRules}
          >
            <AppInput
              placeholder={authMock ? 'e.g. emilys' : 'Enter your official email'}
              autoComplete="username"
            />
          </AppForm.Item>

          <AppForm.Item<SignInPayload>
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
          </AppForm.Item>

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

          <AppForm.Item className="auth-form__submit">
            <AppButton htmlType="submit" block disabled={!canSubmit} loading={isPending}>
              Sign In
            </AppButton>
          </AppForm.Item>
        </AppForm>
      </div>
    </AppCard>
  );
}
