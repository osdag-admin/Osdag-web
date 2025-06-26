// Config for Simply Supported Beam (Flexural Member)
// Keys must match backend API (see simply_supported_beam.py get_required_keys)

const simplySupportedBeamConfig = {
  moduleKey: 'Simply-Supported-Beam',
  inputFields: [
    {
      key: 'Member.Profile',
      label: 'Section Profile',
      type: 'select',
      required: true,
    },
    {
      key: 'Member.Designation',
      label: 'Section Designation',
      type: 'select',
      required: true,
    },
    {
      key: 'Material',
      label: 'Material',
      type: 'select',
      required: true,
    },
    {
      key: 'Member.Mater'
    }
  ]
};

export default simplySupportedBeamConfig; 