import { Typography } from 'antd';
import type { CSSProperties, ReactNode } from 'react';
import { typography, type TypographyVariant } from '@/theme/tokens/typography';

interface AppTypographyProps {
  variant?: TypographyVariant;
  color?: CSSProperties['color'];
  children: ReactNode;
}

export function AppTypography({ variant = 'body', color, children }: AppTypographyProps) {
  const token = typography[variant];
  const style: CSSProperties = {
    margin: 0,
    color,
    fontSize: token.fontSize,
    lineHeight: `${token.lineHeight}px`,
    fontWeight: token.fontWeight,
    letterSpacing: token.letterSpacing
  };

  if (variant === 'body' || variant === 'bodySmall') {
    return <Typography.Paragraph style={style}>{children}</Typography.Paragraph>;
  }

  if (variant === 'caption' || variant === 'label') {
    return <Typography.Text style={style}>{children}</Typography.Text>;
  }

  return (
    <Typography.Title level={5} style={style}>
      {children}
    </Typography.Title>
  );
}
