import { BaseOutputDock } from "../../shared/components/BaseOutputDock";
import { compressionMemberOutputConfig } from "../configs/compressionMemberOutputConfig";

const CompressionMemberOutputDock = ({ output }) => {
  return (
    <div className="OutputDock">
      <BaseOutputDock 
        output={output} 
        outputConfig={compressionMemberOutputConfig}
        title="Compression Member Output"
      />
    </div>
  );
}

export default CompressionMemberOutputDock;


