/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Modal, Transfer, Button, message } from 'antd';
import { useViewport } from '../hooks/useViewport';

export const CustomizationModal = ({
  isOpen,
  onClose,
  title,
  dataSource = [],
  selectedItems = [],
  onTransferChange,
  disabledValues = []
}) => {
  const [tempKeys, setTempKeys] = useState([]);
  const { isMobile } = useViewport();

  // Sync temp keys when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempKeys(selectedItems || []);
    }
  }, [isOpen, selectedItems]);

  const handleSelectAll = () => {
    const allKeys = dataSource
      .map(item => {
        if (typeof item === 'object' && item !== null) {
          return item.value || item.Grade || item.toString();
        }
        return item.toString();
      })
      .filter(key => !disabledValues.includes(key));
    setTempKeys(allKeys);
  };

  const handleClearAll = () => {
    setTempKeys([]);
  };

  const handleSubmit = () => {
    if (tempKeys.length === 0) {
      message.error("Please select at least one value.");
      return;
    }
    onTransferChange(tempKeys);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const sortedDataSource = [...dataSource].sort((a, b) => {
    const valA = typeof a === 'object' && a !== null ? (a.value || a.Grade || a.toString()) : a.toString();
    const valB = typeof b === 'object' && b !== null ? (b.value || b.Grade || b.toString()) : b.toString();
    return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
  });

  const transferData = sortedDataSource.map((item) => {
    const key = typeof item === 'object' && item !== null ? (item.value || item.Grade || item.toString()) : item.toString();
    const disabled = disabledValues && disabledValues.includes(key);
    return {
      key: key,
      label: key,
      disabled: disabled
    };
  });

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          className="bg-osdag-green hover:bg-osdag-dark-green border-none"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      ]}
      width={620}
      className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
    >
      <div className="popUp flex flex-col items-center w-full">
        <div className="w-full max-w-[560px]">
          <h3 className="py-2 text-lg font-bold text-osdag-text-primary dark:text-white text-left">{title}</h3>
          <div className="flex gap-2 mb-3 justify-start">
            <Button size="middle" className="hover:border-osdag-green hover:text-osdag-green" onClick={handleSelectAll}>
              Select All (≫)
            </Button>
            <Button size="middle" className="hover:border-osdag-green hover:text-osdag-green" onClick={handleClearAll}>
              Clear All (≪)
            </Button>
          </div>
          <div className="flex justify-center w-full overflow-hidden">
            <Transfer
              className="w-full flex justify-center items-center"
              dataSource={transferData}
              targetKeys={tempKeys}
              onChange={(nextTargetKeys) => setTempKeys(nextTargetKeys)}
              render={(item) => <span className="text-sm truncate block" title={item.label}>{item.label}</span>}
              titles={["Available", "Selected"]}
              showSearch
              listStyle={{ 
                height: 350, 
                width: isMobile ? 140 : 240,
                minWidth: isMobile ? 130 : 240
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
