import { useState } from "react";

/**
 * Handles design report modal state and submission.
 * Keeps legacy payload build but defers actual report generation to caller.
 */
export const useDesignReport = (
  service,
  moduleConfig,
  output,
  logs,
  inputs,
  allSelected,
  extraState,
  moduleData
) => {
  const [createDesignReportBool, setCreateDesignReportBool] = useState(false);
  const [designReportInputs, setDesignReportInputs] = useState({
    companyName: "Your company",
    groupTeamName: "Your team",
    designer: "You",
    projectTitle: "",
    subtitle: "",
    jobNumber: "1",
    client: "Someone else",
    additionalComments: "No comments",
    companyLogo: null,
    companyLogoName: "",
  });

  const open = () => setCreateDesignReportBool(true);

  const submit = async (selectedSections = []) => {
    if (!output) {
      alert("Please submit the design first.");
      return;
    }

    try {
      const { beamList, columnList, angleList, boltDiameterList, propertyClassList, thicknessList, channelList, weldSizeList } = moduleData || {};

      const submissionParams = moduleConfig.buildSubmissionParams(
        inputs,
        allSelected,
        {
          boltDiameterList,
          propertyClassList,
          thicknessList,
          angleList,
          beamList,
          columnList,
          channelList,
          weldSizeList
        },
        extraState
      );

      const payload = {
        ...designReportInputs,
        moduleId: moduleConfig.designType,
        inputValues: submissionParams,
        designStatus: true,
        logs: logs || [],
      };

      if (selectedSections && selectedSections.length > 0) {
        payload.sections = selectedSections;
      }

      const result = await service.generateInitialReport(
        moduleConfig?.designType,
        payload
      );
      if (result?.success) {
        close();
      } else {
        alert(`Failed to generate design report: ${result?.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Error generating design report: ${error.message}`);
    }
  };

  const close = () => {
    setDesignReportInputs({
      companyName: "Your company",
      groupTeamName: "Your team",
      designer: "You",
      projectTitle: "",
      subtitle: "",
      jobNumber: "1",
      client: "Someone else",
      additionalComments: "No comments",
      companyLogo: null,
      companyLogoName: "",
    });
    setCreateDesignReportBool(false);
  };

  return {
    createDesignReportBool,
    designReportInputs,
    setDesignReportInputs,
    open,
    submit,
    close,
  };
};

