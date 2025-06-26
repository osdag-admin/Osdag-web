import PropTypes from 'prop-types';

const SimplySupportedBeamOutputDock = ({ outputData }) => {
  return (
    <div>
      <h3>Simply Supported Beam Output</h3>
      <pre>{JSON.stringify(outputData, null, 2)}</pre>
      {/* TODO: Render output fields nicely using config */}
    </div>
  );
};

SimplySupportedBeamOutputDock.propTypes = {
  outputData: PropTypes.any,
};

export default SimplySupportedBeamOutputDock; 