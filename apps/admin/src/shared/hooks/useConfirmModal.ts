import { useState } from 'react';

interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

const CLOSED: ConfirmConfig & { isOpen: boolean } = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
};

export function useConfirmModal() {
  const [state, setState] = useState<ConfirmConfig & { isOpen: boolean }>(CLOSED);

  const open = (config: ConfirmConfig) => setState({ ...config, isOpen: true });
  const close = () => setState(prev => ({ ...prev, isOpen: false }));

  return {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirmLabel: state.confirmLabel,
    onConfirm: state.onConfirm,
    open,
    close,
  } as const;
}
