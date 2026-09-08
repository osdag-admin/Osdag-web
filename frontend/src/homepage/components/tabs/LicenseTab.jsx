import { LICENSE_TEXT } from "../../constants/aboutOsdag/licenseText";

export default function LicenseTab() {
  return (
    <div className="max-h-[60vh] overflow-y-auto text-xs whitespace-pre-wrap font-mono">
      {LICENSE_TEXT}
    </div>
  );
}