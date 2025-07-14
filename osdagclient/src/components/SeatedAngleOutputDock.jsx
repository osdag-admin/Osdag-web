import { useState } from "react";
import { Input, Modal } from "antd";
import spacingIMG from "../assets/spacing_3.png";

const customMapping = {
  Bolt: [
    { key: "Bolt.Diameter", label: "Diameter (mm)" },
    { key: "Bolt.Grade_Provided", label: "Property Class" },
    { key: "Bolt.number", label: "Number of Bolts" },
    { key: "Bolt.Shear", label: "Shear Capacity (kN)" },
    { key: "Bolt.Bearing", label: "Bearing Capacity (kN)" },
    { key: "Bolt.Betalg", label: "β<sub>lg</sub>" },
    { key: "Bolt.Capacity", label: "Bolt Value (kN)" },
    { key: "Bolt.Force (kN)", label: "Bolt Shear Force (kN)" },
  ],
  "Seated Angle Connection": [
    { key: "SeatedAngle.Designation", label: "Designation" },
    { key: "TopAngle.Width", label: "Width (mm)" },
    { key: "CapacityModal", label: "Capacity Details" },
    { key: "SpacingModal_Seated_col", label: "On Column" },
    { key: "SpacingModal_Seated_beam", label: "On Beam" },
  ],
  "Top Angle": [
    { key: "TopAngle.Designation", label: "Designation" },
    { key: "TopAngle.Width", label: "Width (mm)" },
    { key: "CapacityModal_Top_col", label: "On Column" },
    { key: "CapacityModal_Top_beam", label: "On Beam" },
  ],
};

const customSpacing = {
  SpacingModal_Seated_col: [
    { key: "Bolt.Rows_seated_col", label: "Rows of Bolts" },
    { key: "Bolt.Cols_seated_col", label: "Columns of Bolts" },
    { key: "Bolt.EndDist_seated_col", label: "End Distance (mm)" },
    { key: "Central Gauge (mm)", label: "Moment Capacity (kNm)" },
    { key: "Bolt.Gauge_seated_col", label: "Gauge Distance (mm)" },
    { key: "Bolt.EdgeDist_seated_col", label: "Edge Distance (mm)" },
  ],
  SpacingModal_Seated_beam: [
    { key: "Bolt.Rows_seated_beam", label: "Rows of Bolts" },
    { key: "Bolt.Cols_seated_beam", label: "Columns of Bolts" },
    { key: "Bolt.EndDist_seated_beam", label: "End Distance (mm)" },
    { key: "Bolt.Gauge_seated_beam", label: "Gauge Distance (mm)" },
    { key: "Bolt.EdgeDist_seated_beam", label: "Edge Distance (mm)" },
  ],
}

const customDetails = {
  CapacityModal: [
    { key: "Plate.ShearDemand", label: "Shear Demand (kN)" },
    { key: "Plate.Shear", label: "Shear Yielding Capacity (kN)" },
    { key: "Plate.MomDemand", label: "Moment Demand (kNm)" },
    { key: "Plate.MomCapacity", label: "Moment Capacity (kNm)" },
  ],
  CapacityModal_Top_col: [
    { key: "Bolt.Rows_top_col", label: "Rows of Bolts" },
    { key: "Bolt.Cols_top_col", label: "Columns of Bolts" },
    { key: "Bolt.EndDist_top_col", label: "End Distance (mm)" },
    { key: "Bolt.Gauge_top_col", label: "Gauge Distance (mm)" },
    { key: "Bolt.EdgeDist_top_col", label: "Edge Distance (mm)" },
  ],
  CapacityModal_Top_beam: [
    { key: "Bolt.Rows_top_beam", label: "Rows of Bolts" },
    { key: "Bolt.Cols_top_beam", label: "Columns of Bolts" },
    { key: "Bolt.EndDist_top_beam", label: "End Distance (mm)" },
    { key: "Bolt.Gauge_top_beam", label: "Gauge Distance (mm)" },
    { key: "Bolt.EdgeDist_top_beam", label: "Edge Distance (mm)" },
  ],
};

const SeatedAngleOutputDock = ({ output }) => {
  const [capacityModel, setCapacityModel] = useState(false);
  const [spacingModel, setSpacingModel] = useState(false);
  const [activeDetailSection, setActiveDetailSection] = useState(null);
  const [activeSpacingSection, setActiveSpacingSection] = useState(null);

  const handleDialogSpacing = (key) => {
    if (key.startsWith("SpacingModal_")) {
      setActiveSpacingSection(key);
      setSpacingModel(true);
    } else if (key.startsWith("CapacityModal")) {
      setActiveDetailSection(key);
      setCapacityModel(true);
    }
  };

  return (
    <>
      <p>Output Dock</p>
      <div className="subMainBody scroll-data">
        {Object.entries(customMapping).map(([section, fields]) => (
          <div key={section}>
            <h3>{section}</h3>
            {fields.map(({ key, label }, index) => {
              const entry = output?.[key];

              const isModalTrigger =
                key.startsWith("SpacingModal_") ||
                key.startsWith("CapacityModal");

              if (isModalTrigger) {
                return (
                  <div key={index} className="component-grid">
                    <div className="component-grid-align">
                      <h4>{label}</h4>
                      <Input
                        className="btn"
                        type="button"
                        value={label}
                        disabled={!output}
                        onClick={() => handleDialogSpacing(key)}
                      />
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className="component-grid">
                  <div className="component-grid-align">
                    <h4>{entry?.label || label}</h4>
                    <Input
                      type="text"
                      value={entry?.val ?? " "}
                      disabled
                      style={{
                        color: "rgb(0 0 0 / 67%)",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <Modal
        visible={spacingModel}
        onCancel={() => {
          setSpacingModel(false);
          setActiveSpacingSection(null);
        }}
        footer={null}
        width={"68%"}
      >
        <h3>Spacing Details</h3>
        <div>
          <p style={{ padding: "20px" }}>
            Note: Representative image for Spacing Details - 3 x 3 pattern
            considered
          </p>
        </div>
        <div className="spacing-main-body">
          <div className="spacing-main-two">
            <div className="spacing-left-body">
              {customSpacing?.[activeSpacingSection]?.map(
                ({ key, label }, idx) => (
                  <div key={idx} className="spacing-left-body-align">
                    <h4>{label}</h4>
                    <Input
                      type="text"
                      value={output?.[key]?.val ?? " "}
                      disabled
                      style={{
                        color: "rgb(0 0 0 / 67%)",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    />
                  </div>
                )
              )}
            </div>
            <div className="spacing-right-body">
              <img src={spacingIMG} alt="SpacingImage" />
            </div>
          </div>
        </div>
      </Modal>

      {/* Capacity Modal */}
      <Modal
        visible={capacityModel}
        onCancel={() => {
          setCapacityModel(false);
          setActiveDetailSection(null);
        }}
        footer={null}
        width={"30%"}
        style={{ height: "20vh" }}
      >
        <h3>Capacity Details</h3>
        <div className="details-main-body">
          <div className="details-main-body-inside">
            {customDetails?.[activeDetailSection]?.map(
              ({ key, label }, idx) => (
                <div key={idx} className="details-main-body-align">
                  <h4 dangerouslySetInnerHTML={{ __html: label }} />
                  <Input
                    type="text"
                    value={output?.[key]?.val ?? " "}
                    disabled
                    style={{
                      color: "rgb(0 0 0 / 67%)",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  />
                </div>
              )
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SeatedAngleOutputDock;
