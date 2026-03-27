import { Select, type SelectProps } from 'antd';

export function AppSelect<ValueType = unknown, OptionType extends object = object>(
  props: SelectProps<ValueType, OptionType>
) {
  return <Select {...props} />;
}
