import React, { useState, useEffect } from 'react';

const ProjectNameModal = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  moduleName,
  title = "Name Your Project",
  message = "Please give your project a name to save it for later access.",
  defaultValue = '',
  confirmText = "Create Project",
  loading = false 
}) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && defaultValue) {
      setProjectName(defaultValue);
    } else if (visible) {
      setProjectName('');
    }
  }, [visible, defaultValue]);

  const handleConfirm = () => {
    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }
    
    if (projectName.trim().length < 3) {
      setError('Project name must be at least 3 characters long');
      return;
    }
    
    setError('');
    onConfirm(projectName.trim());
  };

  const handleCancel = () => {
    setProjectName('');
    setError('');
    onCancel();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '500px',
        maxWidth: '90vw',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: '20px',
          borderBottom: '1px solid #e8e8e8',
          paddingBottom: '16px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#333'
          }}>
            {title}
          </h3>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '20px' }}>
          {moduleName && (
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              color: '#666'
            }}>
              You're about to {title.toLowerCase().includes('open') ? 'open' : 'create'} a project for: <strong>{moduleName}</strong>
            </p>
          )}
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#666'
          }}>
            {message}
          </p>
          
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px',
              color: '#333'
            }}>
              Project Name *
            </label>
            <input
              type="text"
              placeholder="Enter project name (e.g., Office Building Connection)"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              maxLength={100}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: error ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            {projectName.length > 0 && (
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {projectName.length}/100
              </div>
            )}
          </div>
          
          {error && (
            <div style={{
              color: '#ff4d4f',
              fontSize: '14px',
              marginTop: '8px'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Tip */}
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f6f8fa',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#586069'
        }}>
          <strong>Tip:</strong> Use a descriptive name that will help you identify this project later. 
          You can always rename it later.
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          borderTop: '1px solid #e8e8e8',
          paddingTop: '16px'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: loading ? '#ccc' : '#1890ff',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#40a9ff';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#1890ff';
              }
            }}
          >
            {loading ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectNameModal; 