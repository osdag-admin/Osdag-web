import React, { useState, useEffect, useContext } from "react";
import { Modal, Input, Button } from "antd";
import { ModuleContext } from "../../../context/ModuleState";
import { isGuestUser } from "../../../utils/auth";

const CustomSectionModal = ({
  showModal,
  setShowModal,
  setInputValues,
  inputValues,
  type = "supported",
  materialList: materialsFromParent,
}) => {
  const {
    manageDesignPreferences,
    manageCustomMaterials,
    materialList: ctxMaterialList,
  } = useContext(ModuleContext);
  const materialList = materialsFromParent ?? ctxMaterialList ?? [];
  const [inputs, setInputs] = useState({
    fy_20: "",
    fy_20_40: "",
    fy_40: "",
    fu: "",
  });
  const [grade, setGrade] = useState("Cus____");
  const canSaveToDatabase = !isGuestUser();

  useEffect(() => {
    let arr = "Cus____".split("_");
    if (inputs.fy_20 !== "") arr[1] = inputs.fy_20;
    if (inputs.fy_20_40 !== "") arr[2] = inputs.fy_20_40;
    if (inputs.fy_40 !== "") arr[3] = inputs.fy_40;
    if (inputs.fu !== "") arr[4] = inputs.fu;

    setGrade(arr.join("_"));
  }, [inputs]);

  const handleSubmit = (inCache = true) => {
    if (!inputs.fy_20 || !inputs.fy_20_40 || !inputs.fy_40 || !inputs.fu) {
      alert("Please fill the missing parameters.");
      return;
    }

    if (!validateInput(inputs)) {
      return;
    }

    if (inCache) {
      const key = "osdag-custom-materials";
      const customSectionData = {
        id: Math.round(Math.random() * 1000),
        Grade: grade,
        Yield_Stress_less_than_20: parseInt(inputs.fy_20),
        Yield_Stress_between_20_and_neg40: parseInt(inputs.fy_20_40),
        Yield_Stress_greater_than_40: parseInt(inputs.fy_40),
        Ultimate_Tensile_Stress: parseInt(inputs.fu),
        Elongation: null,
      };

      const prevData = JSON.parse(localStorage.getItem("osdag-custom-materials"));

      let presentItemsInCaches = null;
      if (prevData)
        presentItemsInCaches = prevData.filter((item) => item.Grade === grade);
      presentItemsInCaches = materialList.filter((item) => item.Grade === grade);

      if (presentItemsInCaches && presentItemsInCaches.length > 0) {
        alert("The material is already present");
        setShowModal(false);
        setGrade("Cus____");
        setInputs({
          fy_20: "",
          fy_20_40: "",
          fy_40: "",
          fu: "",
        });
        return;
      }

      let newData = [];
      if (prevData) newData = [...prevData, customSectionData];
      else newData = [customSectionData];

      localStorage.setItem(key, JSON.stringify(newData));
      alert("Data added successfully");
      if (type === "supported") {
        setInputValues({ ...inputValues, supported_material: grade });
      } else if (type === "supporting") {
        setInputValues({ ...inputValues, supporting_material: grade });
      } else if (type === "connector") {
        setInputValues({ ...inputValues, connector_material: grade });
      }

      manageDesignPreferences("material_update", {
        materialType: type,
        materialData: customSectionData,
      });
      manageCustomMaterials("sync");
    } else {
      handleCustomMat();
    }

    setShowModal(false);
    setGrade("Cus____");
    setInputs({
      fy_20: "",
      fy_20_40: "",
      fy_40: "",
      fu: "",
    });
  };

  const handleCustomMat = async () => {
    const result = await manageCustomMaterials("add", {
      grade,
      inputs,
      connectivity: "Column-Flange-Beam-Web",
      type,
    });
    if (result?.success === true) {
      if (type === "supported") {
        setInputValues({ ...inputValues, supported_material: grade });
      } else if (type === "supporting") {
        setInputValues({ ...inputValues, supporting_material: grade });
      } else if (type === "connector") {
        setInputValues({ ...inputValues, connector_material: grade });
      }
      manageDesignPreferences("material_update", {
        materialType: type,
        materialData: result?.data?.data ?? result?.data ?? { Grade: grade, ...inputs },
      });
      manageCustomMaterials("sync");
    }
  };

  const validateInput = (vals) => {
    const keys = ["fy_20", "fy_20_40", "fy_40", "fu"];
    for (const key of keys) {
      const value = vals[key];
      if (value && isNaN(value)) {
        alert("Invalid input. Please enter a valid number.");
        return false;
      }
    }
    return true;
  };

  const handleCancel = () => {
    setShowModal(false);
    setGrade("Cus____");
    setInputs({
      fy_20: "",
      fy_20_40: "",
      fy_40: "",
      fu: "",
    });
  };

  return (
    <Modal
      title="Custom Material"
      open={showModal}
      onOk={() => handleSubmit(true)}
      onCancel={handleCancel}
      okText="Save to cache"
      cancelText="Cancel"
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="cache"
          type="primary"
          onClick={() => handleSubmit(true)}
        >
          Save to cache
        </Button>,
        <Button
          key="db"
          type="dashed"
          onClick={() => handleSubmit(false)}
          disabled={!canSaveToDatabase}
        >
          Save to database
        </Button>,
      ]}
    >
      <div className="custom-section-modal">
        <Input
          placeholder="Yield Strength Fy (0-20mm)"
          value={inputs.fy_20}
          onChange={(e) => setInputs({ ...inputs, fy_20: e.target.value })}
        />
        <Input
          placeholder="Yield Strength Fy (20-40mm)"
          value={inputs.fy_20_40}
          onChange={(e) => setInputs({ ...inputs, fy_20_40: e.target.value })}
        />
        <Input
          placeholder="Yield Strength Fy (>40mm)"
          value={inputs.fy_40}
          onChange={(e) => setInputs({ ...inputs, fy_40: e.target.value })}
        />
        <Input
          placeholder="Ultimate Tensile Stress Fu"
          value={inputs.fu}
          onChange={(e) => setInputs({ ...inputs, fu: e.target.value })}
        />
      </div>
    </Modal>
  );
};

export default CustomSectionModal;

