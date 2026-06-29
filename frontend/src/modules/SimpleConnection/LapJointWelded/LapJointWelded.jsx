import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { lapJointWeldedConfig } from './config/lapJointWeldedConfig';
import { lapJointWeldedOutputConfig } from './config/lapJointWeldedOutputConfig';


function LapJointWelded() {
    return (
        <EngineeringModule
            moduleConfig={lapJointWeldedConfig}
            outputConfig={lapJointWeldedOutputConfig}
            title="Lap Joint — Welded"
        />
    );
}

export default LapJointWelded; 