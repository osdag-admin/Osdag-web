import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { simplySupportedBeamOutputConfig } from "../configs/simplySupportedBeamOutputConfig";

function SimplySupportedBeamOutputDock({ output }) {
  console.log("SimplySupportedBeamOutputDock rendering with output:", output);
  console.log("Using config:", simplySupportedBeamOutputConfig);
  
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