import React from "react";
import { EngineeringModule } from "../shared/components/EngineeringModule";
import { axiallyLoadedColumnConfig } from "./configs/axiallyLoadedColumnConfig";
import { axiallyLoadedColumnOutputConfig } from "./configs/axiallyLoadedColumnOutputConfig";

function AxiallyLoadedColumn() {
  return (
    <EngineeringModule
      moduleConfig={axiallyLoadedColumnConfig}
      outputConfig={axiallyLoadedColumnOutputConfig}
      title="Axially Loaded Column"
    />
  );
}

export default AxiallyLoadedColumn;

