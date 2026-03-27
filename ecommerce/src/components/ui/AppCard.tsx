import { Card, type CardProps } from 'antd';
import { spacing } from '@/theme/tokens/spacing';

export function AppCard(props: CardProps) {
  return (
    <Card
      styles={{
        body: {
          padding: spacing[6]
        }
      }}
      {...props}
    />
  );
}
