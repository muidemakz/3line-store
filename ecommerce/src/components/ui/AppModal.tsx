import { Modal, type ModalProps } from 'antd';

type AppModalProps = ModalProps;

export function AppModal(props: AppModalProps) {
  return <Modal {...props} />;
}
