import { makeSimpleConnectionWeldedConfig } from "../../shared/configFactory";

export const lapJointWeldedConfig = makeSimpleConnectionWeldedConfig({
    sessionName: "Lap Joint Welded",
    routePath: "/design/connections/simple/lap_joint_welded",
    designType: "LapJointWelded",
    hasCoverPlate: false,
});
