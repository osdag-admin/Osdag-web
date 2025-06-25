import React from "react";
import { BaseOutputDock } from "../../../shared/components/BaseOutputDock";
import { boltedToEndOutputConfig } from "../configs/boltedToEndOutputConfig";

function BoltedToEndOutputDock({ output }) {
  return (
    <div className="OutputDock">
      <BaseOutputDock 
        output={output} 
        outputConfig={boltedToEndOutputConfig}
        title="Output Dock"
      />
    </div>
  );
}

export default BoltedToEndOutputDock; 