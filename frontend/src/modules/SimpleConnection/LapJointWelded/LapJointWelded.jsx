import { UI_STRINGS } from '../../../constants/UIStrings';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { lapJointWeldedConfig } from './config/lapJointWeldedConfig';
import { lapJointWeldedOutputConfig } from './config/lapJointWeldedOutputConfig';


function LapJointWelded() {
    return (
        <EngineeringModule
            moduleConfig={lapJointWeldedConfig}
            outputConfig={lapJointWeldedOutputConfig}
            title={UI_STRINGS.LAP_JOINT_WELDED}
        />
    );
}

export default LapJointWelded; 