import { EngineeringModule } from "../../shared/components/EngineeringModule";
import { endPlateConfig } from "./configs/endPlateConfig";
import { endPlateOutputConfig } from "./configs/endPlateOutputConfig";
import { UI_STRINGS } from '../../../constants/UIStrings';

function EndPlate() {
  return (
    <EngineeringModule
      moduleConfig={endPlateConfig}
      outputConfig={endPlateOutputConfig}
      title={UI_STRINGS.HEADER_PLATE}
    />
  );
}


export default EndPlate;
