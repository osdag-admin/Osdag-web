import { makeSimpleConnectionBoltedConfig } from "../../shared/configFactory";

export const buttJointBoltedConfig = makeSimpleConnectionBoltedConfig({
    sessionName: "Butt Joint Bolted",
    routePath: "/design/connections/simple/butt_joint_bolted",
    designType: "ButtJointBolted",
    hasCoverPlate: true,
});
