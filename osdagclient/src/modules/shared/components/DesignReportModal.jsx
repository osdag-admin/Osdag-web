import React from 'react';
import { Modal, Row, Col, Input, Button } from 'antd';

export const DesignReportModal = ({
  isOpen,
  onCancel,
  onOk,
  designReportInputs,
  setDesignReportInputs,
  output
}) => {
  
  const handleFieldChange = (field, value) => {
    setDesignReportInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event) => {
    const imageFile = event.target.files[0];
    const imageFileName = event.target.files[0]?.name || "";
    
    setDesignReportInputs(prev => ({
      ...prev,
      companyLogo: imageFile,
      companyLogoName: imageFileName,
    }));
  };

  const handleOkClick = () => {
    if (!output) {
      alert("Please submit the design first.");
      return;
    }
    onOk();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      className="designModal"
      title="Design Report Summary"
    >
      <div className="design-report-form">
        {/* Company Name */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Company Name:</label>
          </Col>
          <Col span={18}>
            <Input
              value={designReportInputs.companyName}
              onChange={(e) => handleFieldChange('companyName', e.target.value)}
              placeholder="Enter company name"
            />
          </Col>
        </Row>

        {/* Company Logo */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Company Logo:</label>
          </Col>
          <Col span={18}>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
            {designReportInputs.companyLogoName && (
              <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
                Selected: {designReportInputs.companyLogoName}
              </div>
            )}
          </Col>
        </Row>

        {/* Group/Team Name */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Group/Team Name:</label>
          </Col>
          <Col span={18}>
            <Input
              value={designReportInputs.groupTeamName}
              onChange={(e) => handleFieldChange('groupTeamName', e.target.value)}
              placeholder="Enter team name"
            />
          </Col>
        </Row>

        {/* Designer */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Designer:</label>
          </Col>
          <Col span={18}>
            <Input
              value={designReportInputs.designer}
              onChange={(e) => handleFieldChange('designer', e.target.value)}
              placeholder="Enter designer name"
            />
          </Col>
        </Row>

        {/* Project Title */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Project Title:</label>
          </Col>
          <Col span={18}>
            <Input
              value={designReportInputs.projectTitle}
              onChange={(e) => handleFieldChange('projectTitle', e.target.value)}
              placeholder="Enter project title"
            />
          </Col>
        </Row>

        {/* Subtitle */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Subtitle:</label>
          </Col>
          <Col span={18}>
            <Input
              value={designReportInputs.subtitle}
              onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              placeholder="Enter subtitle"
            />
          </Col>
        </Row>

        {/* Job Number */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Job Number:</label>
          </Col>
          <Col span={18}>
            <Input
              value={designReportInputs.jobNumber}
              onChange={(e) => handleFieldChange('jobNumber', e.target.value)}
              placeholder="Enter job number"
            />
          </Col>
        </Row>

        {/* Client */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Client:</label>
          </Col>
          <Col span={18}>
            <Input
              value={designReportInputs.client}
              onChange={(e) => handleFieldChange('client', e.target.value)}
              placeholder="Enter client name"
            />
          </Col>
        </Row>

        {/* Additional Comments */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: "5px" }}>
          <Col span={6}>
            <label>Additional Comments:</label>
          </Col>
          <Col span={18}>
            <Input.TextArea
              value={designReportInputs.additionalComments}
              onChange={(e) => handleFieldChange('additionalComments', e.target.value)}
              rows={4}
              placeholder="Enter additional comments"
              showCount
              maxLength={500}
            />
          </Col>
        </Row>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "10px",
          marginTop: "20px",
          paddingTop: "15px",
          borderTop: "1px solid #f0f0f0"
        }}>
          <Button type="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleOkClick}>
            Generate Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};