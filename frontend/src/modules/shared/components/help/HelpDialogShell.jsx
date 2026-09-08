/* eslint-disable react/prop-types */
import { Modal, Button } from "antd";

export const HelpDialogShell = ({
  open,
  onClose,
  title,
  width = 720,
  children,
  footer,
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1280;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        footer ?? [
          <Button key="ok" type="primary" onClick={onClose} className="bg-osdag-green hover:!bg-osdag-dark-green">
            OK
          </Button>,
        ]
      }
      title={title}
      width={isMobile ? "100vw" : width}
      className={`[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4 ${
        isMobile
          ? "[&_.ant-modal]:!w-screen [&_.ant-modal]:!h-screen [&_.ant-modal]:!top-0 [&_.ant-modal]:!max-w-full [&_.ant-modal]:!m-0 [&_.ant-modal]:!left-0 [&_.ant-modal-body]:!p-4 [&_.ant-modal-body]:!h-[calc(100vh-55px)] [&_.ant-modal-body]:!overflow-y-auto"
          : ""
      }`}
      style={
        isMobile
          ? { top: 0, maxWidth: "100vw", margin: 0 }
          : undefined
      }
    >
      {children}
    </Modal>
  );
};

export default HelpDialogShell;
