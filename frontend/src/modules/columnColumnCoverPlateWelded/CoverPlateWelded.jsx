import { EngineeringModule } from '../shared/components/EngineeringModule';
import { coverPlateWeldedConfig } from './configs/coverPlateWeldedConfig';
import { coverPlateWeldedOutputConfig } from './configs/coverPlateWeldedOutputConfig';

const CoverPlateWelded = () => {
  return (
    <EngineeringModule
      moduleConfig={coverPlateWeldedConfig}
      outputConfig={coverPlateWeldedOutputConfig}
      title="Column-to-Column Cover Plate Welded Connection"
    />
  );
};

export default CoverPlateWelded;
