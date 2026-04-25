import { EngineeringModule } from '../shared/components/EngineeringModule';
import { coverPlateWeldedConfig } from './configs/coverPlateWeldedConfig';
import { coverPlateWeldedOutputConfig } from './configs/coverPlateWeldedOutputConfig';

const CoverPlateWelded = () => {
  return (
    <EngineeringModule
      moduleConfig={coverPlateWeldedConfig}
      outputConfig={coverPlateWeldedOutputConfig}
      title="Beam-to-Beam Cover Plate Welded Connection"
    />
  );
};

export default CoverPlateWelded;
