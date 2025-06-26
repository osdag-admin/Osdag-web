import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import { cleatAngleConfig } from "./configs/cleatAngleConfig";
import CleatAngleOutputDock from "./components/CleatAngleOutputDock";
import { menuItems } from "../../shared/utils/moduleUtils";

function CleatAngle() {
  return (
    <EngineeringModule
      moduleConfig={cleatAngleConfig}
      OutputDockComponent={CleatAngleOutputDock}
      menuItems={menuItems}
      title="Cleat Angle"
    />
  );
}

export default CleatAngle;
