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

const guestNoticeStyle = {
  padding: "6px 5px 0",
  fontSize: "12px",
  textAlign: "center",
  color: "#b45309",
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
  const mutationDisabledReason = isGuest
    ? "Sign in to add or import custom sections."
    : isInputLocked
      ? "Unlock the input dock to add or import custom sections."
      : undefined;

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
      try {
        await onAddSection();
      } catch (error) {
        message.error(error?.message || "Failed to add section.");
      } finally {
        setBusy(null);
      }
    }
  }, [onAddSection]);

  return (
    <>
    {isGuest && (
      <div style={guestNoticeStyle}>
        Sign in to add new designations or import sections.
      </div>
    )}
    <div style={toolbarRowStyle}>
      <Button
        style={{ minWidth: "140px" }}
        disabled={!canMutateSections || Boolean(busy)}
        title={mutationDisabledReason}
        loading={busy === "add"}
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
            title={mutationDisabledReason}
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
    </>
  );
}
