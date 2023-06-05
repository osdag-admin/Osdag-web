# Osdag Backend API

### Installation Instructions:
- Download and extract Osdag installer for linux
- open 2-install-osdag.sh
- Add line `conda install django` after line 29
- Run osdag installation files as specified
- Download `secret_key.py` and put in `osdag_web/secret_key.py`
- Download `Intg_osdag.sql` and put in `ResourceFiles/Database/Intg_osdag.sql`
- Download `Intg_osdag.sqlite` and put in `ResourceFiles/Database/Intg_osdag.sqlite`'
- Create folder `file_storage/cad_models/`
- Run `python manage.py migrate`
- To run backend, run `python manage.py runserver`
### Project Structure:
`osdag_web` Django Project files
`osdag`: Django app for osdag web API
`osdag_api`: Layer between Osdag code and osdag web API

---

### Osdag Web APIs:
#### `osdag/web_api` contains APIs as django Views.


##### Sessions API `osdag/web_api/session_api.py`

Contains two API calls:
>Create Session API: `class CreateSession(View)`
>&nbsp; Creates a design session object in the DB.
>- url: `sessions/create`
>- method: POST
>- body: form-data
>- must include parameter: module=Module Id

>Delete Session API: `class DeleteSession(View)`
>&nbsp; Deletes the session from DB and deletes session cookie.
>- url: `sessions/delete`
>- method: POST

##### Input Data API `osdag/web_api/input_data_api.py`
Contains InputData API:
>Input Data API: `class InputValues(View)`
>&nbsp; Validate input values and set input data in DB.
>- url: `design/input_values
>- method: POST
>- body: json
>- Must include session cookie

##### Output Data API `osdag/web_api/output_data_api.py`
>Output Data API `class OutputValues(View)`
>&nbsp; Return calculated values for output dock
>- url: `design/output_values`
>- method: GET
>- response: json
>- must include session cookie

##### Cad Model API `osdag/web_api/cad_model_api.py`
>Cad Model API `class CadGeneration(View)`
>&nbsp; Return CAD Model in brep format
>- url: `design/cad`
>- method: GET
>- response: json
>- must include session cookie

##### Developed Modules API `osdag/web_api/modules_api.py`
>Modules API `class GetModules(View)`
>&nbsp; Return all developed module id,
>- url: `modules`
>- method: GET
>- response: json

### Osdag Api Layer.
#### `osdag_api` contains the layer that bridges the web API and the Osdag software
`osdag_api/module_finder` contains the function, where if you input module id, you get module api
`osdag_api/modules` Contains Module APIs
`osdag_api/modules/module_id` module API
### Structure of Module API (example API for fin_plate_connection)
```
Api for Fin Plate Connection module
Functions:
    get_required_keys() -> List[str]:
        Return all required input parameters for the module.
    validate_input(input_values: Dict[str, Any]) -> None:
        Go through all the input parameters.
        Check if all required parameters are given.
        Check if all parameters are of correct data type.
    create_module() -> FnPlateConnection:
        Create an instance of the fin plate connection module design class and set it up for use
    create_from_input(input_values: Dict[str, Any]) -> FinPlateConnection
        Create an instance of the fin plate connection module design class from input values.
    generate_output(input_values: Dict[str, Any]) -> Dict[str, Any]:
        Generate, format and return the input values from the given output values.
            Output format (json): {
                "Bolt.Pitch": 
                    "key": "Bolt.Pitch",
                    "label": "Pitch Distance (mm)"
                    "value": 40
                }
            }
    create_cad_model(input_values: Dict[str, Any], section: str, session: str) -> str:
        Generate the CAD model from input values as a BREP file. Return file path.
```