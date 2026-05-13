import { Drawer, type DrawerProps } from 'antd';

type AppDrawerProps = DrawerProps;

export function AppDrawer(props: AppDrawerProps) {
  return <Drawer {...props} />;
}
