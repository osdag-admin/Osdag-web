import React from "react";
import { Modal, Transfer } from "antd";

export const ThicknessSelectionModal = ({
  isOpen,
  onClose,
  title,
  dataSource,
  selectedItems,
  onTransferChange,
}) => {
  const safeSource = Array.isArray(dataSource) ? dataSource : [];
  const safeSelected = Array.isArray(selectedItems) ? selectedItems : [];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={540}
      className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
    >
      <div className="p-2">
        <h3 className="py-2 font-semibold">{title}</h3>
        <Transfer
          dataSource={safeSource
            .slice()
            .sort((a, b) => Number(a) - Number(b))
            .map((label) => ({
              key: label,
              label: <h5>{label}</h5>,
            }))}
          targetKeys={safeSelected}
          onChange={onTransferChange}
          render={(item) => item.label}
          titles={["Available", "Selected"]}
          showSearch
          listStyle={{ height: 400, width: 240 }}
        />
      </div>
    </Modal>
  );
};

