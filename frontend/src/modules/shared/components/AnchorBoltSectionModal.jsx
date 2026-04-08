import React, { useContext, useState, useEffect } from "react";
import { ModuleContext } from "../../../context/ModuleState";
import { Input, Select, Button } from "antd";
import CustomSectionModal from "./CustomSectionModal";
import Slope_Beam from "../../../assets/Slope_Beam.png";

const { Option } = Select;

const readOnlyFontStyle = {
  color: "rgb(0 0 0 / 67%)",
  fontSize: "12px",
  fontWeight: "600",
};

const AnchorBoltSectionModal = ({
  supportingSectionData,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
}) => {
  const {
    materialList,
    updateSourceAndMechType,
    getMaterialDetails,
    supporting_material_details,
  } = useContext(ModuleContext);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const material = materialList.filter(
      (value) => value.Grade === designPrefInputs.supporting_material
    );
    getMaterialDetails({ data: material[0], type: "supporting" });
  }, []);

  const handleDownload = () => {
    const fileName = "Columns_Details.xlsx";
  
    const link = document.createElement("a");
    link.href = `/downloads/${fileName}`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
  
      <div className="col-beam-cont">
        {/* Left Section */}
        <div className="col-left">
        <h4>Inputs</h4>
        <div className="sub-container">
        <h4>Anchor Bolt Outside Column Flange</h4>

        <div className="input-cont">
            <h5>Designation</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Anchor Bolt Type</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Anchor Bolt Galvanized?</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Anchor Bolt Hole Type</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Total Length (mm)</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Material Grade, Fu (Mpa)</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <h4>Anchor Bolt Inside Column Flange</h4>
        <div className="input-cont">
            <h5>Designation</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Anchor Bolt Type</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Anchor Bolt Galvanized?</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Anchor Bolt Hole Type</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Total Length (mm)</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <div className="input-cont">
            <h5>Material Grade, Fu (Mpa)</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
        <h4>General</h4>
        <div className="input-cont">
            <h5>Friction Coefficient (between concrete and  anchor bolt)</h5>
            <Input
              type="text"
              name="Designation"
              className="input-design-pref"
              // value={supportingSectionData.Designation}
              value={designPrefInputs.Designation}
              // disabled
              style={readOnlyFontStyle}
            />
        </div>
          
          </div>
            
          

        </div>
              </div>
      
      <CustomSectionModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInputValues={setDesignPrefInputs}
        inputValues={designPrefInputs}
        type="supporting"
      />

      
    </>
  );
};

export default AnchorBoltSectionModal;