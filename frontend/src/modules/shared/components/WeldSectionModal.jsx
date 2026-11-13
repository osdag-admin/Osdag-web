import { Select, Input } from "antd";
import GenericConfigView from "./GenericConfigView";

const { Option } = Select;

const SIMPLE_CONNECTION_WELD_MODULES = ["Butt Joint Welded", "Lap Joint Welded"];

const WeldSectionModal = ({
  module,
  designPrefInputs,
  setDesignPrefInputs,
  isInputLocked,
}) => {
  const isSimpleConnection =
    module && SIMPLE_CONNECTION_WELD_MODULES.includes(module);

  const Weld_text = `Shop weld takes a material safety factor of 1.25
Field weld takes a material safety factor of 1.5
(IS 800 - cl. 5. 4. 1 or Table 5)`;

  return (
    <GenericConfigView
      description={!isSimpleConnection ? Weld_text : null}
      descRows={25}
    >
      <div className="input-cont">
        <h5>{isSimpleConnection ? "Type" : "Type of Weld Fabrication"}</h5>
        <Select
          disabled={isInputLocked}
          style={{ width: "132px", height: "25px", fontSize: "12px" }}
          value={designPrefInputs.weld_fab}
          onSelect={(value) =>
            setDesignPrefInputs({ ...designPrefInputs, weld_fab: value })
          }
        >
          <Option value="Shop weld">
            {isSimpleConnection ? "Shop weld" : "Shop Weld"}
          </Option>
          <Option value="Field weld">
            {isSimpleConnection ? "Field weld" : "Field Weld"}
          </Option>
        </Select>
      </div>
      <div className="input-cont">
        <h5>Material Grade Overwrite, Fu (MPa)</h5>
        <Input
          disabled={isInputLocked}
          type="text"
          className="input-design-pref"
          value={designPrefInputs.weld_material_grade}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9.-]/g, '');
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
            setDesignPrefInputs({
              ...designPrefInputs,
              weld_material_grade: val,
            });
          }}
          onKeyDown={(e) => {
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
          }}
        />
      </div>
    </GenericConfigView>
  );
};

export default WeldSectionModal;
