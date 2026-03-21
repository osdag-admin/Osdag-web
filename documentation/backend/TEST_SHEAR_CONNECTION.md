# Testing Shear Connection Module

## Quick Start

### 1. Activate Conda Environment
```powershell
conda activate osdag-v2
# or your Django environment
cd backend
```

### 2. Start Django Server
```powershell
python manage.py runserver
```

### 3. Test Endpoints

## Available Endpoints

### Fin Plate Connection
- **URL:** `POST http://localhost:8000/api/modules/shear-connection/fin-plate/design/`
- **Slug:** `fin-plate`

### Cleat Angle Connection
- **URL:** `POST http://localhost:8000/api/modules/shear-connection/cleat-angle/design/`
- **Slug:** `cleat-angle`

### End Plate Connection
- **URL:** `POST http://localhost:8000/api/modules/shear-connection/end-plate/design/`
- **Slug:** `end-plate`

### Seated Angle Connection
- **URL:** `POST http://localhost:8000/api/modules/shear-connection/seated-angle/design/`
- **Slug:** `seated-angle`

## Test with cURL (PowerShell)

### Test 1: Guest Mode (No Auth)
```powershell
$body = @{
    "Bolt.Bolt_Hole_Type" = "Standard"
    "Bolt.Diameter" = @("12", "16", "20")
    "Bolt.Grade" = @("4.6", "4.8", "5.6")
    "Bolt.Slip_Factor" = "0.3"
    "Bolt.TensionType" = "Pre-tensioned"
    "Bolt.Type" = "Friction Grip Bolt"
    "Connectivity" = "Column Flange-Beam-Web"
    "Connector.Material" = "E 250 (Fe 410 W)A"
    "Design.Design_Method" = "Limit State Design"
    "Detailing.Corrosive_Influences" = "No"
    "Detailing.Edge_type" = "Rolled"
    "Detailing.Gap" = "15"
    "Load.Axial" = "50"
    "Load.Shear" = "180"
    "Material" = "E 250 (Fe 410 W)A"
    "Member.Supported_Section.Designation" = "MB 350"
    "Member.Supported_Section.Material" = "E 250 (Fe 410 W)A"
    "Member.Supporting_Section.Designation" = "JB 150"
    "Member.Supporting_Section.Material" = "E 250 (Fe 410 W)A"
    "Module" = "FinPlateConnection"
    "Weld.Fab" = "Shop Weld"
    "Weld.Material_Grade_OverWrite" = "410"
    "Connector.Plate.Thickness_List" = @("10", "12", "16", "18", "20")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/modules/shear-connection/fin-plate/design/" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test 2: With Inputs Wrapper (Alternative Format)
```powershell
$body = @{
    "inputs" = @{
        "Bolt.Diameter" = "16"
        "Bolt.Grade" = "8.8"
        "Load.Shear" = "180"
        "Member.Supported_Section.Designation" = "MB 350"
        "Member.Supporting_Section.Designation" = "JB 150"
        # ... add other required fields
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8000/api/modules/shear-connection/fin-plate/design/" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

### Test 3: Authenticated with Project ID
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    "inputs" = @{
        "Bolt.Diameter" = "16"
        "Load.Shear" = "180"
        # ... other inputs
    }
    "project_id" = 123
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/modules/shear-connection/fin-plate/design/" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

## Test with Python (Django Shell)

```python
# Start Django shell
python manage.py shell

# In shell:
from django.test import Client
import json

client = Client()

# Test fin-plate endpoint
response = client.post(
    '/api/modules/shear-connection/fin-plate/design/',
    data=json.dumps({
        "Bolt.Diameter": "16",
        "Bolt.Grade": "8.8",
        "Load.Shear": "180",
        "Member.Supported_Section.Designation": "MB 350",
        "Member.Supporting_Section.Designation": "JB 150",
        # ... add all required fields
    }),
    content_type='application/json'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

## Test with Postman

1. **Method:** POST
2. **URL:** `http://localhost:8000/api/modules/shear-connection/fin-plate/design/`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>` (optional, for authenticated requests)
4. **Body (raw JSON):**
```json
{
  "Bolt.Diameter": "16",
  "Bolt.Grade": "8.8",
  "Load.Shear": "180",
  "Member.Supported_Section.Designation": "MB 350",
  "Member.Supporting_Section.Designation": "JB 150",
  "Connectivity": "Column Flange-Beam-Web",
  "Material": "E 250 (Fe 410 W)A",
  "Module": "FinPlateConnection"
}
```

## Expected Responses

### Success (200 OK)
```json
{
  "data": {
    // Design calculation results
  },
  "logs": [
    // Calculation logs
  ],
  "success": true
}
```

### Error (400 Bad Request)
```json
{
  "error": "Missing required key: Bolt.Diameter",
  "success": false
}
```

### Not Found (404)
```json
{
  "error": "Sub-module invalid-slug not found"
}
```

## Verify Registry Auto-Discovery

```python
# In Django shell
from apps.modules.shear_connection.registry import ShearConnectionRegistry

# Check registered modules
print("Registered slugs:", list(ShearConnectionRegistry._registry.keys()))
print("Registered MODULE_IDs:", list(ShearConnectionRegistry._module_id_map.keys()))

# Test lookup
service = ShearConnectionRegistry.get_service_by_slug('fin-plate')
print(f"Fin Plate Service: {service}")

service = ShearConnectionRegistry.get_service_by_module_id('FinPlateConnection')
print(f"Fin Plate Service by MODULE_ID: {service}")
```

## Troubleshooting

### Error: "Sub-module not found"
- Check that `__init__.py` exists in sub-module folder
- Verify `MODULE_ID` and `Service` are exported in `__init__.py`
- Check registry auto-discovery ran (see above)

### Error: "ModuleNotFoundError: No module named 'osdag_core'"
- Ensure conda environment is activated
- Verify `osdag_core` is in `sys.path` (check `settings.py`)
- Restart Django server

### Error: "Missing required key"
- Check adapter's `get_required_keys()` function
- Ensure all required fields are in request body
- See adapter file for full list of required keys

## Next Steps

After testing shear connections:
1. Test moment connections: `/api/modules/moment-connection/{submodule}/design/`
2. Compare results with old endpoints
3. Test project saving functionality
4. Test guest vs authenticated modes

