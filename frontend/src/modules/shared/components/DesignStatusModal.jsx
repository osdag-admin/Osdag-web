/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import { Modal } from 'antd';
import { DESIGN_STATUS } from '../hooks/useDesignSubmission';

/**
 * DesignStatusModal Component
 * 
 * Replaces the old loading modal with a status-aware UI that provides
 * granular feedback during the design workflow.
 * 
 * Features:
 * - Shows different icons/spinners based on status.step
 * - Displays status.message
 * - Shows error details if status.step === ERROR
 * - Auto-dismisses when COMPLETE (or stays visible briefly)
 */
export const DesignStatusModal = ({ status, isMobile, onClose }) => {
  const isVisible = status.step !== DESIGN_STATUS.IDLE;
  
  // Auto-dismiss on complete after 1 second
  useEffect(() => {
    if (status.step === DESIGN_STATUS.COMPLETE) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status.step, onClose]);

  if (!isVisible) return null;

  const getStatusContent = () => {
    switch (status.step) {
      case DESIGN_STATUS.VALIDATING:
        return {
          icon: (
            <div className="spinner" style={{ borderRightColor: '#1890ff', borderBottomColor: '#1890ff', borderLeftColor: '#1890ff', borderTopColor: 'transparent' }}></div>
          ),
          title: 'OSDAG Design Processing',
          message: status.message || 'Validating inputs...',
          subMessage: 'Please wait...'
        };

      case DESIGN_STATUS.CALCULATING:
        return {
          icon: (
            <div className="spinner" style={{ borderRightColor: '#1890ff', borderBottomColor: '#1890ff', borderLeftColor: '#1890ff', borderTopColor: 'transparent' }}></div>
          ),
          title: 'OSDAG Design Processing',
          message: status.message || 'Running design calculations...',
          subMessage: 'This may take a few seconds'
        };

      case DESIGN_STATUS.CAD_GENERATING:
        return {
          icon: (
            <div className="spinner" style={{ borderRightColor: '#52c41a', borderBottomColor: '#52c41a', borderLeftColor: '#52c41a', borderTopColor: 'transparent' }}></div>
          ),
          title: 'OSDAG Design Processing',
          message: status.message || 'Building 3D model...',
          subMessage: 'Generating CAD geometry'
        };

      case DESIGN_STATUS.COMPLETE:
        return {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#52c41a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ),
          title: 'Design Complete!',
          message: status.message || 'Design complete!',
          subMessage: 'Your design results are ready'
        };

      case DESIGN_STATUS.ERROR:
        return {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff4d4f"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ),
          title: 'Error',
          message: status.message || 'An error occurred',
          subMessage: status.error?.message || 'Please check your inputs and try again',
          showRetry: true
        };

      default:
        return {
          icon: (
            <div className="spinner"></div>
          ),
          title: 'OSDAG Design Processing',
          message: status.message || 'Processing...',
          subMessage: 'Please wait'
        };
    }
  };

  const content = getStatusContent();

  return (
    <>
      <Modal
        open={isVisible}
        footer={null}
        closable={status.step === DESIGN_STATUS.ERROR}
        maskClosable={status.step === DESIGN_STATUS.ERROR}
        centered
        width={isMobile ? '90%' : 420}
        className="loading-modal"
        onCancel={status.step === DESIGN_STATUS.ERROR ? onClose : undefined}
        styles={{
          body: {
            textAlign: "center",
            padding: "30px 20px",
          },
        }}
      >
        <div className="loading-content">
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            {content.title}
          </div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60px' }}>
            {content.icon}
          </div>
          <div style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '500' }}>
            {content.message}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: content.showRetry ? '20px' : '0' }}>
            {content.subMessage}
          </div>
        </div>
      </Modal>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1890ff;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          animation: spin 1s linear infinite;
        }
        .dark .spinner {
          border-color: #333;
        }
      `}</style>
    </>
  );
};

