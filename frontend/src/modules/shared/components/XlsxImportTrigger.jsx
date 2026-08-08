/* eslint-disable react/prop-types */
import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { message } from "antd";
import { importSectionXlsx } from "../../../datasources/sectionsDataSource";
import { notifyCustomSectionAdded } from "../hooks/useModuleData";

const SECTION_TABLE_OPTIONS = [
  { value: "Columns",  label: "Columns  (IS 808:2021)" },
  { value: "Beams",    label: "Beams    (IS 808:2021)" },
  { value: "Angles",   label: "Angles   (IS 808:2021)" },
  { value: "Channels", label: "Channels (IS 808:2021)" },
  { value: "SHS",      label: "SHS      (IS 4923:2017)" },
  { value: "RHS",      label: "RHS      (IS 4923:2017)" },
  { value: "CHS",      label: "CHS      (IS 1161:2014)" },
];

/**
 * Render-prop component that manages xlsx section import.
 *
 * When `sectionTable` is provided the file dialog opens immediately.
 * When omitted, a table-picker modal is shown first.
 * After a successful import an import-summary modal is shown at the
 * centre of the viewport (via a portal) and stays until dismissed.
 *
 * Usage:
 *   <XlsxImportTrigger sectionTable="Columns" onRefetchModuleOptions={fn}>
 *     {({ trigger, busy }) => <Button loading={busy} onClick={trigger}>Import</Button>}
 *   </XlsxImportTrigger>
 */
export default function XlsxImportTrigger({
  sectionTable,
  disabled = false,
  onRefetchModuleOptions,
  children,
}) {
  const inputId = useId();
  const fileRef = useRef(null);

  const [busy, setBusy]               = useState(false);
  const [pickerOpen, setPickerOpen]   = useState(false);
  const [pickedTable, setPickedTable] = useState(SECTION_TABLE_OPTIONS[0].value);
  const [importResult, setImportResult] = useState(null);

  const trigger = () => {
    if (disabled || busy) return;
    if (sectionTable) {
      fileRef.current?.click();
    } else {
      setPickerOpen(true);
    }
  };

  const handlePickerConfirm = (e) => {
    e.stopPropagation();
    fileRef.current?.click();
    setPickerOpen(false);
  };

  const handlePickerCancel = (e) => {
    e?.stopPropagation();
    setPickerOpen(false);
  };

  const resolveTable = () => sectionTable ?? pickedTable;

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const table = resolveTable();
    setBusy(true);
    try {
      const { data } = await importSectionXlsx(table, file);
      setImportResult(data);

      const insertedDesignations = Array.isArray(data?.inserted_designations)
        ? data.inserted_designations
        : [];

      insertedDesignations.forEach((designation) =>
        notifyCustomSectionAdded({ table, designation })
      );

      await onRefetchModuleOptions?.();
    } catch (err) {
      message.error(err?.message || "Import failed.");
    } finally {
      setBusy(false);
    }
  };

  const ResultModal = () => {
    if (!importResult) return null;
    const { inserted, ignored, rejected, inserted_designations } = importResult;
    const ignoredList  = Array.isArray(ignored)  ? ignored  : [];
    const rejectedList = Array.isArray(rejected)  ? rejected : [];

    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 w-[480px] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Import Summary
            </h3>
            <button
              onClick={() => setImportResult(null)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">Rows inserted:</span> {inserted}
            </div>

            {inserted_designations?.length > 0 && (
              <div>
                <span className="font-medium">Inserted designations:</span>{" "}
                {inserted_designations.join(", ")}
              </div>
            )}

            <div>
              <span className="font-medium">Rows ignored:</span> {ignoredList.length}
            </div>
            {ignoredList.length > 0 && (
              <div>
                <span className="font-medium">Ignored designations:</span>{" "}
                {ignoredList.join(", ")}
              </div>
            )}

            <div>
              <span className="font-medium">Rows rejected:</span> {rejectedList.length}
            </div>
            {rejectedList.length > 0 && (
              <ul className="list-disc list-inside ml-4 space-y-1">
                {rejectedList.map((r, idx) => (
                  <li key={idx}>
                    Row {r.row}: {r.reason}
                    {r.errors ? ` — ${JSON.stringify(r.errors)}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setImportResult(null)}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      {children({ trigger, busy })}

      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: "none" }}
        onChange={onFileSelected}
      />

      {/* Table-picker modal — rendered inline so it stays inside the parent
          DOM tree and doesn't trigger ancestor click-outside handlers. */}
      {!sectionTable && pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={handlePickerCancel}
        >
          <div
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-osdag-green rounded-xl shadow-xl p-6 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Select section table
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choose which section database to import into:
            </p>

            <div className="space-y-2 mb-6">
              {SECTION_TABLE_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={`${inputId}-table`}
                    value={value}
                    checked={pickedTable === value}
                    onChange={() => setPickedTable(value)}
                    className="w-4 h-4 accent-osdag-green"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-osdag-green transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handlePickerCancel}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePickerConfirm}
                className="px-4 py-2 text-sm bg-osdag-green text-white rounded-lg hover:bg-osdag-green/90 transition-colors"
              >
                Choose file…
              </button>
            </div>
          </div>
        </div>
      )}

      <ResultModal />
    </>
  );
}