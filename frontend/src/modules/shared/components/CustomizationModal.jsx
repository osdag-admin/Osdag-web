import React from 'react';
import { Modal, Transfer } from 'antd';

export const CustomizationModal = ({
  isOpen,
  onClose,
  title,
  dataSource,
  selectedItems,
  onTransferChange
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
      height={500}
      className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
    >
      <div className="popUp ">
        <h3 className="py-2">{title}</h3>
        <Transfer
          dataSource={dataSource
            .sort((a, b) => Number(a) - Number(b))
            .map((label) => ({
              key: label,
              label: <h5>{label}</h5>,
            }))}
          targetKeys={selectedItems}
          onChange={onTransferChange}
          render={(item) => item.label}
          titles={["Available", "Selected"]}
          showSearch
          listStyle={{ height: 400, width: 300 }}
        />
      </div>
    </Modal>
  );
};
