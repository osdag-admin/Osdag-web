import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { simplySupportedBeamOutputConfig } from "../configs/simplySupportedBeamOutputConfig";

const SimplySupportedBeamOutputDock = ({ output }) => {
  return (
    <div className="OutputDock">
      <BaseOutputDock 
        output={output} 
        outputConfig={simplySupportedBeamOutputConfig}
        title="Simply Supported Beam Output"
      />
    </div>
  );
}

export default SimplySupportedBeamOutputDock; 