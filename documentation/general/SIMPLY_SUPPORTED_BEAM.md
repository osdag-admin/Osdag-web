### Simply Supported Beam: Django Flow and Backend Integration

This document explains how the Simply Supported Beam module flows through Django, how the request is resolved to the module API, and how it connects to the `design_type` flexural calculations.

---

## URL → View

- Legacy endpoint (removed): `calculate-output/Simply-Supported-Beam`
- Current endpoint uses the modules API under `api/modules/.../design/`.

```text
The current web backend no longer wires `calculate-output/*` routes. Use the refactored modules API.

Example (shape only; module path depends on how this module is registered):
- `POST /api/modules/<parent>/<submodule>/design/`
```

View handler (Django REST Framework `APIView`):

```python
# osdag/web_api/simplysupportedbeam_outputView.py
class SimplySupportedBeamOutputData(APIView):
    def post(self, request):
        input_values = request.data
        module_name = input_values.get('Module', 'Simply-Supported-Beam')
        module_api = get_module_api(module_name)
        output, logs = module_api.generate_output(input_values)
        return JsonResponse({"data": output, "logs": logs, "success": True}, safe=False, status=201)
```

---

## Module Resolution

`get_module_api` maps the module key specified in the request (`"Module": "Simply-Supported-Beam"`) to the correct module adapter.

```python
# osdag_api/module_finder.py
module_dict = {
    ...
    'Simply-Supported-Beam': simply_supported_beam,
}

def get_module_api(module_id: str):
    return module_dict[module_id]
```

The module is also listed in the supported modules:

```python
# osdag_api/__init__.py
developed_modules = [
    ...,
    "Simply-Supported-Beam"
]
```

---

## Module Adapter → Flexure Engine

The Simply Supported Beam adapter is in `osdag_api/modules/simply_supported_beam.py`. It:
- Validates/normalizes request inputs
- Maps frontend keys to the exact keys expected by the flexure engine
- Instantiates `design_type.flexural_member.flexure.Flexure`
- Calls the engine to get results and formats them as a flat JSON dictionary

Key functions:

```python
# osdag_api/modules/simply_supported_beam.py
def get_required_keys() -> List[str]:
    return [
        "Module","Member.Profile","Member.Designation","Material","Member.Material",
        "Design.Design_Method","Design.Allowable_Class","Design.Effective_Area_Parameter",
        "Length.Overwrite","Bearing.Length","Load.Shear","Load.Moment","Member.Length",
        "Support.Type","Torsion.restraint","Warping.restraint",
    ]

def create_from_input(input_values: Dict[str, Any]) -> Flexure:
    module = create_module()  # Flexure()
    design_dict = {
        'Module': input_values.get('Module', 'Simply-Supported-Beam'),
        'Member.Profile': input_values.get('Member.Profile', ''),
        'Member.Designation': processed_member_designation,  # array
        'Material': input_values.get('Material', ''),
        'Member.Material': input_values.get('Member.Material', ''),
        'Flexure.Type': input_values.get('Flexure.Type', 'Major Laterally Supported'),
        'Design.Allowable_Class': input_values.get('Design.Allowable_Class', ''),
        'Design.Effective_Area_Parameter': input_values.get('Design.Effective_Area_Parameter', ''),
        'Length.Overwrite': input_values.get('Length.Overwrite', ''),
        'Bearing.Length': input_values.get('Bearing.Length', ''),
        'Load.Shear': input_values.get('Load.Shear', ''),
        'Load.Moment': input_values.get('Load.Moment', ''),
        'Member.Length': input_values.get('Member.Length', ''),
        'Flexure.Support': input_values.get('Flexure.Support', ''),
        'Torsion.restraint': input_values.get('Torsion.restraint', ''),
        'Warping.restraint': input_values.get('Warping.restraint', ''),
        'Loading.Condition': 'Normal',
    }
    module.set_input_values(design_dict)
    return module

def generate_output(input_values: Dict[str, Any]):
    module = create_from_input(input_values)
    raw_output_text = module.output_values(True)
    raw_output_spacing = module.spacing(True)
    # Flatten to { key: {key,label,val} }
    ...
    return output, logs
```

---

## Flexure Calculations (`design_type`)

The actual flexural computations are implemented in `design_type/flexural_member/flexure.py` in class `Flexure`. The module adapter above calls:
- `Flexure.set_input_values(design_dict)`
- `Flexure.output_values(True)` and `Flexure.spacing(True)` to obtain output rows

```python
# design_type/flexural_member/flexure.py
class Flexure(Member):
    def __init__(self):
        super(Flexure, self).__init__()
        self.logs = []
    ...  # extensive flexural design logic
```

---

## Input Options API (for populating UI)

For dropdowns and lists used by the Simply Supported Beam UI, see:

```python
# osdag/web_api/inputdata/simply_supported_beam_input.py
class SimplySupportedBeamInputData(InputDataBase):
    def process(self, **kwargs):
        response['beamList'] = list(Beams.objects.values_list('Designation', flat=True))
        response['columnList'] = list(Columns.objects.values_list('Designation', flat=True))
        response['sectionProfileList'] = ["Beams and Columns"]
        response['materialList'] = Material + CustomMaterials (+ 'Custom')
        response['designMethodList'] = ["Limit State Design", "Working Stress Design"]
        response['allowableClassList'] = ["Plastic", "Compact", "Semi-Compact"]
        response['beamSupportTypeList'] = [
            "Major Laterally Supported",
            "Minor Laterally Unsupported",
            "Major Laterally Unsupported",
        ]
        response['torsionalRestraintList'] = [...]
        response['warpingRestraintList'] = [...]
        return Response(response, status=200)
```

---

## Minimal Request/Response

- (Removed) POST `calculate-output/Simply-Supported-Beam`

Request body must include at least (keys shown are the module’s required inputs):

```json
{
  "Module": "Simply-Supported-Beam",
  "Member.Profile": "Beams and Columns",
  "Member.Designation": ["ISMB 300"],
  "Material": "E 250 (Fe 410 W)A",
  "Member.Material": "E 250 (Fe 410 W)A",
  "Design.Design_Method": "Limit State Design",
  "Design.Allowable_Class": "Plastic",
  "Design.Effective_Area_Parameter": "1.0",
  "Length.Overwrite": "NA",
  "Bearing.Length": "NA",
  "Load.Shear": "100",
  "Load.Moment": "50",
  "Member.Length": "3000",
  "Support.Type": "Simply Supported",
  "Flexure.Type": "Major Laterally Supported",
  "Torsion.restraint": "Fully Restrained",
  "Warping.restraint": "Both flanges fully restrained"
}
```

Response (shape):

```json
{
  "data": {
    "<key>": {"key": "<key>", "label": "<label>", "val": "<value>"},
    "...": { ... }
  },
  "logs": ["..."],
  "success": true
}
```

---

## Sequence Summary

1. (Removed) Client POSTed to `calculate-output/Simply-Supported-Beam` with required inputs
2. DRF view resolves module via `get_module_api('Simply-Supported-Beam')`
3. Module adapter maps inputs → `Flexure` keys and calls `Flexure`
4. `Flexure` performs calculations and returns rows
5. Adapter converts rows to `{ key: {key,label,val} }` JSON
6. View returns `{ data, logs, success }`


