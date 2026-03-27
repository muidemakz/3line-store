import { Input, type InputProps } from 'antd';
import type { PasswordProps } from 'antd/es/input';

export function AppInput(props: InputProps) {
  return <Input {...props} />;
}

AppInput.Password = function AppPasswordInput(props: PasswordProps) {
  return <Input.Password {...props} />;
};
