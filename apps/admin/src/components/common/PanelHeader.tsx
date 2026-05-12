import React from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface PanelHeaderProps {
  showingText?: string;
  showingValue?: string;
  action?: {
    label: string;
    onClick?: () => void;
    dropdownItems?: MenuProps['items'];
  };
}

const PanelHeader: React.FC<PanelHeaderProps> = ({ 
  showingText = "Showing:", 
  showingValue, 
  action 
}) => {
  return (
    <div className="panelHeader relative">
      <div className="flex flex-row items-center self-stretch">
        {showingValue && (
          <div className="showingLabelContainer">
            <span className="showingLabel">{showingText}</span>
            <span className="showingValue">{showingValue}</span>
          </div>
        )}
      </div>
      <div className="content-stretch flex items-start relative shrink-0">
        {action && action.dropdownItems ? (
          <Dropdown menu={{ items: action.dropdownItems }} trigger={['click']}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              className="adminActionBtn panelHeaderBtn"
            >
              {action.label}
            </Button>
          </Dropdown>
        ) : action ? (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={action.onClick}
            className="adminActionBtn panelHeaderBtn"
          >
            {action.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default PanelHeader;

