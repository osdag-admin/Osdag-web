import { makeSimpleConnectionWeldedConfig } from "../../shared/configFactory";

export const buttJointWeldedConfig = makeSimpleConnectionWeldedConfig({
    sessionName: "Butt Joint Welded",
    routePath: "/design/connections/simple/butt_joint_welded",
    designType: "ButtJointWelded",
    hasCoverPlate: true,
});
