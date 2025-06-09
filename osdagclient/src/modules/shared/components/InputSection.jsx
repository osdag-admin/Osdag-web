import React, { useState, useEffect } from "react";
import { Select, Input } from "antd";
import FRM from "../../../assets/flush_ep.png";
import EOWIM from "../../../assets/owe_ep.png";
import EBWRM from "../../../assets/extended.png";
import ErrorImg from "../../../assets/notSelected.png";

const { Option } = Select;

export const InputSection = ({
  section,
  inputs,
  setInputs,
  selectionStates,
  updateSelectionState,
  updateModalState,
  toggleAllSelected,
  contextData,
  extraState = {},
  setExtraState = () => {},
}) => {
  const [imageSource, setImageSource] = useState("");

  // Handle end plate type selection with image
  useEffect(() => {
    if (extraState.selectedOption) {
      const imageMap = {
        "Flushed - Reversible Moment": FRM,
        "Extended One Way - Irreversible Moment": EOWIM,
        "Extended Both Ways - Reversible Moment": EBWRM,
      };
      setImageSource(imageMap[extraState.selectedOption] || ErrorImg);
    }
  }, [extraState.selectedOption]);

  const handleCustomizableSelect = (field, value) => {
    if (value === "Customized") {
      if (inputs[field.key].length !== 0) {
        setInputs({ ...inputs, [field.key]: inputs[field.key] });
      } else {
        setInputs({ ...inputs, [field.key]: [] });
      }
      updateSelectionState(field.selectionKey, "Customized");
      toggleAllSelected(field.key, false);
      updateModalState(field.modalKey, true);
    } else {
      updateSelectionState(field.selectionKey, "All");
      toggleAllSelected(field.key, true);
      updateModalState(field.modalKey, false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case "select":
        if (field.options === "beamList") {
          return (
            <Select
              value={inputs[field.key] || contextData.beamList[2]}
              onSelect={(value) => setInputs({ ...inputs, [field.key]: value })}
            >
              {contextData.beamList?.map((item, index) => (
                <Option key={index} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          );
        } else if (field.options === "materialList") {
          return (
            <Select
              value={inputs[field.key] || contextData.materialList[0].Grade}
              onSelect={(value) => {
                if (field.onChange) {
                  field.onChange(
                    value,
                    inputs,
                    setInputs,
                    contextData.materialList
                  );
                } else {
                  setInputs({ ...inputs, [field.key]: value });
                }
              }}
            >
              {contextData.materialList?.map((item, index) => (
                <Option key={index} value={item.id}>
                  {item.Grade}
                </Option>
              ))}
            </Select>
          );
        } else if (field.options === "columnList") {
          return (
            <Select
              value={inputs[field.key] || contextData.columnList[0]}
              onSelect={(value) => setInputs({ ...inputs, [field.key]: value })}
            >
              {contextData.columnList?.map((item, index) => (
                <Option key={index} value={item}>
                  {item}
                </Option>
              ))}
            </Select>
          );
        } else {
          return (
            <Select
              value={inputs[field.key]}
              onSelect={(value) => setInputs({ ...inputs, [field.key]: value })}
            >
              {field.options.map((option, index) => (
                <Option
                  key={index}
                  value={option.value || option}
                  disabled={option.disabled}
                >
                  {option.label || option}
                </Option>
              ))}
            </Select>
          );
        }

      case "endPlateSelect":
        const conn_map = {
          "Flushed - Reversible Moment": "Flushed - Reversible Moment",
          "Extended One Way - Irreversible Moment":
            "Extended One Way - Irreversible Moment",
          "Extended Both Ways - Reversible Moment":
            "Extended Both Ways - Reversible Moment",
        };

        return (
          <Select
            onSelect={(value) => {
              setExtraState({ ...extraState, selectedOption: value });
              setInputs({ ...inputs, output: null });
            }}
            value={extraState.selectedOption}
          >
            {Object.keys(conn_map).map((item, index) => (
              <Option key={index} value={item}>
                {conn_map[item]}
              </Option>
            ))}
          </Select>
        );

      case "number":
        return (
          <Input
            type="text"
            onInput={(event) => {
              event.target.value = event.target.value.replace(/[^0-9.]/g, "");
            }}
            value={inputs[field.key]}
            onChange={(event) =>
              setInputs({ ...inputs, [field.key]: event.target.value })
            }
          />
        );

      case "customizable":
        return (
          <Select
            onSelect={(value) => handleCustomizableSelect(field, value)}
            value={selectionStates[field.selectionKey]}
          >
            <Option value="Customized">Customized</Option>
            <Option value="All">All</Option>
          </Select>
        );

      default:
        return (
          <Input
            value={inputs[field.key]}
            onChange={(event) =>
              setInputs({ ...inputs, [field.key]: event.target.value })
            }
          />
        );
    }
  };

  return (
    <div>
      <h3>{section.title}</h3>
      <div className="component-grid">
        {section.fields.map((field, index) => (
          <div key={index}>
            <div className="component-grid-align">
              <h4>{field.label}</h4>
              {renderField(field)}
            </div>
            {/* Render image separately for endPlateSelect type */}
            {field.type === "endPlateSelect" && imageSource && (
              <div className="connectionimg">
                <img
                  src={imageSource}
                  alt="Component"
                  height="100px"
                  width="100px"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
