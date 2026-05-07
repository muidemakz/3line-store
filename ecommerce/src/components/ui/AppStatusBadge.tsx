import { Tag } from 'antd';
import type { TagProps } from 'antd';
import type { ReactNode } from 'react';

export type AppStatus = 'active' | 'pending' | 'ended' | 'draft' | 'success' | 'warning' | 'error' | 'default';

const statusColor: Record<AppStatus, TagProps['color']> = {
  active: 'success',
  pending: 'warning',
  ended: 'default',
  draft: 'default',
  success: 'success',
  warning: 'warning',
  error: 'error',
  default: 'default'
};

interface AppStatusBadgeProps {
  status: AppStatus;
  children: ReactNode;
}

export function AppStatusBadge({ status, children }: AppStatusBadgeProps) {
  return (
    <Tag color={statusColor[status]} style={{ borderRadius: 6, fontWeight: 600 }}>
      {children}
    </Tag>
  );
}
