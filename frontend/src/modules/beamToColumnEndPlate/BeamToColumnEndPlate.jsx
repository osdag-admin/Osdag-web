import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { beamToColumnEndPlateConfig } from './configs/beamToColumnEndPlateConfig';
import { beamToColumnEndPlateOutputConfig } from './configs/beamToColumnEndPlateOutputConfig';

function BeamToColumnEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={beamToColumnEndPlateConfig}
      outputConfig={beamToColumnEndPlateOutputConfig}
      title={UI_STRINGS.END_PLATE}
    />
  );
}

export default BeamToColumnEndPlate;
