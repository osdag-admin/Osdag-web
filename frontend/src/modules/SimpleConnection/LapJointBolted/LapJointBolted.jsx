import { EngineeringModule } from '../../shared/components/EngineeringModule';
import { lapJointBoltedConfig } from './config/lapJointBoltedConfig';
import { lapJointBoltedOutputConfig } from './config/lapJointBoltedOutputConfig';


function LapJointBolted() {
    return (
        <EngineeringModule
            moduleConfig={lapJointBoltedConfig}
            outputConfig={lapJointBoltedOutputConfig}
            title="Lap Joint — Bolted"
        />
    );
}

export default LapJointBolted; 