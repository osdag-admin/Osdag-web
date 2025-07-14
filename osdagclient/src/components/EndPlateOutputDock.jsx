/* eslint-disable no-unused-vars */
import React from "react";
import { useState } from "react";
import { Input, Modal, Row, Col } from "antd";
import spacingIMG from "../assets/endplate_spacing.png";
import capacityIMG1 from "../assets/L_shear1.png";
import capacityIMG2 from "../assets/L.png";
const placeholderOutput = {
  Bolt: [
    {
      label: "Diameter (mm)",
      val: 0,
    },
    {
      label: "Property Class",
      val: 0,
    },
    {
      label: "shear Capacity (KN)",
      val: 0,
    },
    {
      label: "Bolt Force (KN)",
      val: 0,
    },
    {
      label: "Bolt Column (nos)",
      val: 0,
    },
    {
      label: "Bolt Rows (nos)",
      val: 0,
    },
  ],
  Plate: [
    {
      label: "Thickness (mm)",
      val: 0,
    },
    {
      label: "Height (mm)",
      val: 0,
    },
    {
      label: "Length (mm)",
      val: 0,
    },
  ],
  Weld: [
    {
      label: "Size (mm)",
      val: 0,
    },
    {
      label: "Strength (N/mm2)",
      val: 0,
    },
    {
      label: "Stress (N/mm)",
      val: 0,
    },
  ],
};

const platePopUpFields = [
  "Shear Yielding Capacity (kN)",
  "Rupture Capacity (kN)",
  "Block Shear Capacity (kN)",
  "Tension Yielding Capacity (kN)",
  "Tension Rupture Capacity (kN)",
  "Axial Block Shear Capacity (kN)",
  "Moment Demand (kNm)",
  "Moment Capacity (kNm)",
  "Moment Demand per Bolt (kNm)",
  "Moment Capacity per Bolt (kNm)",
];
const boltPopUpFields = [
  "Pitch Distance (mm)",
  "End Distance (mm)",
  "Edge Distance (mm)",
  "Gauge Distance (mm)",
  "Shear Capacity (kN)",
  "Bearing Capacity (kN)",
  "β<sub>lj</sub>",
  "β<sub>lg</sub>",
  "β<sub>pk</sub>",
  "Bolt Prying Force (kN)",
  "Total Bolt Tension (kN)",
  "Interaction Ratio",
];

