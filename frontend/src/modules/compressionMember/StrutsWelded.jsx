import { UI_STRINGS } from '../../constants/UIStrings';
import { EngineeringModule } from '../shared/components/EngineeringModule';
import { strutsWeldedConfig } from './configs/strutsWeldedConfig';
import { strutsWeldedOutputConfig } from './configs/strutsWeldedOutputConfig';

function StrutsWelded() {
    return (
        <EngineeringModule
            moduleConfig={strutsWeldedConfig}
            outputConfig={strutsWeldedOutputConfig}
            title={UI_STRINGS.STRUTS_WELDED_TO_END_GUSSET}
        />
    );
}

export default StrutsWelded;
