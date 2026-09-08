import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { beamBeamEndPlateConfig } from './configs/beamBeamEndPlateConfig';
import { beamBeamEndPlateOutputConfig } from './configs/beamBeamEndPlateOutputConfig';

function BeamBeamEndPlate() {
  return (
    <EngineeringModule
      moduleConfig={beamBeamEndPlateConfig}
      outputConfig={beamBeamEndPlateOutputConfig}
      title={UI_STRINGS.END_PLATE}
    />
  );
}

export default BeamBeamEndPlate;