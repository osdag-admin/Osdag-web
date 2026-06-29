import { EngineeringModule } from '../shared/components/EngineeringModule';
import { coverPlateBoltedConfig } from './configs/coverPlateBoltedConfig';
import { coverPlateBoltedOutputConfig } from './configs/coverPlateBoltedOutputConfig';


function CoverPlateBolted() {
  return (
    <EngineeringModule
      moduleConfig={coverPlateBoltedConfig}
      outputConfig={coverPlateBoltedOutputConfig}
      title="Cover Plate — Bolted"
    />
  );
}

export default CoverPlateBolted;