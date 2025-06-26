// Output config for Simply Supported Beam (Flexural Member)
// Keys should match those returned by the backend output_values

const simplySupportedBeamOutputConfig = {
  outputFields: [
    {
      key: 'KEY_TITLE_OPTIMUM_DESIGNATION',
      label: 'Optimum Section Designation',
      type: 'text',
    },
    {
      key: 'KEY_OPTIMUM_UR_COMPRESSION',
      label: 'Utilization Ratio',
      type: 'text',
    },
    {
      key: 'KEY_OPTIMUM_SC',
      label: 'Section Class',
      type: 'text',
    },
    {
      key: 'KEY_betab_constatnt',
      label: 'Beta_b',
      type: 'text',
    },
  ],
};

export default simplySupportedBeamOutputConfig; 