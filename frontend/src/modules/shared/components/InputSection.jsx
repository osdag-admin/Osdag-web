/* eslint-disable react/prop-types */
import { useState, useEffect, useContext } from 'react';
import Select, { components } from 'react-select';
import { Modal } from 'antd';
import { getOptionsForField, getListForInputKey } from '../utils/fieldOptionUtils';
import { ModuleContext } from "../../../context/ModuleState";
import CustomMaterialModal from "./CustomMaterialModal";
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

const CustomOption = (props) => {
  return (
    <components.Option {...props}>
      <div
        onClick={(e) => {
          if (props.innerProps.onClick) {
            props.innerProps.onClick(e);
          }
          if (props.data.value === 'Customized') {
            props.selectProps.onCustomizedClick(props.selectProps.field);
          }
        }}
        className="w-full h-full"
      >
        {props.children}
      </div>
    </components.Option>
  );
};

export const InputSection = ({
  section,
  inputs,
  setInputs,
  isInputLocked,
  selectionStates,
  updateSelectionState,
  updateModalState,
  toggleAllSelected,
  contextData,
  extraState = {},
  setExtraState = () => { },
  updateSelectedItems = () => { },
  setModalDynamicSrc,
  onRefetchModuleOptions,
}) => {
  const safeInputs = inputs || {};
  const [imageSource, setImageSource] = useState("");
  const [showCustomMaterialModal, setShowCustomMaterialModal] = useState(false);
  const [customMaterialType, setCustomMaterialType] = useState("connector");
  // Field whose optimization bounds modal is open (for optimized_number fields)
  const [boundsModalField, setBoundsModalField] = useState(null);
  const { materialList: contextMaterialList = [] } = useContext(ModuleContext);
  const safeContextData = {
    ...(contextData || {}),
    materialList:
      contextMaterialList.length > 0
        ? contextMaterialList
        : contextData?.materialList || [],
  };

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
      if (conn && epType) {
        console.log(conn + "  " + epType);
      }
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

      const selectedImage = (conn ? imageMap[conn]?.[epType] : null) || imageMap[extraState.selectedOption] || ErrorImg;
      setImageSource(selectedImage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraState.selectedOption, safeInputs.connectivity]);

  useEffect(() => {
    setInputs((prev) => {
      let isChanged = false;
      const nextInputs = { ...prev };

      section.fields.forEach((field) => {
        if (field.type !== 'select' && field.type !== 'connectivitySelect' && field.type !== 'endPlateSelect') return;

        let rawList = getOptionsForField(field, safeContextData, prev);
        if (!rawList || rawList.length === 0) {
          if (field.type === 'connectivitySelect') {
            rawList = safeContextData.connectivityList || [];
          } else if (field.type === 'endPlateSelect') {
            rawList = safeContextData.endPlateList || [];
          }
        }

        if (!rawList || rawList.length === 0) return;

        const isCustomizable = Boolean(field.selectionKey);
        if (isCustomizable) return;

        // Determine first option value (1st element in array)
        const first = rawList[0];
        const firstValue = typeof first === 'object' && first !== null && 'value' in first ? first.value
          : (typeof first === 'object' && first !== null && 'Grade' in first ? first.Grade : first);

        const current = nextInputs[field.key];
        const opts = toSelectOptions(rawList);
        const currentExistsInOptions = opts.some(opt => {
          const s1 = String(opt.value).trim().toLowerCase().replace(/\s+/g, '');
          const s2 = String(current).trim().toLowerCase().replace(/\s+/g, '');
          return s1 === s2;
        });

        if (current === undefined || current === null || current === '' || !currentExistsInOptions) {
          nextInputs[field.key] = firstValue;
          isChanged = true;
        }
      });
      return isChanged ? nextInputs : prev;
    });

    // Set default for connectivity / endplate dropdowns in extraState
    const connectivityField = section.fields.find(
      (f) => f.type === 'connectivitySelect' || f.type === 'endPlateSelect'
    );
    let list = [];
    if (connectivityField) {
      list = getOptionsForField(connectivityField, safeContextData, safeInputs);
      if (!list || list.length === 0) {
        list = connectivityField.type === 'connectivitySelect'
          ? (safeContextData.connectivityList || [])
          : (safeContextData.endPlateList || []);
      }
    }
    if (connectivityField && list && list.length > 0) {
      const first = list[0];
      const firstValue = typeof first === 'object' && first !== null && 'value' in first ? first.value
        : (typeof first === 'object' && first !== null && 'Grade' in first ? first.Grade : first);

      const currentOpt = extraState.selectedOption;
      const opts = toSelectOptions(list);
      const optExists = opts.some(opt => String(opt.value).trim().toLowerCase() === String(currentOpt).trim().toLowerCase());

      if (!currentOpt || !optExists) {
        setExtraState((prev) => ({ ...prev, selectedOption: firstValue }));
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const isCurrentlyCustomized = selectionStates?.[field.selectionKey] === "Customized";
      if (!isCurrentlyCustomized) {
        // Set all items as selected (moved to right side) - this populates the Transfer component
        updateSelectedItems(field.key, allKeys);
        // Also update inputs with all values
        setInputs({ ...safeInputs, [field.key]: allKeys });
      }
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

  const renderNumericInput = (field, isNumeric) => (
    <div className="w-[60%]">
      <input
        type="text"
        inputMode={isNumeric ? 'decimal' : 'text'}
        value={safeInputs[field.key] ?? ""}
        onChange={(e) => {
          let val = e.target.value;
          if (isNumeric) {
            val = val.replace(/[^0-9.-]/g, '');
            const decimalCount = (val.match(/\./g) || []).length;
            if (decimalCount > 1) {
              const firstDecimalIdx = val.indexOf('.');
              val = val.slice(0, firstDecimalIdx + 1) + val.slice(firstDecimalIdx + 1).replace(/\./g, '');
            }
            if (val.includes('-')) {
              const isNegative = val.startsWith('-');
              val = val.replace(/-/g, '');
              if (isNegative) {
                val = '-' + val;
              }
            }
          }
          setInputs({ ...safeInputs, [field.key]: val });
        }}
        onKeyDown={(e) => {
          if (isNumeric) {
            const allowedKeys = [
              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
              'Home', 'End', 'ArrowLeft', 'ArrowRight', '.', '-'
            ];
            const isShortcut = (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase());

            if (e.key === ' ') {
              e.preventDefault();
              return;
            }

            if (!allowedKeys.includes(e.key) && !isShortcut && isNaN(Number(e.key))) {
              e.preventDefault();
            }
          }
        }}
        placeholder={field.placeholder || `ex. ${field.label}`}
        disabled={field.disabled || isInputLocked}
        className="w-full h-9 border border-gray-400 rounded-md px-3 text-sm focus:border-osdag-green focus:ring-2 focus:ring-osdag-green/20 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
      />
    </div>
  );

  const renderField = (field) => {
    if (field.conditionalDisplay && !field.conditionalDisplay(extraState, safeInputs)) return null;

    // Resolve a dynamic field type (e.g. plate girder switches between number and
    // customizable based on Customized vs Optimized design type).
    const effectiveType = typeof field.conditionalType === 'function'
      ? field.conditionalType(safeInputs)
      : field.type;

    switch (effectiveType) {
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
              isDisabled={isInputLocked}
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

        const isMaterialField = field.key?.includes('material');

        const value = options.find(opt => String(opt.value) === String(safeInputs[field.key]));

        return (
          <Select
            options={options}
            value={value}
            isDisabled={isInputLocked}
            isSearchable={false}
            onChange={(selected) => {
              if (isMaterialField && selected.value === 'Custom') {
                if (field.key.includes('supported')) setCustomMaterialType('supported');
                else if (field.key.includes('supporting')) setCustomMaterialType('supporting');
                else setCustomMaterialType('connector');
                setShowCustomMaterialModal(true);
                return;
              }
              setInputs({ ...safeInputs, [field.key]: selected.value });
            }}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
          />
        );
      }

      case 'connectivitySelect':
      case 'endPlateSelect': {
        let list = getOptionsForField(field, safeContextData, safeInputs);
        if (!list || list.length === 0) {
          list = field.type === 'connectivitySelect'
            ? (safeContextData.connectivityList || [])
            : (safeContextData.endPlateList || []);
        }
        const options = toSelectOptions(list);
        const value = options.find(opt => String(opt.value) === String(extraState.selectedOption || safeInputs[field.key])) || options[0] || null;
        return (
          <Select
            options={options}
            value={value}
            isDisabled={isInputLocked}
            isSearchable={false}
            onChange={(selected) => {
              setExtraState({ ...extraState, selectedOption: selected.value });
              if (field.onChange) {
                field.onChange(selected.value, safeInputs, setInputs, safeContextData, extraState, setExtraState);
              } else {
                setInputs({ ...safeInputs, [field.key]: selected.value, output: null });
              }
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
        const value = options.find(opt => String(opt.value) === String(currentValue));
        return (
          <Select
            options={options}
            value={value}
            isDisabled={isInputLocked}
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
        const value = options.find(opt => String(opt.value) === String(selectionStates?.[field.selectionKey] || "All"));
        return (
          <Select
            options={options}
            value={value}
            isDisabled={isInputLocked}
            isSearchable={false}
            onChange={(selected) => handleCustomizableSelect(field, selected.value)}
            menuPortalTarget={document.body}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            className="w-[60%]"
            components={{ Option: CustomOption }}
            onCustomizedClick={(f) => updateModalState(f.modalKey, true)}
            field={field}
          />
        );
      }

      case 'sectionProfileList': {
        const rawSectionList = getOptionsForField(field, safeContextData, safeInputs);
        const options = (rawSectionList || []).map((elem) => ({ value: elem, label: elem }));
        const value = options.find(opt => String(opt.value) === String(inputs.section_profile));
        return (
          <Select
            options={options}
            value={value}
            isDisabled={isInputLocked}
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
        const value = options.find(opt => String(opt.value) === String(inputs[field.key]));
        return (
          <Select
            options={options}
            value={value}
            isDisabled={isInputLocked}
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

      case 'optimized_number': {
        // Customized → plain number input; Optimized → "Set Bounds" button
        // that captures lower/upper/increment optimization bounds.
        const isOptimized = safeInputs.design_type === 'Optimized';
        if (!isOptimized) {
          return renderNumericInput(field, true);
        }
        const lb = safeInputs[`${field.key}_lb`];
        const ub = safeInputs[`${field.key}_ub`];
        const boundsSet = lb !== undefined && lb !== '' && ub !== undefined && ub !== '';
        return (
          <div className="w-[60%]">
            <button
              type="button"
              disabled={isInputLocked}
              onClick={() => setBoundsModalField(field)}
              className="w-full h-9 border border-gray-400 rounded-md px-3 text-sm bg-white hover:border-osdag-green hover:text-osdag-green transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {boundsSet ? `Bounds: ${lb} - ${ub}` : 'Set Bounds'}
            </button>
          </div>
        );
      }

      case 'number':
        return renderNumericInput(field, true);

      default:
        return renderNumericInput(field, field.type === 'number');
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
                  {field.label}{field.required !== false && field.type !== 'image' ? ' *' : ''}
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
      {showCustomMaterialModal && (
        <CustomMaterialModal
          showModal={showCustomMaterialModal}
          setShowModal={setShowCustomMaterialModal}
          setInputValues={setInputs}
          inputValues={safeInputs}
          type={customMaterialType}
          materialList={safeContextData.materialList || []}
          onRefetchModuleOptions={onRefetchModuleOptions}
        />
      )}
      {boundsModalField && (
        <Modal
          open={!!boundsModalField}
          title={`Set Optimization Bounds - ${boundsModalField.label?.replace('*', '').trim()}`}
          onCancel={() => setBoundsModalField(null)}
          onOk={() => setBoundsModalField(null)}
          okText="Done"
          width={420}
          className="[&_.ant-modal-header]:bg-transparent [&_.ant-modal-close]:right-4"
        >
          <div className="flex flex-col gap-3 py-2">
            {[
              { suffix: 'lb', label: 'Lower Bound (mm)' },
              { suffix: 'ub', label: 'Upper Bound (mm)' },
              { suffix: 'inc', label: 'Increment (mm)' },
            ].map(({ suffix, label }) => {
              const boundKey = `${boundsModalField.key}_${suffix}`;
              return (
                <div key={suffix} className="flex items-center justify-between">
                  <span className="text-sm w-1/2">{label}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={safeInputs[boundKey] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setInputs({ ...safeInputs, [boundKey]: val });
                    }}
                    placeholder={label}
                    className="w-[45%] h-9 border border-gray-400 rounded-md px-3 text-sm focus:border-osdag-green focus:ring-2 focus:ring-osdag-green/20 outline-none"
                  />
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
};
