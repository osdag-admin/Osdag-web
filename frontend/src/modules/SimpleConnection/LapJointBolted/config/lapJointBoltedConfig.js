import { makeSimpleConnectionBoltedConfig } from "../../shared/configFactory";

export const lapJointBoltedConfig = makeSimpleConnectionBoltedConfig({
    sessionName: "Lap Joint Bolted",
    routePath: "/design/connections/simple/lap_joint_bolted",
    designType: "LapJointBolted",
    hasCoverPlate: false,
});
