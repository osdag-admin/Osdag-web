import { UI_STRINGS } from '../../../constants/UIStrings';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { simplySupportedBeamConfig } from './configs/simplySupportedBeamConfig';
import { simplySupportedBeamOutputConfig } from './configs/simplySupportedBeamOutputConfig';

function SimplySupportedBeam() {
  return (
    <EngineeringModule
      moduleConfig={simplySupportedBeamConfig}
      outputConfig={simplySupportedBeamOutputConfig}
      title={UI_STRINGS.SIMPLY_SUPPORTED_BEAM}
    />
  );
}

export default SimplySupportedBeam; 