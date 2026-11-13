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

const describeProblem = (p) => {
  const found = p.value === null || p.value === undefined || p.value === "" ? "" : ` (found "${p.value}")`;
  switch (p.issue) {
    case "empty":
      return `"${p.key}" is empty`;
    case "text_number":
      return `"${p.key}" is text, not a number${found} - format the cell as a number`;
    default:
      return `"${p.key}" must be a number${found}`;
  }
};

const describeRejection = (r) => {
  switch (r.reason) {
    case "missing_or_empty_designation":
    case "missing_designation":
      return ["Designation is empty"];
    case "cell_validation_failed":
      return Array.isArray(r.problems) && r.problems.length > 0
        ? r.problems.map(describeProblem)
        : ["A cell has an invalid value"];
    case "serializer_validation": {
      const entries = r.errors && typeof r.errors === "object" ? Object.entries(r.errors) : [];
      return entries.length > 0
        ? entries.map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
        : ["Values are not valid for this section type"];
    }
    default:
      return [r.reason || "Row could not be imported"];
  }
};

const describeSkipped = (r) => {
  switch (r.reason) {
    case "catalog_duplicate":
      return "Already in the standard database";
    case "user_duplicate":
      return "Already in your custom sections";
    case "repeated_in_file":
      return `Repeated in this file (first on row ${r.first_row})`;
    default:
      return "Already exists";
  }
};

const describeHeaderMismatch = (data) => {
  const expected = Array.isArray(data?.expected) ? data.expected : [];
  const got = Array.isArray(data?.got) ? data.got.map((h) => String(h).trim()) : [];
  const missing = expected.filter((h) => !got.includes(h));
  const extra = got.filter((h) => h && !expected.includes(h));
  return { missing, extra };
};

const StatCard = ({ label, value, tone }) => (
  <div className={`flex-1 rounded-lg border px-3 py-2 text-center ${tone}`}>
    <div className="text-xl font-semibold">{value}</div>
    <div className="text-xs">{label}</div>
  </div>
);

const ModalShell = ({ title, onClose, children: body }) =>
  createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 w-[560px] max-w-[95vw] max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">{body}</div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

const ResultModal = ({ importResult, onClose }) => {
  if (!importResult) return null;
  const { inserted = 0, rejected, ignored, inserted_designations, table } = importResult;
  const ignoredList = Array.isArray(ignored) ? ignored : [];
  const rejectedList = Array.isArray(rejected) ? rejected : [];
  const insertedList = Array.isArray(inserted_designations) ? inserted_designations : [];

  let summary = "All rows were imported.";
  if (rejectedList.length > 0 && inserted > 0) {
    summary = "The valid rows were imported. Fix the rejected rows in your file and import it again.";
  } else if (rejectedList.length > 0) {
    summary = "No rows were imported. Fix the rejected rows in your file and import it again.";
  } else if (inserted === 0 && ignoredList.length > 0) {
    summary = "Nothing new to import. All rows were skipped as duplicates.";
  } else if (inserted === 0) {
    summary = "The file has no data rows.";
  }

  return (
    <ModalShell title={`Import Summary${table ? ` — ${table}` : ""}`} onClose={onClose}>
      <div className="flex gap-2">
        <StatCard label="Imported" value={inserted} tone="border-green-300 bg-green-50 text-green-800" />
        <StatCard label="Skipped" value={ignoredList.length} tone="border-amber-300 bg-amber-50 text-amber-800" />
        <StatCard label="Rejected" value={rejectedList.length} tone="border-red-300 bg-red-50 text-red-800" />
      </div>

      <p>{summary}</p>

      {rejectedList.length > 0 && (
        <div>
          <div className="font-medium mb-1">Rejected rows (not imported)</div>
          <div className="max-h-56 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-2 py-1 w-14">Row</th>
                  <th className="px-2 py-1 w-32">Designation</th>
                  <th className="px-2 py-1">Problem</th>
                </tr>
              </thead>
              <tbody>
                {rejectedList.map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800 align-top">
                    <td className="px-2 py-1">{r.row}</td>
                    <td className="px-2 py-1 break-words">{r.designation || "—"}</td>
                    <td className="px-2 py-1 text-red-700 dark:text-red-400">
                        {describeRejection(r).map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ignoredList.length > 0 && (
        <div>
          <div className="font-medium mb-1">Skipped (not imported)</div>
          <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-2 py-1 w-14">Row</th>
                  <th className="px-2 py-1 w-32">Designation</th>
                  <th className="px-2 py-1">Reason</th>
                </tr>
              </thead>
              <tbody>
                {ignoredList.map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-100 dark:border-gray-800 align-top">
                    <td className="px-2 py-1">{r.row}</td>
                    <td className="px-2 py-1 break-words">{r.designation}</td>
                    <td className="px-2 py-1 text-amber-700 dark:text-amber-400">{describeSkipped(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {insertedList.length > 0 && (
        <div>
          <div className="font-medium mb-1">Imported designations</div>
          <div className="max-h-24 overflow-y-auto text-xs">{insertedList.join(", ")}</div>
        </div>
      )}
    </ModalShell>
  );
};

const FileErrorModal = ({ importFileError, onClose }) => {
  if (!importFileError) return null;
  const { table, message: errMessage, missing, extra } = importFileError;
  return (
    <ModalShell title={`Import failed — ${table}`} onClose={onClose}>
      <p>{errMessage}</p>
      <p>No rows were imported. The first row of the sheet must contain the same column names as the template.</p>
      {missing.length > 0 && (
        <div>
          <div className="font-medium mb-1">Missing columns</div>
          <div className="text-xs text-red-700 dark:text-red-400">{missing.join(", ")}</div>
        </div>
      )}
      {extra.length > 0 && (
        <div>
          <div className="font-medium mb-1">Unrecognised columns</div>
          <div className="text-xs">{extra.join(", ")}</div>
        </div>
      )}
    </ModalShell>
  );
};

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
  const [importFileError, setImportFileError] = useState(null);

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
      setImportResult({ ...data, table });

      const insertedDesignations = Array.isArray(data?.inserted_designations)
        ? data.inserted_designations
        : [];

      insertedDesignations.forEach((designation) =>
        notifyCustomSectionAdded({ table, designation })
      );

      await onRefetchModuleOptions?.();
    } catch (err) {
      if (err?.data?.expected) {
        setImportFileError({ table, message: err.message, ...describeHeaderMismatch(err.data) });
      } else {
        message.error(err?.message || "Import failed.");
      }
    } finally {
      setBusy(false);
    }
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

      <ResultModal importResult={importResult} onClose={() => setImportResult(null)} />
      <FileErrorModal importFileError={importFileError} onClose={() => setImportFileError(null)} />
    </>
  );
}