const EndPlateOutputDock = ({ output }) => {
  const [BoltspacingModel, setBoltSpacingModel] = useState(false);
  const [PlatecapacityModel, setPlateCapacityModel] = useState(false);
  const [BoltcapacityModel, setBoltCapacityModel] = useState(false);

  // console.log('output : ' , output, output && Object.keys(output).length)
  const handleDialogSpacing = (value) => {
    if (value === "BoltSpacing") {
      setBoltSpacingModel(true);
    } else if (value === "PlateCapacity") {
      setPlateCapacityModel(true);
    } else if (value == "BoltCapacity") {
      setBoltCapacityModel(true);
    } else {
      setBoltSpacingModel(false);
      setPlateCapacityModel(false);
      setBoltSpacingModel(false);
    }
  };

  // console.log(output)

  return (
    <>
      <p>Output Dock</p>
      <div className="subMainBody scroll-data">
        {output && Object.keys(output).length ? (
          Object.keys(output).map((key, index) => {
            return (
              <>
                <div key={index}>
                  <h3>{key}</h3>
                  <div>
                    {Object.values(output[key]).map((elm, index1) => {
                      if (
                        key == "Plate" &&
                        platePopUpFields.includes(elm.label)
                      )
                        return <></>;
                      else if (
                        key == "Bolt" &&
                        boltPopUpFields.includes(elm.label)
                      )
                        return <></>;
                      return (
                        <div key={index1} className="component-grid">
                          <div className="component-grid-align">
                            <h4>{elm.label}</h4>
                            <Input
                              type="text"
                              style={{
                                color: "rgb(0 0 0 / 67%)",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                              name={`${key}_${elm.lable}`}
                              value={elm.val}
                              disabled
                            />
                          </div>

                          {key == "Plate" &&
                            index1 ==
                              Object.values(output[key])?.length - 1 && (
                              <>
                                <div className="component-grid-align">
                                  <h4>Capacity</h4>
                                  <Input
                                    className="btn"
                                    type="button"
                                    value="Capacity details"
                                    onClick={() =>
                                      handleDialogSpacing("PlateCapacity")
                                    }
                                  />
                                </div>
                              </>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {key == "Bolt" && (
                  <>
                    <div className="component-grid">
                      <div className="component-grid-align">
                        <h4>Capacity Details</h4>
                        <Input
                          className="btn"
                          type="button"
                          value="details"
                          onClick={() => handleDialogSpacing("BoltCapacity")}
                        />
                      </div>
                      <div className="component-grid-align">
                        <h4>Spacing</h4>
                        <Input
                          className="btn"
                          type="button"
                          value="Spacing details"
                          onClick={() => handleDialogSpacing("BoltSpacing")}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            );
          })
        ) : (
          <>
            {Object.keys(placeholderOutput).map((key, index) => {
              return (
                <>
                  <div key={index}>
                    <h3>{key}</h3>
                    <div>
                      {Object.values(placeholderOutput[key]).map(
                        (elm, index1) => {
                          if (
                            key == "Plate" &&
                            platePopUpFields.includes(elm.label)
                          )
                            return <></>;
                          else if (
                            key == "Bolt" &&
                            boltPopUpFields.includes(elm.label)
                          )
                            return <></>;
                          return (
                            <div
                              key={index1}
                              className="component-grid"
                              style={{ userSelect: "none" }}
                            >
                              <div className="component-grid-align">
                                <h4>{elm.label}</h4>
                                <Input
                                  type="text"
                                  style={{
                                    color: "rgb(0 0 0 / 67%)",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                  }}
                                  name={`${key}_${elm.lable}`}
                                  value={" "}
                                  disabled
                                />
                              </div>
                              {key !== "Weld" &&
                                index1 ==
                                  Object.values(placeholderOutput[key])
                                    ?.length -
                                    1 && (
                                  <>
                                    <div className="component-grid-align">
                                      <h4>
                                        {key == "Bolt" ? "Spacing" : "Capacity"}
                                      </h4>

                                      <Input
                                        className="btn"
                                        type="button"
                                        value={
                                          key === "Bolt"
                                            ? "Spacing"
                                            : "Capacity"
                                        }
                                        // onClick={() => handleDialogSpacing(key === "Bolt" ? "Spacing" : "Capacity")}
                                        disabled
                                      />
                                    </div>
                                  </>
                                )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </>
              );
            })}
          </>
        )}
      </div>

      {/* Plate capacity details  */}
      <Modal
        visible={PlatecapacityModel}
        onCancel={() => setPlateCapacityModel(false)}
        footer={null}
        width={"35%"}
		height={"50vh"}
      >
        <>
          <p>Capacity Details</p>
          <div className="details-main-body">
            <div className="details-main-body-capacity">
              <div className="details-main-body-align">
                <p>Shear Yielding Capacity (kN)</p>

                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Plate &&
                      output?.Plate[
                        output?.Plate.findIndex(
                          (val) => val.label == "Shear Yielding Capacity (kN)"
                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
              <div className="details-main-body-align">
                <p>Block Shear Capacity (kN)</p>


                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Plate &&
                      output?.Plate[
                        output?.Plate.findIndex(
                          (val) => val.label == "Block Shear Capacity (kN)"

                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
              <div className="details-main-body-align">
                <p>Moment Demand per Bolt (kNm)</p>

                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Plate &&
                      output?.Plate[
                        output?.Plate.findIndex(
                          (val) => val.label == "Moment Demand per Bolt (kNm)"
                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
              <div className="details-main-body-align">
                <p>Moment Capacity per Bolt (kNm)</p>
                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Plate &&
                      output?.Plate[
                        output?.Plate.findIndex(
                          (val) => val.label == "Moment Capacity per Bolt (kNm)"
                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
            </div>
          </div>
        </>
      </Modal>

      <Modal
        visible={BoltspacingModel}
        onCancel={() => setBoltSpacingModel(false)}
        footer={null}
        width={"50%"}
      >
        <p>Spacing Details</p>
        <div>
          <p
            style={{
              padding: "20px",
            }}
          >
            Note: Representative image for Spacing Details -3 x 3 pattern
            considered
          </p>
        </div>
        <div className="spacing-main-body">
          <h3>Spacing Details</h3>
          <div className="spacing-main-two">
            <div className="spacing-left-body">
              <div className="spacing-left-body-align">
                <p>Pitch Distance (mm)</p>
                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Bolt &&
                      output?.Bolt[
                        output?.Bolt.findIndex(
                          (val) => val.label == "Pitch Distance (mm)"
                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
              <div className="spacing-left-body-align">
                <p>End Distance (mm)</p>
                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Bolt &&
                      output?.Bolt[
                        output?.Bolt.findIndex(
                          (val) => val.label == "End Distance (mm)"
                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
              <div className="spacing-left-body-align">
                <p>Gauge Distance (mm)</p>
                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Bolt &&
                      output?.Bolt[
                        output?.Bolt.findIndex(
                          (val) => val.label == "Gauge Distance (mm)"
                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
              <div className="spacing-left-body-align">
                <p>Edge Distance (mm)</p>
                <Input
                  type="text"
                  style={{
                    color: "rgb(0 0 0 / 67%)",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                  readOnly={true}
                  value={
                    (output &&
                      output.Bolt &&
                      output?.Bolt[
                        output?.Bolt.findIndex(
                          (val) => val.label == "Edge Distance (mm)"
                        )
                      ]?.val) ||
                    "0"
                  }
                />
              </div>
            </div>
            <div className="spacing-right-body">
              <img
                src={spacingIMG}
                alt="SpacingImage"
                width="400"
                height="300"

              />
            </div>
          </div>
        </div>
        {/*  */}
      </Modal>

      {/* Bolt Capacity Modal */}
      <Modal
        visible={BoltcapacityModel}
        onCancel={() => setBoltCapacityModel(false)}
        footer={null}
        width={"30%"}
        style={{ height: "50vh" }}
      >
        <p>Details</p>
        <div className="details-main-body">
          <div className="details-main-body-inside">
            <div className="details-main-body-align">
              <p>Shear Capacity (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Shear Capacity (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Bearing Capacity (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Bearing Capacity (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>
                β<sub>lj</sub>
              </p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "β<sub>lj</sub>"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>
                β<sub>lg</sub>
              </p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "β<sub>lg</sub>"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>
                β<sub>pk</sub>
              </p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "β<sub>pk</sub>"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Bolt Value (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Bolt Value (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Bolt Tension Capacity (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Bolt Tension Capacity (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Bolt Shear Force (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Bolt Shear Force (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Bolt Tension Force (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Bolt Tension Force (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Bolt Prying Force (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Bolt Prying Force (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Total Bolt Tension (kN)</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Total Bolt Tension (kN)"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
            <div className="details-main-body-align">
              <p>Interaction Ratio</p>
              <Input
                type="text"
                style={{
                  color: "rgb(0 0 0 / 67%)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
                readOnly={true}
                value={
                  (output &&
                    output.Bolt &&
                    output?.Bolt[
                      output?.Bolt.findIndex(
                        (val) => val.label == "Interaction Ratio"
                      )
                    ]?.val) ||
                  "0"
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};


export default EndPlateOutputDock;
