"""
Quick test script for shear connection endpoints
Run: python test_shear_connection.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
import json

# Sample fin plate input data
FIN_PLATE_INPUTS = {
    "Bolt.Bolt_Hole_Type": "Standard",
    "Bolt.Diameter": ["12", "16", "20"],
    "Bolt.Grade": ["4.6", "4.8", "5.6"],
    "Bolt.Slip_Factor": "0.3",
    "Bolt.TensionType": "Pre-tensioned",
    "Bolt.Type": "Friction Grip Bolt",
    "Connectivity": "Column Flange-Beam-Web",
    "Connector.Material": "E 250 (Fe 410 W)A",
    "Design.Design_Method": "Limit State Design",
    "Detailing.Corrosive_Influences": "No",
    "Detailing.Edge_type": "Rolled",
    "Detailing.Gap": "15",
    "Load.Axial": "50",
    "Load.Shear": "180",
    "Material": "E 250 (Fe 410 W)A",
    "Member.Supported_Section.Designation": "MB 350",
    "Member.Supported_Section.Material": "E 250 (Fe 410 W)A",
    "Member.Supporting_Section.Designation": "JB 150",
    "Member.Supporting_Section.Material": "E 250 (Fe 410 W)A",
    "Module": "FinPlateConnection",
    "Weld.Fab": "Shop Weld",
    "Weld.Material_Grade_OverWrite": "410",
    "Connector.Plate.Thickness_List": ["10", "12", "16", "18", "20"],
}

def test_registry():
    """Test that registry auto-discovery worked"""
    print("=" * 60)
    print("Testing Registry Auto-Discovery")
    print("=" * 60)
    
    from apps.modules.shear_connection.registry import ShearConnectionRegistry
    
    slugs = list(ShearConnectionRegistry._registry.keys())
    module_ids = list(ShearConnectionRegistry._module_id_map.keys())
    
    print(f"✅ Registered slugs: {slugs}")
    print(f"✅ Registered MODULE_IDs: {module_ids}")
    
    # Test lookup
    service = ShearConnectionRegistry.get_service_by_slug('fin-plate')
    if service:
        print(f"✅ Fin Plate Service found: {service.__name__}")
    else:
        print("Fin Plate Service NOT found!")
        return False
    
    return True

def test_endpoint(submodule_slug, inputs):
    """Test a shear connection endpoint"""
    print(f"\n{'=' * 60}")
    print(f"Testing: {submodule_slug}")
    print(f"{'=' * 60}")
    
    client = Client()
    url = f'/api/modules/shear-connection/{submodule_slug}/design/'
    
    try:
        response = client.post(
            url,
            data=json.dumps(inputs),
            content_type='application/json'
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: {data.get('success', False)}")
            if 'data' in data:
                print(f"✅ Data keys: {list(data['data'].keys())[:5]}...")  # First 5 keys
            if 'logs' in data:
                print(f"✅ Logs count: {len(data['logs'])}")
            return True
        else:
            print(f"Error: {response.json()}")
            return False
            
    except Exception as e:
        print(f"Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "=" * 60)
    print("SHEAR CONNECTION MODULE TEST")
    print("=" * 60 + "\n")
    
    # Test 1: Registry
    if not test_registry():
        print("\nRegistry test failed. Cannot continue.")
        return
    
    # Test 2: Fin Plate endpoint
    print("\n" + "-" * 60)
    test_endpoint('fin-plate', FIN_PLATE_INPUTS)
    
    # Test 3: Invalid slug
    print("\n" + "-" * 60)
    print("Testing invalid slug...")
    client = Client()
    response = client.post(
        '/api/modules/shear-connection/invalid-slug/design/',
        data=json.dumps(FIN_PLATE_INPUTS),
        content_type='application/json'
    )
    print(f"Status Code: {response.status_code}")
    if response.status_code == 404:
        print("✅ Correctly returns 404 for invalid slug")
    else:
        print(f"Expected 404, got {response.status_code}")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    main()

