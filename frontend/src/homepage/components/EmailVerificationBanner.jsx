/* eslint-disable react/prop-types */
import { Alert, Button, Space } from 'antd';
import { MailOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { resendEmailVerification } from '../../utils/firebaseAuth';

/**
 * Email Verification Banner Component
 * Shows persistent banner for unverified users with restrictions message
 */
export const EmailVerificationBanner = ({ user, onVerified }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified || false);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Check verification status when window regains focus
  // Firebase doesn't automatically push verification status, so we need to reload
  useEffect(() => {
    const handleFocus = async () => {
      if (user && !user.emailVerified) {
        try {
          await user.reload();
          const verified = user.emailVerified;
          setEmailVerified(verified);
          
          if (verified && onVerified) {
            onVerified();
            // Reload page to update entire app state
            window.location.reload();
          }
        } catch (error) {
          console.error('Error reloading user:', error);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, onVerified]);

  // Periodic check for verification status (every 5 seconds)
  useEffect(() => {
    if (!user || emailVerified) return;

    const checkVerification = async () => {
      try {
        await user.reload();
        const verified = user.emailVerified;
        setEmailVerified(verified);
        
        if (verified && onVerified) {
          onVerified();
          window.location.reload();
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

  const handleResendVerification = async () => {
    if (!user || resendCooldown > 0) return;

    setIsResending(true);
    try {
      await resendEmailVerification(user);
      // Localized success messaging handled via parent if needed
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      // Parent or global handler can show error message
      console.error('Error resending verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  if (!user || !user.email || emailVerified) {
    return null;
  }

  return (
    <Alert
      message={
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <strong>Email Not Verified</strong>
          </Space>
          <div style={{ marginTop: 4, fontSize: '14px' }}>
            You cannot create or save projects until you verify your email. 
            Please check your inbox and click the verification link.
          </div>
        </Space>
      }
      type="warning"
      showIcon={false}
      action={
        <Button
          type="link"
          icon={<MailOutlined />}
          onClick={handleResendVerification}
          disabled={isResending || resendCooldown > 0}
          loading={isResending}
          size="small"
        >
          {isResending 
            ? 'Sending...' 
            : resendCooldown > 0 
            ? `Resend (${resendCooldown}s)` 
            : 'Resend Email'}
        </Button>
      }
      closable={false}
      style={{ 
        marginBottom: 16,
        borderRadius: 6
      }}
    />
  );
};

