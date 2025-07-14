import React, { useState } from "react";
import "../App.css";
import { Input, Modal, Button } from "antd";


function BeamToColumnEndPlateOutputDock({ output, disabled }) {
  console.log("Output Dock Data:", output);
  const [continuityPlateModal, setContinuityPlateModal] = useState(false);
  const [webStiffenerModal, setWebStiffenerModal] = useState(false);
  const [stiffenerDetailsModal, setStiffenerDetailsModal] = useState(false);
  const [typicalSketchModal, setTypicalSketchModal] = useState(false);
  const [weldDetailsModal, setWeldDetailsModal] = useState(false);
  const [weldFlangeTypeModal, setWeldFlangeTypeModal] = useState(false);

  const commonInputStyle = {
    color: "rgb(0 0 0 / 67%)",
    fontSize: "12px",
    fontWeight: "500",
  };

  const webWeldItems = !output || disabled ? [] : output?.Weld?.filter(item => item.label !== "Type") || [];

  return (
    <>
      <p>Output Dock</p>
      <div className="subMainBody scroll-data">
        {/* Critical Bolt Design Section */}
        <div>
          <h3>Critical Bolt Design</h3>
          {(output?.Bolt || []).map((item, index) => (
            <div key={index} className="component-grid">
              <div className="component-grid-align">
                <h4>{item.label}</h4>
                <Input
                  type="text"
                  style={commonInputStyle}
                  value={!output || disabled ? "" : item.val || ""}
                  disabled
                />
              </div>
            </div>
          ))}
        </div>

        {/* Detailing Section */}
        <div>
          <h3>Detailing</h3>
          {(output?.Detailing || []).map((item, index) => (
            <div key={index} className="component-grid">
              <div className="component-grid-align">
                <h4>{item.label}</h4>
                <Input
                  type="text"
                  style={commonInputStyle}
                  value={!output || disabled ? "" : item.val || ""}
                  disabled
                />
              </div>
              {index === (output?.Detailing?.length || 0) - 1 && (
                <div className="component-grid-align">
                  <h4>Typical Detailing</h4>
                  <Input
                    className="btn"
                    type="button"
                    value="Details"
                    onClick={() => setTypicalSketchModal(true)}
                    disabled={!output || disabled}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* End Plate Section */}
        <div>
          <h3>End Plate</h3>
          {(output?.Plate || []).map((item, index) => (
            <div key={index} className="component-grid">
              <div className="component-grid-align">
                <h4>{item.label}</h4>
                <Input
                  type="text"
                  style={commonInputStyle}
                  value={!output || disabled ? "" : item.val || ""}
                  disabled
                />
              </div>
            </div>
          ))}
        </div>

        {/* Continuity Plate Section */}
        <div>
          <h3>Continuity Plate</h3>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Continuity Plate</h4>
              <Input
                className="btn"
                type="button"
                value="Continuity Plate Details"
                onClick={() => setContinuityPlateModal(true)}
                disabled={!output || disabled || !(output?.ContinuityPlate?.length > 0)}
              />
            </div>
            {output?.ContinuityPlate?.find(o => o.label === "Number of Continuity Plate(s)") && (
              <div className="component-grid-align">
                <h4>Number of Plates</h4>
                <Input
                  type="text"
                  style={commonInputStyle}
                  value={
                    !output || disabled
                      ? ""
                      : output.ContinuityPlate?.find(
                          (o) => o.label === "Number of Continuity Plate(s)"
                        )?.val || ""
                  }
                  disabled
                />
              </div>
            )}
          </div>
        </div>

        {/* Column Web Stiffener Plate */}
        <div>
          <h3>Column Web Stiffener Plate</h3>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Web Stiffener Plate</h4>
              <Input
                className="btn"
                type="button"
                value="Web Stiffener Details"
                onClick={() => setWebStiffenerModal(true)}
                disabled={!output || disabled || !(output?.WebStiffener?.length > 0)}
              />
            </div>
          </div>
        </div>

        {/* Stiffener Plate */}
        <div>
          <h3>Stiffener Plate</h3>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Dimensions</h4>
              <Input
                className="btn"
                type="button"
                value="Details"
                onClick={() => setStiffenerDetailsModal(true)}
                disabled={!output || disabled || !(output?.Stiffener?.length > 0)}
              />
            </div>
          </div>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Typical Sketch</h4>
              <Input
                className="btn"
                type="button"
                value="Details"
                onClick={() => setTypicalSketchModal(true)}
                disabled={!output || disabled}
              />
            </div>
          </div>
        </div>

        {/* Weld Section */}
        <div>
          <h3>Weld</h3>
          <h4>Weld at Web</h4>
          {webWeldItems.map((item, index) => (
            <div key={index} className="component-grid">
              <div className="component-grid-align">
                <h4>{item.label}</h4>
                <Input
                  type="text"
                  style={commonInputStyle}
                  value={!output || disabled ? "" : item.val || ""}
                  disabled
                />
              </div>
              {index === webWeldItems.length - 1 && webWeldItems.length > 0 && (
                <div className="component-grid-align">
                  <h4>Web Weld Details</h4>
                  <Input
                    className="btn"
                    type="button"
                    value="Details"
                    onClick={() => setWeldDetailsModal(true)}
                    disabled={!output || disabled}
                  />
                </div>
              )}
            </div>
          ))}
          <h4>Weld at Flange</h4>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Type</h4>
              <Input
                type="text"
                style={commonInputStyle}
                value={
                  !output || disabled
                    ? ""
                    : output?.Weld?.find((o) => o.label === "Type")?.val || ""
                }
                disabled
              />
            </div>
            <div className="component-grid-align">
              <h4>Details</h4>
              <Input
                className="btn"
                type="button"
                value="Weld Details"
                onClick={() => setWeldFlangeTypeModal(true)}
                disabled={!output || disabled || !(output?.Weld?.length > 0)}
              />
            </div>
          </div>
          <div className="component-grid">
            <div className="component-grid-align">
              <h4>Typical Sketch</h4>
              <Input
                className="btn"
                type="button"
                value="Details"
                onClick={() => setTypicalSketchModal(true)}
                disabled={!output || disabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals for additional details */}
      <Modal
        open={continuityPlateModal}
        onCancel={() => setContinuityPlateModal(false)}
        footer={null}
        title="Continuity Plate Details"
        width={"30%"}
      >
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {output?.ContinuityPlate && output.ContinuityPlate.length > 0 ? (
              output.ContinuityPlate.map((item, index) => (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{item.label}</h4>
                    <Input
                      type="text"
                      style={commonInputStyle}
                      value={item.val || ""}
                      disabled
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No continuity plate details available</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={webStiffenerModal}
        onCancel={() => setWebStiffenerModal(false)}
        footer={null}
        title="Web Stiffener Details"
        width={"30%"}
      >
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {output?.WebStiffener && output.WebStiffener.length > 0 ? (
              output.WebStiffener.map((item, index) => (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{item.label}</h4>
                    <Input
                      type="text"
                      style={commonInputStyle}
                      value={item.val || ""}
                      disabled
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No web stiffener details available</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={stiffenerDetailsModal}
        onCancel={() => setStiffenerDetailsModal(false)}
        footer={null}
        title="Stiffener Details"
        width={"30%"}
      >
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {output?.Stiffener && output.Stiffener.length > 0 ? (
              output.Stiffener.map((item, index) => (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{item.label}</h4>
                    <Input
                      type="text"
                      style={commonInputStyle}
                      value={item.val || ""}
                      disabled
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No stiffener details available</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={typicalSketchModal}
        onCancel={() => setTypicalSketchModal(false)}
        footer={null}
        title="Typical Sketch"
        width={"50%"}
      >
        <div className="details-main-body">
          <div className="details-main-body-inside">
            <p>Typical sketch will be displayed here</p>
            {/* <img src={sketchImageURL} alt="Typical Sketch" /> */}
          </div>
        </div>
      </Modal>

      <Modal
        open={weldDetailsModal}
        onCancel={() => setWeldDetailsModal(false)}
        footer={null}
        title="Weld Details"
        width={"30%"}
      >
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {webWeldItems.length > 0 ? (
              webWeldItems.map((item, index) => (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{item.label}</h4>
                    <Input
                      type="text"
                      style={commonInputStyle}
                      value={item.val || ""}
                      disabled
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No weld details available</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={weldFlangeTypeModal}
        onCancel={() => setWeldFlangeTypeModal(false)}
        footer={null}
        title="Weld at Flange"
        width={"30%"}
      >
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {output?.Weld && output.Weld.length > 0 ? (
              output.Weld.map((item, index) => (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{item.label}</h4>
                    <Input
                      type="text"
                      style={commonInputStyle}
                      value={item.val || ""}
                      disabled
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No weld at flange details available</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default BeamToColumnEndPlateOutputDock;
