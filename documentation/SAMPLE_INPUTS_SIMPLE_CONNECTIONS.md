# Sample Inputs for Simple Connection Modules

## 1. Butt Joint Bolted

```json
{
  "Module": "ButtJointBolted",
  "Material": "E 250 (Fe 410 W)A",
  "Load.Axial": "100",
  "Plate1Thickness": "12",
  "Plate2Thickness": "12",
  "PlateWidth": "200",
  "ButtJoint.CoverPlate": "Single-Cover",
  "Bolt.Diameter": "16",
  "Bolt.Grade": "4.6",
  "Bolt.Type": "Bearing Bolt",
  "Bolt.Bolt_Hole_Type": "Standard",
  "Bolt.Slip_Factor": "0.33",
  "Design.For": "Tension",
  "Detailing.Edge_type": "Sheared or hand flame cut",
  "Detailing.Packing_Plate": "No"
}
```

## 2. Butt Joint Welded

```json
{
  "Module": "ButtJointWelded",
  "Material": "E 250 (Fe 410 W)A",
  "Load.Axial": "100",
  "Plate1Thickness": "10",
  "Plate2Thickness": "14",
  "PlateWidth": "200",
  "ButtJoint.CoverPlate": "Single-Cover",
  "Weld.Size": "6",
  "Weld.Type": "Shop weld",
  "Weld.Material_Grade_OverWrite": "410",
  "Weld.Fab": "Shop Weld",
  "Design.For": "Tension",
  "Detailing.Edge_type": "Sheared or hand flame cut",
  "Detailing.Packing_Plate": "No"
}
```

**Note:** Weld size must be between minimum (5 mm) and maximum (typically 8.5-10.5 mm depending on plate thickness). Use 5, 6, 7, or 8 mm for best results.

## 3. Lap Joint Bolted

```json
{
  "Module": "LapJointBolted",
  "Material": "E 250 (Fe 410 W)A",
  "Load.Axial": "100",
  "Plate1Thickness": "12",
  "Plate2Thickness": "12",
  "PlateWidth": "200",
  "ButtJoint.CoverPlate": "Single-Cover",
  "Bolt.Diameter": "16",
  "Bolt.Grade": "4.6",
  "Bolt.Type": "Bearing Bolt",
  "Bolt.Bolt_Hole_Type": "Standard",
  "Bolt.Slip_Factor": "0.33",
  "Design.For": "Tension",
  "Detailing.Edge_type": "Sheared or hand flame cut",
  "Detailing.Packing_Plate": "No"
}
```

## 4. Lap Joint Welded

```json
{
  "Module": "LapJointWelded",
  "Material": "E 250 (Fe 410 W)A",
  "Load.Axial": "100",
  "Plate1Thickness": "10",
  "Plate2Thickness": "12",
  "PlateWidth": "200",
  "ButtJoint.CoverPlate": "Single-Cover",
  "Weld.Size": "6",
  "Weld.Type": "Shop weld",
  "Weld.Material_Grade_OverWrite": "410",
  "Weld.Fab": "Shop Weld",
  "Design.For": "Tension",
  "Detailing.Edge_type": "Sheared or hand flame cut",
  "Detailing.Packing_Plate": "No"
}
```

**Note:** For welded connections, ensure:
- Plate thicknesses are reasonable (8-20 mm recommended)
- Weld size is between 5-8 mm (check terminal logs for exact min/max based on plate thickness)
- For plates with thickness 10-12 mm, max weld size is typically 8.5 mm
- For plates with thickness 12-14 mm, max weld size is typically 10.5 mm

## Common Input Ranges

### Material Options
- `"E 250 (Fe 410 W)A"`
- `"E 250 (Fe 410 W)B"`
- `"E 250 (Fe 410 W)C"`
- `"E 350 (Fe 440 W)A"`
- `"E 350 (Fe 440 W)B"`
- `"E 350 (Fe 440 W)C"`

### Bolt Diameter Options (mm)
- `"8"`, `"10"`, `"12"`, `"14"`, `"16"`, `"18"`, `"20"`, `"22"`, `"24"`, `"27"`, `"30"`

### Bolt Grade Options
- `"3.6"`, `"4.6"`, `"4.8"`, `"5.6"`, `"5.8"`, `"6.8"`, `"8.8"`, `"9.8"`, `"10.9"`, `"12.9"`

### Bolt Type Options
- `"Bearing Bolt"`
- `"HSFG Bolt"`

### Weld Size Options (mm)
- `"4"`, `"5"`, `"6"`, `"8"`, `"10"`, `"12"` (must be within min/max based on plate thickness)

### Weld Type Options
- `"Shop weld"`
- `"Field weld"`

### Cover Plate Options
- `"Single-Cover"`
- `"Double-Cover"`

### Design For Options
- `"Tension"`
- `"Compression"`

### Edge Type Options
- `"Sheared or hand flame cut"`
- `"Machine flame cut, sawn and planed"`
- `"Rolled edge"`

### Packing Plate Options
- `"No"`
- `"Yes"`

## Testing Tips

1. **For Welded Connections:**
   - Check terminal logs for exact min/max weld size
   - If you see "Selected weld size is not suitable", try a size between the min and max shown in logs
   - Example: If min=5 mm and max=8.5 mm, use 5, 6, 7, or 8 mm

2. **For Bolted Connections:**
   - Ensure bolt diameter is appropriate for the load
   - Smaller loads (10-100 N) work well with 8-12 mm bolts
   - Larger loads (100-1000 N) may need 16-24 mm bolts

3. **Load Values:**
   - Start with smaller loads (10-100 N) for testing
   - Increase gradually to test different scenarios
   - Use realistic values based on your application

4. **Plate Dimensions:**
   - Width: 150-300 mm is typical
   - Thickness: 8-20 mm is common
   - Ensure plate1 and plate2 thicknesses are reasonable

