import React from 'react';
import { List, Button } from 'antd';
import './UserAccount.css'; 

const UserAccount = () => {
  // Replace these with your actual data
  const userEmail = 'user@example.com';
  const osiFiles = [
    { name: 'File 1.osi', url: 'https://example.com/file1.osi' },
    { name: 'File 2.osi', url: 'https://example.com/file2.osi' },
    // Add more fila
  ];

  const onViewClick = (url) => {
    // Implement view logic here
    console.log('View file:', url);
  };

  const onDownloadClick = (url) => {
    // Implement download logic here
    console.log('Download file:', url);
  };

  const renderItem = (file) => (
    <List.Item>
      <span>{file.name}</span>
      <Button onClick={() => onViewClick(file.url)} style={{ marginLeft: '10px' }}>
        View
      </Button>
      <Button onClick={() => onDownloadClick(file.url)} style={{ marginLeft: '10px' }}>
        Download
      </Button>
    </List.Item>
  );

  return (
    <>
    <div className="user-dashboard-container">
    <div className='dashboard-header'>
        <h2>User Dashboard</h2>
        <div>
          <strong>Email:</strong> {userEmail}
        </div>
    </div>
      <div className="user-dashboard">
        <div>
          <strong>Files in .osi format:</strong>
          <List
            dataSource={osiFiles}
            renderItem={renderItem}
            className="file-list" 
            />
        </div>
      </div>
    </div>
            </>
  );
};

export default UserAccount;
