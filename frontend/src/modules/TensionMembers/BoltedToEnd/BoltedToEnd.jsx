import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { boltedToEndConfig } from './configs/boltedToEndConfig';
import { boltedToEndOutputConfig } from './configs/boltedToEndOutputConfig';
import { UI_STRINGS } from '../../../constants/UIStrings';

function BoltedToEnd() {
  return (
    <EngineeringModule
      moduleConfig={boltedToEndConfig}
      outputConfig={boltedToEndOutputConfig}
      title={UI_STRINGS.BOLTED_TO_END_GUSSET}
    />
  );
}

export default BoltedToEnd; 