/* eslint-disable react/prop-types */
import { useCallback, useState } from "react";
import { Button, message } from "antd";
import { isGuestUser } from "../../../utils/auth";
import {
  downloadSectionTemplate,
} from "../../../datasources/sectionsDataSource";
import XlsxImportTrigger from "./XlsxImportTrigger";

const toolbarRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  justifyContent: "space-around",
  padding: "5px",
  borderTop: "1px solid #ccc",
};

/**
 * Section tools: template (guest OK), export/import/add (signed-in + unlocked), clear (local prefs).
 */
export default function SectionTabToolbar({
  sectionTable,
  isInputLocked = false,
  isGuest: isGuestProp,
  onRefetchModuleOptions,
  dropdownLists,
  onClearTab,
  onAddSection,
}) {
  const isGuest = isGuestProp !== undefined ? isGuestProp : isGuestUser();
  const [busy, setBusy] = useState(null);

  const canMutateSections = !isGuest && !isInputLocked;
  const canClearLocal = !isInputLocked;

  const runTemplateDownload = useCallback(async () => {
    setBusy("template");
    try {
      await downloadSectionTemplate(sectionTable);
      message.success("Template downloaded.");
    } catch (e) {
      message.error(e?.message || "Template download failed.");
    } finally {
      setBusy(null);
    }
  }, [sectionTable]);


  const handleAddClick = useCallback(async () => {
    if (onAddSection) {
      setBusy("add");
      await onAddSection();
      setBusy(null);
    }
  }, [onAddSection]);

  return (
    <div style={toolbarRowStyle}>
      <Button
        style={{ minWidth: "140px" }}
        disabled={!canMutateSections || Boolean(busy)}
        onClick={handleAddClick}
      >
        Add
      </Button>
      <Button
        style={{ minWidth: "140px" }}
        disabled={!canClearLocal || Boolean(busy)}
        onClick={() => onClearTab?.()}
      >
        Clear
      </Button>

      <XlsxImportTrigger
        sectionTable={sectionTable}
        disabled={!canMutateSections || Boolean(busy)}
        onRefetchModuleOptions={onRefetchModuleOptions}
        dropdownLists={dropdownLists}
      >
        {({ trigger, busy: importBusy }) => (
          <Button
            style={{ minWidth: "140px" }}
            disabled={!canMutateSections || Boolean(busy) || importBusy}
            loading={importBusy}
            onClick={trigger}
          >
            Import xlsx file
          </Button>
        )}
      </XlsxImportTrigger>

      <Button
        style={{ minWidth: "140px" }}
        disabled={Boolean(busy)}
        loading={busy === "template"}
        onClick={() => void runTemplateDownload()}
      >
        Download xlsx file
      </Button>
      
    </div>
  );
}
