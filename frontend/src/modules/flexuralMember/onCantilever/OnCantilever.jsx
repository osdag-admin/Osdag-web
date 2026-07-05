import { UI_STRINGS } from '../../../constants/UIStrings';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { onCantileverConfig } from './configs/onCantileverConfig';
import { onCantileverOutputConfig } from './configs/onCantileverOutputConfig';

function OnCantilever() {
  return (
    <EngineeringModule
      moduleConfig={onCantileverConfig}
      outputConfig={onCantileverOutputConfig}
      title={UI_STRINGS.ON_CANTILEVER_BEAM}
    />
  );
}

export default OnCantilever;
