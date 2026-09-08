/* eslint-disable react/prop-types */
import { Input } from "antd";

/**
 * GenericConfigView - A simple two-column layout for specialized settings tabs.
 * Used for Bolt, Weld, etc.
 */
const GenericConfigView = ({ 
  children,       // The input fields (left section)
  description,    // The description text (right section)
  note,           // Optional bottom note
  descRows = 18
}) => {
  return (
    <>
      <div className="Connector-col-beam-cont">
        {/* Left Section: Inputs */}
        <div className="connector-left">
          <h4>Inputs</h4>
          <div className="sub-container">
            {children}
          </div>
        </div>

        {/* Right Section: Description */}
        {description && (
          <div className="connector-right">
            <h4>Description</h4>
            <div className="sub-container">
              <Input.TextArea
                rows={descRows}
                value={description}
                readOnly
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Note */}
      {note && (
        <div className="connector-note">
          {note}
        </div>
      )}
    </>
  );
};

export default GenericConfigView;
