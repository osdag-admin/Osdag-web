# Design Endpoint Features

## Overview
The new modular design endpoints (`/api/modules/shear-connection/{submodule}/design/`) support:

1. **Guest Mode** - Unauthenticated users can run calculations
2. **Project Saving** - Authenticated users can save results to projects
3. **Backward Compatibility** - Works with existing frontend code

## API Endpoint

### URL Pattern
```
POST /api/modules/shear-connection/{submodule_slug}/design/
```

**Examples:**
- `POST /api/modules/shear-connection/fin-plate/design/`
- `POST /api/modules/shear-connection/cleat-angle/design/`
- `POST /api/modules/shear-connection/end-plate/design/`
- `POST /api/modules/shear-connection/seated-angle/design/`

### Request Body

**Format 1: With project_id (for authenticated users)**
```json
{
  "inputs": {
    "Bolt.Diameter": "16",
    "Bolt.Grade": "8.8",
    "Load.Shear": "180",
    // ... other design inputs
  },
  "project_id": 123
}
```

**Format 2: Without project_id (for guests or one-off calculations)**
```json
{
  "Bolt.Diameter": "16",
  "Bolt.Grade": "8.8",
  "Load.Shear": "180",
  // ... other design inputs
}
```

### Response

**Success Response (200 OK):**
```json
{
  "data": {
    // Design calculation results
  },
  "logs": [
    // Calculation logs
  ],
  "success": true,
  "project_saved": true,  // Only if project_id provided and user authenticated
  "project_id": 123        // Only if project_id provided and user authenticated
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Error message here",
  "success": false
}
```

**Not Found Response (404):**
```json
{
  "error": "Sub-module fin-plate not found"
}
```

## Guest Mode

### How It Works
- **Permission**: `AllowAny` - No authentication required
- **Detection**: Checks JWT token for `is_guest: true` flag
- **Limitations**: 
  - Cannot save to projects
  - `project_id` is ignored if provided

### Example Request (Guest)
```bash
# No Authorization header needed
curl -X POST http://localhost:8000/api/modules/shear-connection/fin-plate/design/ \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "Bolt.Diameter": "16",
      "Load.Shear": "180"
    }
  }'
```

### Example Response (Guest)
```json
{
  "data": { /* results */ },
  "logs": [ /* logs */ ],
  "success": true,
  "project_saved": false,
  "project_error": "Guest users cannot save to projects"
}
```

## Project Saving (Authenticated Users)

### How It Works
1. User must be authenticated (not a guest)
2. `project_id` must be provided in request body
3. Project must exist and belong to the user
4. Project is updated with latest `inputs_json`

### Example Request (Authenticated)
```bash
curl -X POST http://localhost:8000/api/modules/shear-connection/fin-plate/design/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "inputs": {
      "Bolt.Diameter": "16",
      "Load.Shear": "180"
    },
    "project_id": 123
  }'
```

### Example Response (Authenticated with Project)
```json
{
  "data": { /* results */ },
  "logs": [ /* logs */ ],
  "success": true,
  "project_saved": true,
  "project_id": 123
}
```

### Error Cases

**Project Not Found:**
```json
{
  "data": { /* results */ },
  "logs": [ /* logs */ ],
  "success": true,
  "project_saved": false,
  "project_error": "Project not found or access denied"
}
```

**Guest User Attempting to Save:**
```json
{
  "data": { /* results */ },
  "logs": [ /* logs */ ],
  "success": true,
  "project_saved": false,
  "project_error": "Guest users cannot save to projects"
}
```

## Implementation Details

### ViewSet (`backend/apps/modules/shear_connection/views.py`)
- Uses `AllowAny` permission class
- Helper functions: `is_guest_user()`, `get_user_email()`
- Extracts `inputs` and `project_id` from request
- Calls service with context
- Handles project saving after calculation

### Service Layer (`backend/apps/modules/shear_connection/submodules/*/service.py`)
- Accepts optional `request`, `project_id`, `user_email` parameters
- Focuses on calculation logic only
- Returns calculation results

### Project Model Update
- Updates `inputs_json` field with latest inputs
- Updates `submodule` field with slug (e.g., `fin_plate`)
- Verifies ownership via `user_email`

## Migration Notes

### From Old Endpoint
**Old (removed):**
```
(Removed) POST /calculate-output/FinPlateConnection
Body: { "Module": "FinPlateConnection", ...inputs }
```

**New (current):**
```
POST /api/modules/shear-connection/fin-plate/design/
Body: { "inputs": {...} } or just {...inputs}
```

### Frontend Changes Needed
1. Update API endpoint URLs
2. Extract `inputs` into separate key if using new format
3. Add `project_id` to request if user is authenticated
4. Handle `project_saved` flag in response

## Testing

### Test Guest Mode
```python
# No auth header
response = client.post('/api/modules/shear-connection/fin-plate/design/', {
    'inputs': {...}
})
assert response.status_code == 200
assert response.json()['project_saved'] == False
```

### Test Authenticated with Project
```python
# With auth header
response = client.post('/api/modules/shear-connection/fin-plate/design/', {
    'inputs': {...},
    'project_id': 123
}, HTTP_AUTHORIZATION='Bearer <token>')
assert response.status_code == 200
assert response.json()['project_saved'] == True
```

### Test Project Not Found
```python
response = client.post('/api/modules/shear-connection/fin-plate/design/', {
    'inputs': {...},
    'project_id': 999  # Non-existent project
}, HTTP_AUTHORIZATION='Bearer <token>')
assert response.json()['project_saved'] == False
assert 'not found' in response.json()['project_error'].lower()
```

