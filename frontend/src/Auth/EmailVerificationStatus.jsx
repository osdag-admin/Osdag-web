import { useState, useEffect } from 'react';
import { Badge, Button, Alert, Space, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MailOutlined, ReloadOutlined } from '@ant-design/icons';
import { auth } from './firebase';
import { resendEmailVerification } from '../utils/firebaseAuth';

/**
 * Email Verification Status Component
 * Shows verification status and allows resending verification email
 */
export const EmailVerificationStatus = ({ user, onVerified }) => {
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified || false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check verification status periodically
  useEffect(() => {
    if (!user || emailVerified) return;

    const checkVerification = async () => {
      try {
        await user.reload();
        const verified = user.emailVerified;
        setEmailVerified(verified);
        
        if (verified && onVerified) {
          onVerified();
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    // Check immediately
    checkVerification();

    // Check every 5 seconds
    const interval = setInterval(checkVerification, 5000);

    return () => clearInterval(interval);
  }, [user, emailVerified, onVerified]);

  // Update state when user changes
  useEffect(() => {
    setEmailVerified(user?.emailVerified || false);
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!user || resendCooldown > 0) return;

    setIsResending(true);
    setMessage({ type: '', text: '' });

    try {
      await resendEmailVerification(user);
      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox and click the verification link.'
      });
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to send verification email. Please try again.'
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!user || !user.email) {
    return null;
  }

  if (emailVerified) {
    return (
      <Alert
        message={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Email verified successfully!</span>
          </Space>
        }
        type="success"
        showIcon={false}
        style={{ marginBottom: 16 }}
      />
    );
  }

  return (
    <Alert
      message={
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Email not verified</span>
          </Space>
          <div style={{ marginTop: 8 }}>
            <Button
              type="link"
              icon={<MailOutlined />}
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              loading={isResending}
              style={{ padding: 0, height: 'auto' }}
            >
              {isResending ? (
                <Space>
                  <Spin size="small" />
                  <span>Sending...</span>
                </Space>
              ) : resendCooldown > 0 ? (
                `Resend verification email (${resendCooldown}s)`
              ) : (
                'Resend verification email'
              )}
            </Button>
          </div>
          {message.text && (
            <div style={{ marginTop: 8 }}>
              <Alert
                message={message.text}
                type={message.type}
                showIcon
                closable
                onClose={() => setMessage({ type: '', text: '' })}
              />
            </div>
          )}
        </Space>
      }
      type="warning"
      showIcon={false}
      style={{ marginBottom: 16 }}
    />
  );
};

