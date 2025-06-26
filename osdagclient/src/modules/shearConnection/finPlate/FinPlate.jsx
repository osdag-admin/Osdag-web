/* eslint-disable no-unused-vars */
import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import FinPlateOutputDock from "./components/FinPlateOutputDock";
import { menuItems } from "../../shared/utils/moduleUtils";
import { finPlateConfig } from "./configs/finPlateConfig";

function FinPlate() {
  return (
    <EngineeringModule
      moduleConfig={finPlateConfig}
      OutputDockComponent={FinPlateOutputDock}
      menuItems={menuItems}
      title="Fin Plate Connection"
    />
  );
}

export default FinPlate;
