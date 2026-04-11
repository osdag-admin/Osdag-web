import React, { useCallback, useId, useRef, useState } from "react";
import { Button, Modal, message } from "antd";
import { isGuestUser } from "../../../utils/auth";
import {
  downloadSectionExportUser,
  downloadSectionTemplate,
  importSectionXlsx,
} from "../../../datasources/sectionsDataSource";

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
  onClearTab,
}) {
  const isGuest = isGuestProp !== undefined ? isGuestProp : isGuestUser();
  const inputId = useId();
  const fileRef = useRef(null);
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

  const runExport = useCallback(async () => {
    setBusy("export");
    try {
      await downloadSectionExportUser(sectionTable);
      message.success("Export downloaded.");
    } catch (e) {
      message.error(e?.message || "Export failed.");
    } finally {
      setBusy(null);
    }
  }, [sectionTable]);

  const handleAddClick = useCallback(() => {
    Modal.info({
      title: "Add custom section",
      width: 520,
      content: (
        <div>
          <p style={{ marginBottom: 12 }}>
            Signed-in users can save custom {sectionTable} rows to their account. Fill the
            Excel template (one row or many), then use <strong>Import xlsx file</strong>.
          </p>
          <Button
            type="primary"
            onClick={() => {
              Modal.destroyAll();
              void runTemplateDownload();
            }}
          >
            Download template
          </Button>
        </div>
      ),
    });
  }, [sectionTable, runTemplateDownload]);

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy("import");
    try {
      const { data } = await importSectionXlsx(sectionTable, file);
      const inserted = data?.inserted ?? 0;
      const ignored = data?.ignored?.length ?? 0;
      const rejected = data?.rejected?.length ?? 0;
      message.success(
        `Import finished: ${inserted} inserted, ${ignored} ignored, ${rejected} rejected.`
      );
      onRefetchModuleOptions?.();
    } catch (err) {
      message.error(err?.message || "Import failed.");
    } finally {
      setBusy(null);
    }
  };

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
      <Button
        style={{ minWidth: "140px" }}
        disabled={!canMutateSections || Boolean(busy)}
        loading={busy === "import"}
        onClick={() => fileRef.current?.click()}
      >
        Import xlsx file
      </Button>
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: "none" }}
        onChange={onFileSelected}
      />
      <Button
        style={{ minWidth: "140px" }}
        disabled={Boolean(busy)}
        loading={busy === "template"}
        onClick={() => void runTemplateDownload()}
      >
        Download template
      </Button>
      <Button
        style={{ minWidth: "140px" }}
        disabled={!canMutateSections || Boolean(busy)}
        loading={busy === "export"}
        onClick={() => void runExport()}
      >
        Export my sections
      </Button>
    </div>
  );
}
