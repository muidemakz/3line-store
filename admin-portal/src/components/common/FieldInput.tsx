import React from 'react';
import styles from './FieldInput.module.css';

interface FieldInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  size?: 'default' | 'small';
  required?: boolean;
}

const FieldInput: React.FC<FieldInputProps> = ({
  label,
  leftIcon,
  rightElement,
  placeholder,
  value,
  defaultValue,
  onChange,
  disabled = false,
  type = 'text',
  min,
  max,
  step,
  id,
  size = 'default',
  required,
}) => {
  const rowClass = [
    styles.inputRow,
    size === 'small' ? styles.inputRow_small : '',
    disabled ? styles.inputRow_disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrap}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={rowClass}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <input
          id={id}
          type={type}
          className={styles.input}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          required={required}
        />
        {rightElement && <span className={styles.right}>{rightElement}</span>}
      </div>
    </div>
  );
};

export default FieldInput;
