import { UI_STRINGS } from '../../../constants/UIStrings';
import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { lapJointBoltedConfig } from './config/lapJointBoltedConfig';
import { lapJointBoltedOutputConfig } from './config/lapJointBoltedOutputConfig';


function LapJointBolted() {
    return (
        <EngineeringModule
            moduleConfig={lapJointBoltedConfig}
            outputConfig={lapJointBoltedOutputConfig}
            title={UI_STRINGS.LAP_JOINT_BOLTED}
        />
    );
}

export default LapJointBolted; 