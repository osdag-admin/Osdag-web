import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { getOptionsForField, getListForInputKey } from '../utils/fieldOptionUtils';
import FRM from "../../../assets/flush_ep.png";
import EOWIM from "../../../assets/owe_ep.png";
import EBWRM from "../../../assets/extended.png";
import CFBW from "../../../assets/ShearConnection/sc_fin_plate/fin_cf_bw.png";
import CWBW from "../../../assets/ShearConnection/sc_fin_plate/fin_cw_bw.png";
import BB from "../../../assets/ShearConnection/sc_fin_plate/fin_beam_beam.png";
import BC_CF_BW_FLUSH from "../../../assets/BC_CF-BW-Flush.png";
import BC_CF_BW_EOW from "../../../assets/BC_CF-BW-EOW.png";
import BC_CF_BW_EBW from "../../../assets/BC_CF-BW-EBW.png";
import BC_CW_BW_FLUSH from "../../../assets/BC_CW-BW-Flush.png";
import BC_CW_BW_EOW from "../../../assets/BC_CW-BW-EOW.png";
import BC_CW_BW_EBW from "../../../assets/BC_CW-BW-EBW.png";
import ANGLE_SECTION from "../../../assets/TensionMember/com1_1.png";
import BACK_TO_BACK_ANGLES_SAME_SIDE from "../../../assets/TensionMember/com1_2.png";
import BACK_TO_BACK_ANGLES_OPPOSITE_SIDE from "../../../assets/TensionMember/com1_3.png";
import ErrorImg from "../../../assets/notSelected.png";

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
  setExtraState = () => { },
  updateSelectedItems = () => { },
  setModalDynamicSrc,
}) => {
  const safeInputs = inputs || {};
  const safeContextData = contextData || {};
  const [imageSource, setImageSource] = useState("");

  // Styling object for react-select to fix z-index and other container issues
  const customSelectStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    option: (base) => ({
      ...base,
      minHeight: 35,
      lineHeight: '1',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    control: (base) => ({
      ...base,
      borderColor: '#000',
      '&:hover': {
        borderColor: '#91B014',
      },
    }),
    menu: (base) => ({
      ...base,
      minWidth: 'max-content',
    }),
  };


  // Helper to normalize lists into react-select option shape
  const toSelectOptions = (list = []) => {
    if (!list || list.length === 0) return [];
    if (typeof list[0] === 'object' && list[0] !== null) {
      // If already in { value, label } shape, keep it
      if ('value' in list[0] && 'label' in list[0]) {
        return list;
      }
      // Otherwise normalize using common keys; fallback to stringified object
      return list.map((item) => {
        const val =
          item.value ??
          item.label ??
          item.Grade ??
          item.grade ??
          item.Designation ??
          item.designation ??
          item.name ??
          item.section ??
          item.id ??
          String(item);
        return { value: val, label: val };
      });
    }
    return list.map(item => ({ value: item, label: item }));
  };


  useEffect(() => {
    // Check for section profile first (takes priority)
    const sectionProfileField = section.fields.find(
      (f) => f.type === 'sectionProfileSelect'
    );
    if (sectionProfileField) {
      const profileValue = extraState.selectedProfile || safeInputs[sectionProfileField.key] || sectionProfileField.defaultValue;
      if (profileValue) {
        const sectionProfileMap = {
          "Angles": ANGLE_SECTION,
          "Back to Back Angles - Same side of gusset": BACK_TO_BACK_ANGLES_SAME_SIDE,
          "Back to Back Angles - Opposite side of gusset": BACK_TO_BACK_ANGLES_OPPOSITE_SIDE,
        };
        setImageSource(sectionProfileMap[profileValue] || ErrorImg);
        return; // Exit early if section profile is found
      }
    }

    // Handle connectivity/endplate images
    if (extraState.selectedOption) {
      const conn = safeInputs.connectivity;
      const epType = extraState.selectedOption;
      console.log(conn + "  " + epType);
      const imageMap = {
        "Column-Flange-Beam-Web": {
          "Flushed - Reversible Moment": BC_CF_BW_FLUSH,
          "Extended One Way - Irreversible Moment": BC_CF_BW_EOW,
          "Extended Both Ways - Reversible Moment": BC_CF_BW_EBW,
        },
        "Column-Web-Beam-Web": {
          "Flushed - Reversible Moment": BC_CW_BW_FLUSH,
          "Extended One Way - Irreversible Moment": BC_CW_BW_EOW,
          "Extended Both Ways - Reversible Moment": BC_CW_BW_EBW,
        },
        "Flushed - Reversible Moment": FRM, "Extended One Way - Irreversible Moment": EOWIM, "Extended Both Ways - Reversible Moment": EBWRM,
        "Column Flange-Beam-Web": CFBW, "Column Web-Beam-Web": CWBW, "Beam-Beam": BB,
      };

      const selectedImage = imageMap[conn]?.[epType] || imageMap[extraState.selectedOption] || ErrorImg;
      setImageSource(selectedImage);
    }
  }, [extraState.selectedOption, safeInputs.connectivity]);

  // Set default selected values when lists/options arrive
  useEffect(() => {
    section.fields.forEach((field) => {
      if (field.type !== 'select') return;

      const rawList = getOptionsForField(field, safeContextData, safeInputs);
      if (!rawList || rawList.length === 0) return;

      const isCustomizable = Boolean(field.selectionKey);
      if (isCustomizable) return;

      // Determine first option value
      const first = rawList[0];
      const firstValue = typeof first === 'object' && first !== null && 'value' in first ? first.value
        : (typeof first === 'object' && first !== null && 'Grade' in first ? first.Grade : first);

      const current = safeInputs[field.key];
      const opts = toSelectOptions(rawList);
      const currentExistsInOptions = opts.some(opt => opt.value === current);

      if (current === undefined || current === null || current === '' || !currentExistsInOptions) {
        setInputs((prev) => ({ ...prev, [field.key]: firstValue }));
      }
    });

    // Set default for connectivity / endplate dropdowns
    const connectivityField = section.fields.find(
      (f) => f.type === 'connectivitySelect' || f.type === 'endPlateSelect'
    );
    const list = connectivityField?.type === 'connectivitySelect'
      ? (safeContextData.connectivityList || [])
      : [
        'Flushed - Reversible Moment',
        'Extended One Way - Irreversible Moment',
        'Extended Both Ways - Reversible Moment',
      ];
    if (connectivityField && !extraState.selectedOption && list && list.length > 0) {
      const first = list[0];
      const firstValue = typeof first === 'object' && first !== null && 'value' in first ? first.value
        : (typeof first === 'object' && first !== null && 'Grade' in first ? first.Grade : first);
      setExtraState((prev) => ({ ...prev, selectedOption: firstValue }));
    }

    // Set default for section profile dropdowns
    const sectionProfileField = section.fields.find(
      (f) => f.type === 'sectionProfileSelect'
    );
    if (sectionProfileField && !extraState.selectedProfile) {
      const currentValue = safeInputs[sectionProfileField.key] || sectionProfileField.defaultValue;
      if (currentValue) {
        setExtraState((prev) => ({ ...prev, selectedProfile: currentValue }));
      }
    }
  }, [safeContextData, section.fields]);

  const handleCustomizableSelect = (field, value) => {
    const getAllValuesForInputKey = (inputKey) => {
      if (field?.getDynamicDataSource) {
        const options = field.getDynamicDataSource(inputs, contextData);
        setModalDynamicSrc((modalDynSrc) => ({ ...modalDynSrc, [field.key]: options }));
        return options;
      }
      return getListForInputKey(inputKey, safeContextData, field.dataSource);
    };

    if (value === "Customized") {
      // Get all available values
      const allValues = getAllValuesForInputKey(field.key);
      // Convert to array of keys/strings for Transfer component
      const allKeys = allValues.map(val => {
        // Handle different data formats (object with value/Grade property, or plain string/number)
        if (typeof val === 'object' && val !== null) {
          return val.value || val.Grade || val.toString();
        }
        return val.toString();
      });

      // Set all items as selected (moved to right side) - this populates the Transfer component
      updateSelectedItems(field.key, allKeys);
      // Also update inputs with all values
      setInputs({ ...safeInputs, [field.key]: allKeys });
      updateSelectionState(field.selectionKey, "Customized");
      updateModalState(field.modalKey, true);
      toggleAllSelected(field.key, false);
    } else {
      // "All" option - get all values and set them in inputs 
      const allValues = getAllValuesForInputKey(field.key);
      // Convert to array format if needed
      const allValuesArray = allValues.map(val => {
        if (typeof val === 'object' && val !== null) {
          return val.value || val.Grade || val.toString();
        }
        return val.toString();
      });
      setInputs({ ...safeInputs, [field.key]: allValuesArray });
      // Clear selectedItems since we're using "All" (not managed via Transfer)
      updateSelectedItems(field.key, []);
      updateSelectionState(field.selectionKey, "All");
      updateModalState(field.modalKey, false);
      toggleAllSelected(field.key, true); // fix allSelected flag not triggering
    }
  };

  const renderField = (field) => {
    if (field.conditionalDisplay && !field.conditionalDisplay(extraState, safeInputs)) return null;

    switch (field.type) {
      case 'select': {
        const isCustomizable = Boolean(field.selectionKey) && !(field.key.includes("plate1") || field.key.includes("plate2"));
        const rawList = getOptionsForField(field, safeContextData, safeInputs);
        const options = toSelectOptions(rawList);

        if (isCustomizable) {
          const isCustomized = selectionStates?.[field.selectionKey] === 'Customized';
          if (!isCustomized) {
            return (
              <Select
                value={{ label: "All", value: "All" }}
                isDisabled={true}
                styles={customSelectStyles}
                classNamePrefix="react-select"
                className="w-[60%]"
                isSearchable={false}
              />
            );
          }
          const currentValue = (Array.isArray(safeInputs[field.key]) ? safeInputs[field.key] : [])
            .map(val => ({ value: val, label: val }));

          return (
            <Select
              isMulti
              options={options}
              value={currentValue}
              isSearchable={false}
              onChange={(selectedOptions) => {
                const newValues = selectedOptions.map(opt => opt.value);
                setInputs({ ...safeInputs, [field.key]: newValues });
              }}
              menuPortalTarget={document.body}
              styles={customSelectStyles}
              classNamePrefix="react-select"
              className="w-[60%]"
            />
          );
        }

        if (!rawList || rawList.length === 0) {
          return (
            <Select
              isDisabled={true}
              placeholder="No data available"
              styles={customSelectStyles}
              classNamePrefix="react-select"
              className="w-[60%]"
              isSearchable={false}
            />
          );
        }

        const value = options.find(opt => opt.value === safeInputs[field.key]);

        return (
          <Select
            options={options}
            value={value}
            isSearchable={false}
            onChange={(selected) => setInputs({ ...safeInputs, [field.key]: selected.value })}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
          />
        );
      }

      case 'connectivitySelect':
      case 'endPlateSelect': {
        const list = field.type === 'connectivitySelect' ? (safeContextData.connectivityList || []) : Object.keys({
          "Flushed - Reversible Moment": "", "Extended One Way - Irreversible Moment": "", "Extended Both Ways - Reversible Moment": ""
        });
        const options = toSelectOptions(list);
        const value = options.find(opt => opt.value === extraState.selectedOption);
        return (
          <Select
            options={options}
            value={value}
            isSearchable={false}
            onChange={(selected) => {
              setExtraState({ ...extraState, selectedOption: selected.value });
              setInputs({ ...safeInputs, output: null });
            }}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
          />
        );
      }

      case 'sectionProfileSelect': {
        const rawOptions = getOptionsForField(field, safeContextData, safeInputs);
        const options = toSelectOptions(rawOptions);
        const currentValue = safeInputs[field.key] || field.defaultValue;
        const value = options.find(opt => opt.value === currentValue);
        return (
          <Select
            options={options}
            value={value}
            isSearchable={false}
            onChange={(selected) => {
              setExtraState({ ...extraState, selectedProfile: selected.value });
              if (field.onChange) {
                field.onChange(selected.value, safeInputs, setInputs, safeContextData, extraState, setExtraState);
              } else {
                setInputs({ ...safeInputs, [field.key]: selected.value });
              }
            }}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
          />
        );
      }

      case 'customizable': {
        const options = [{ value: "All", label: "All" }, { value: "Customized", label: "Customized" }];
        const value = options.find(opt => opt.value === (selectionStates?.[field.selectionKey] || "All"));
        return (
          <Select
            options={options}
            value={value}
            isSearchable={false}
            onChange={(selected) => handleCustomizableSelect(field, selected.value)}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
          />
        );
      }

      case 'sectionProfileList': {
        const rawSectionList = getOptionsForField(field, safeContextData, safeInputs);
        const options = (rawSectionList || []).map((elem) => ({ value: elem, label: elem }));
        const value = options.find(opt => opt.value === inputs.section_profile);
        return (
          <Select
            options={options}
            value={value}
            onChange={(selected) => field.onChange(selected.value, inputs, setInputs, contextData, extraState, setExtraState)}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
            isSearchable={false}
          />);
      }
      case 'dynamicSelect': {
        const options = getOptionsForField(field, safeContextData, safeInputs);
        const value = options.find(opt => opt.value === inputs[field.key]);
        return (
          <Select
            options={options}
            value={value}
            onChange={(selected) => setInputs({ ...inputs, [field.key]: selected.value })}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
            isSearchable={false}
          />
        );
      }
      case 'image':
        return (<>{field.conditionalDisplay() &&
          <div className="flex justify-center">
            <img
              src={field.imageSource(extraState, safeInputs)}
              alt="Connection type"
              style={{ width: field.width || '100px', height: field.height || '100px', objectFit: 'contain' }}
            /></div>}</>);

      case 'number':
      default:
        return (
          <div className="w-[60%]">
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={safeInputs[field.key] ?? ""}
              onChange={(e) => setInputs({ ...safeInputs, [field.key]: e.target.value })}
              placeholder={field.placeholder || `ex. ${field.label}`}
              disabled={field.disabled}
              className="w-full h-9 border border-gray-400 rounded-md px-3 text-sm focus:border-osdag-green focus:ring-2 focus:ring-osdag-green/20 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-osdag-dark-color/90 border-2 border-osdag-green rounded-xl mb-5 mx-4 shadow-sm relative pt-4">
      <h3 className="text-base font-bold text-osdag-text-primary dark:text-white bg-white dark:bg-osdag-dark-color px-1 absolute -top-4 left-4">
        {section.title}
      </h3>
      <div className="flex flex-col w-full p-4 pt-2">
        {section.fields.map((field, index) => {
          // Entire label+input row is hidden if conditionalDisplay fails
          if (field.conditionalDisplay && !field.conditionalDisplay(extraState, safeInputs)) return null;
          return (
            <div key={index}>
              <div className="flex w-full justify-between items-center mb-3">
                <h4 className="w-[40%] text-sm font-medium text-osdag-text-primary dark:text-white">
                  {field.label}
                </h4>
                {renderField(field)}
              </div>
              {(field.type === 'connectivitySelect' || field.type === 'endPlateSelect') && imageSource && (
                <div className="flex justify-center">
                  <img
                    src={imageSource}
                    alt="Connection type"
                    className="w-[150px] h-[100px] object-contain"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
