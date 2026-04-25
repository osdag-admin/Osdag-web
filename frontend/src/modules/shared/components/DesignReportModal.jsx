import React, { useState } from 'react';
import { Modal, Row, Col, Input, Button, Upload, Spin, message } from 'antd';
import { ReportCustomizationModal } from './ReportCustomizationModal';
import { useEngineeringService } from '../hooks/useEngineeringService';

export const DesignReportModal = ({
  isOpen,
  onCancel,
  onOk,
  designReportInputs,
  setDesignReportInputs,
  output,
  moduleId,
  inputValues,
  designStatus = true,
  logs = [],
  moduleConfig,
  boltDiameterList = [],
  propertyClassList = [],
  thicknessList = [],
  angleList = [],
  allSelected = {},
  extraState = {},
  selectedSection,
  setSelectedSection,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [sections, setSections] = useState({});
  const [selectedSections, setSelectedSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const service = useEngineeringService();

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

  const handleProfileFileChange = (file) => {
    setSelectedFile(file);
    // Prevent upload
    return false;
  };

  const handleUseProfile = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const contents = event.target.result;
        const lines = contents.split("\n");

        lines.forEach((line) => {
          const [field, value] = line.split(":");
          if (field && value) {
            const trimmedField = field.trim();
            const trimmedValue = value.trim();

            if (trimmedField === "CompanyName") {
              handleFieldChange('companyName', trimmedValue);
            } else if (trimmedField === "Designer") {
              handleFieldChange('designer', trimmedValue);
            } else if (trimmedField === "Group/TeamName") {
              handleFieldChange('groupTeamName', trimmedValue);
            }
          }
        });
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSaveProfile = () => {
    const profileSummary = `CompanyLogo: C:/Users/SURAJ/Pictures/codeup.png
CompanyName: ${designReportInputs.companyName}
Designer: ${designReportInputs.designer}
Group/TeamName: ${designReportInputs.groupTeamName}`;

    const blob = new Blob([profileSummary], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${designReportInputs.companyName}.txt`;

    link.style.display = "none";
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateInitialReport = async () => {
    if (!output) {
      message.error("Please submit the design first.");
      return;
    }

    setLoading(true);
    try {
      // Transform input values using the same logic as design calculation
      const transformedInputValues = moduleConfig?.buildSubmissionParams ?
        moduleConfig.buildSubmissionParams(inputValues, allSelected, {
          boltDiameterList,
          propertyClassList,
          thicknessList,
          angleList,
        }, extraState) : inputValues;

      // Optionally capture CAD views for report images (frontend-driven).
      // Force Model view so report shows full assembly, not the current per-part view.
      let images = {};
      const prevSection = selectedSection;
      if (typeof window !== "undefined" && typeof window.captureReportViews === "function") {
        try {
          if (setSelectedSection) {
            setSelectedSection(["Model"]);
            await new Promise((r) => setTimeout(r, 400));
          }
          images = await window.captureReportViews();
          const keys = images && typeof images === "object" ? Object.keys(images) : [];
          console.log(
            "[DesignReportModal] captureReportViews keys:",
            keys,
            keys.map((k) => [k, (images[k] && String(images[k]).length) || 0])
          );
          if (keys.length === 0) {
            console.warn(
              "[DesignReportModal] No screenshots captured — check 3D canvas (Model), ReportCaptureDev, and scene bbox."
            );
          }
          if (setSelectedSection) {
            setSelectedSection(Array.isArray(prevSection) ? prevSection : [prevSection]);
          }
        } catch (e) {
          console.error("[DesignReportModal] captureReportViews failed", e);
          if (setSelectedSection) {
            setSelectedSection(Array.isArray(prevSection) ? prevSection : [prevSection]);
          }
        }
      } else {
        console.warn(
          "[DesignReportModal] window.captureReportViews is not available — open CAD view first; report will use broken placeholders."
        );
      }

      // Prepare request data
      const requestData = {
        metadata: {
          ProfileSummary: {
            CompanyName: designReportInputs.companyName,
            CompanyLogo: designReportInputs.companyLogo ? designReportInputs.companyLogoName : "",
            "Group/TeamName": designReportInputs.groupTeamName,
            Designer: designReportInputs.designer,
          },
          ProjectTitle: designReportInputs.projectTitle,
          Subtitle: designReportInputs.subtitle,
          JobNumber: designReportInputs.jobNumber,
          AdditionalComments: designReportInputs.additionalComments,
          Client: designReportInputs.client,
        },
        module_id: moduleId,
        input_values: transformedInputValues,
        design_status: designStatus,
        logs: logs,
        images,
      };

      // Generate initial LaTeX report
      const result = await service.generateInitialReport(
        moduleConfig?.designType || moduleId,
        requestData
      );

      if (result.success) {
        setReportId(result.report_id);
        setSections(result.sections);

        // Select all sections by default
        const allSections = [];
        Object.keys(result.sections).forEach(section => {
          allSections.push(section);
          if (result.sections[section] && result.sections[section].length > 0) {
            result.sections[section].forEach(subsection => {
              allSections.push(`${section}/${subsection}`);
            });
          }
        });
        setSelectedSections(allSections);

        // Show customization modal
        setShowCustomization(true);
        message.success("Report generated successfully! Please customize sections.");
      } else {
        message.error(result.error || "Failed to generate report");
      }
    } catch (error) {
      console.error('[DesignReportModal] generate-initial:error', error);
      message.error("Error generating report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPDF = async (selectedSections) => {
    try {
      // Generate customized PDF and open in new tab
      const result = await service.customizeReport(reportId, selectedSections);

      if (result.success && result.blob) {
        // Open PDF in new tab
        const url = window.URL.createObjectURL(result.blob);
        window.open(url, '_blank', 'noopener,noreferrer');

        message.success("PDF opened in new tab!");
      } else {
        message.error(result.error || "Failed to generate PDF");
      }
    } catch (error) {
      console.error('[DesignReportModal] handleOpenPDF:error', error);
      message.error("Error opening PDF. Please try again.");
    }
  };

  const handleSavePDF = async (selectedSections) => {
    try {
      const result = await service.customizeReport(reportId, selectedSections);

      if (!result.success || !result.blob) {
        message.error(result.error || "Failed to generate customized report");
        return;
      }

      const blob = result.blob;

      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `Osdag_Custom_Report_${reportId}.pdf`,
          types: [{ description: 'PDF', accept: { 'application/pdf': ['.pdf'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Osdag_Custom_Report_${reportId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      message.success("Customized report saved successfully!");
      setShowCustomization(false);
      onOk && onOk();
    } catch (error) {
      console.error('[DesignReportModal] handleSavePDF:error', error);
      message.error("Error saving PDF. Please try again.");
    }
  };

  const handleSectionsChange = (newSelectedSections) => {
    setSelectedSections(newSelectedSections);
  };

  const handleCancelCustomization = () => {
    setShowCustomization(false);
  };

  return (
    <>
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      className={`designModal [&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4 ${
        window.innerWidth < 768 
          ? '[&_.ant-modal]:!w-screen [&_.ant-modal]:!h-screen [&_.ant-modal]:!top-0 [&_.ant-modal]:!max-w-full [&_.ant-modal]:!m-0 [&_.ant-modal]:!left-0 [&_.ant-modal-body]:!p-4 [&_.ant-modal-body]:!h-[calc(100vh-55px)] [&_.ant-modal-body]:!overflow-y-auto' 
          : ''
      }`}
      title="Design Report Summary"
      width={window.innerWidth < 768 ? '100vw' : 1400}
      style={window.innerWidth < 768 ? { 
        maxWidth: '100vw',
        top: 0,
        paddingBottom: 0
      } : {}}
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

          {/* Profile Management */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Upload
              beforeUpload={handleProfileFileChange}
              showUploadList={false}
            >
              <Button>Select Profile File</Button>
            </Upload>
            <Button type="button" onClick={handleUseProfile}>
              Use Profile
            </Button>
            <Button type="button" onClick={handleSaveProfile}>
              Save Profile
            </Button>
          </div>

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
            <Button
              type="primary"
              onClick={handleGenerateInitialReport}
              loading={loading}
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Customization Modal */}
      <ReportCustomizationModal
        isOpen={showCustomization}
        onCancel={handleCancelCustomization}
        onOpenPDF={handleOpenPDF}
        onSavePDF={handleSavePDF}
        reportId={reportId}
        sections={sections}
        selectedSections={selectedSections}
        onSectionsChange={handleSectionsChange}
        loading={loadingSections}
      />
    </>
  );
};