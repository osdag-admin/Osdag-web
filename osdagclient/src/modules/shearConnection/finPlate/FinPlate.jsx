/* eslint-disable no-unused-vars */
import React from "react";
import { EngineeringModule } from "../../shared/components/EngineeringModule";
import FinPlateOutputDock from "./components/FinPlateOutputDock";
import { menuItems } from "../../shared/utils/moduleUtils";
import { finPlateConfig } from "./configs/finPlateConfig";
import { UI_STRINGS } from '../../../constants/UIStrings';

function FinPlate() {
  return (
    <EngineeringModule
      moduleConfig={finPlateConfig}
      OutputDockComponent={FinPlateOutputDock}
      menuItems={menuItems}
      title={UI_STRINGS.CONNECTING_MEMBERS}
    />
  );
}

export default FinPlate;
