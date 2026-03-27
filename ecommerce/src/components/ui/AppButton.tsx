import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export type AppButtonVariant = 'primary' | 'secondary' | 'text' | 'danger' | 'icon';

interface AppButtonProps extends Omit<ButtonProps, 'type' | 'variant'> {
  variant?: AppButtonVariant;
}

const variantMap: Record<AppButtonVariant, Pick<ButtonProps, 'type' | 'danger' | 'shape'>> = {
  primary: { type: 'primary' },
  secondary: { type: 'default' },
  text: { type: 'text' },
  danger: { type: 'primary', danger: true },
  icon: { type: 'default', shape: 'circle' }
};

export function AppButton({ variant = 'primary', children, ...props }: AppButtonProps) {
  const mappedProps = variantMap[variant];

  return (
    <Button {...mappedProps} {...props}>
      {children}
    </Button>
  );
}
