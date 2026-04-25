import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Input, Button, Upload, Tree, Checkbox, Spin, message } from 'antd';

const { TreeNode } = Tree;

export const ReportCustomizationModal = ({
  isOpen,
  onCancel,
  onOpenPDF,
  onSavePDF,
  reportId,
  sections = {},
  selectedSections = [],
  onSectionsChange,
  loading = false
}) => {
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [compilingPDF, setCompilingPDF] = useState(false);

  // Initialize checked keys when sections change
  useEffect(() => {
    if (sections && Object.keys(sections).length > 0) {
      const allKeys = [];
      Object.keys(sections).forEach(section => {
        allKeys.push(section);
        if (sections[section] && sections[section].length > 0) {
          sections[section].forEach(subsection => {
            allKeys.push(`${section}/${subsection}`);
          });
        }
      });
      setCheckedKeys(allKeys);
      setExpandedKeys(Object.keys(sections));
    }
  }, [sections]);

  const onCheck = (checkedKeysValue, info) => {
    setCheckedKeys(checkedKeysValue);
    onSectionsChange && onSectionsChange(checkedKeysValue);
  };

  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const renderTreeNodes = (sections) => {
    return Object.keys(sections).map(section => {
      const subsections = sections[section] || [];
      const children = subsections.map(subsection => (
        <TreeNode
          title={subsection}
          key={`${section}/${subsection}`}
          isLeaf
        />
      ));

      return (
        <TreeNode
          title={section}
          key={section}
          children={children}
        />
      );
    });
  };

  const handleSelectAll = () => {
    const allKeys = [];
    Object.keys(sections).forEach(section => {
      allKeys.push(section);
      if (sections[section] && sections[section].length > 0) {
        sections[section].forEach(subsection => {
          allKeys.push(`${section}/${subsection}`);
        });
      }
    });
    setCheckedKeys(allKeys);
    onSectionsChange && onSectionsChange(allKeys);
  };

  const handleSelectNone = () => {
    setCheckedKeys([]);
    onSectionsChange && onSectionsChange([]);
  };

  const handleOpenPDF = async () => {
    if (selectedSections.length === 0) {
      message.error("Please select at least one section to include.");
      return;
    }

    setCompilingPDF(true);
    try {
      await onOpenPDF(selectedSections);
    } catch (error) {
      message.error("Failed to open PDF. Please try again.");
    } finally {
      setCompilingPDF(false);
    }
  };

  const handleSavePDF = async () => {   
    if (selectedSections.length === 0) {
      message.error("Please select at least one section to include.");
      return;
    }

    setCompilingPDF(true);
    try {
      await onSavePDF(selectedSections);
    } catch (error) {
      message.error("Failed to save PDF. Please try again.");
    } finally {
      setCompilingPDF(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      title="Customize and Save Design Report"
      width={window.innerWidth < 768 ? '100vw' : 600}
      style={{
        border: '1px solid #90af13',
        ...(window.innerWidth < 768 ? {
          maxWidth: '100vw',
          top: 0,
          margin: 0
        } : {})
      }}
      className={`[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4 ${
        window.innerWidth < 768 
          ? '[&_.ant-modal]:!w-screen [&_.ant-modal]:!h-screen [&_.ant-modal]:!top-0 [&_.ant-modal]:!max-w-full [&_.ant-modal]:!m-0 [&_.ant-modal]:!left-0 [&_.ant-modal-body]:!p-4 [&_.ant-modal-body]:!h-[calc(100vh-55px)] [&_.ant-modal-body]:!overflow-y-auto' 
          : ''
      }`}
    >
      <div className="mb-4">
        <h3 className="py-2">
          Customize Report Sections
        </h3>
        <p className="mb-2 text-sm text-gray-500">
          Select which sections to include in your customized report:
        </p>
        <div className="mb-3">
          <Button 
            className="mr-2 text-sm font-medium text-white bg-osdag-green rounded-lg hover:bg-osdag-dark-green transition-colors"
            onClick={handleSelectAll} 
          >
            Select All
          </Button>
          <Button 
            size="small" 
            onClick={handleSelectNone}
            className="text-sm font-medium text-black bg-white rounded-lg border border-black hover:bg-osdag-dark-green transition-colors"
          >
            Select None
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-5">
          <Spin size="large" />
          <p>Loading sections...</p>
        </div>
      ) : (
        <div className="border border-gray-400 rounded-md bg-white p-2 mb-4">
          <Tree
            checkable
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onCheck={onCheck}
            checkedKeys={checkedKeys}
            className="max-h-[300px] overflow-y-auto bg-white"
          >
            {renderTreeNodes(sections)}
          </Tree>
        </div>
      )}

      <div className="mb-4 p-3 bg-gray-100 rounded-md">
        <p className="m-0 text-sm text-gray-500">
          <strong>Selected sections:</strong> {checkedKeys.length} of {Object.keys(sections).length + Object.values(sections).flat().length} total
        </p>
      </div>

      {/* Action Buttons - Matching Desktop Layout */}
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-200">
        <Button 
          onClick={handleOpenPDF}
          loading={compilingPDF}
          className="text-sm font-medium text-black bg-white rounded-lg border border-black hover:bg-osdag-dark-green transition-colors p-2"
        >
          Open PDF
        </Button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button 
            onClick={handleSavePDF}
            loading={compilingPDF}
            style={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              borderRadius: '5px',
              border: '1px solid black',
              padding: '5px 14px',
            }}
          >
            Save PDF
          </Button>
          <Button 
            onClick={onCancel}
            style={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              borderRadius: '5px',
              border: '1px solid black',
              padding: '5px 14px',
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
