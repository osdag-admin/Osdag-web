/* eslint-disable react/prop-types */
import { useState } from "react";
import { downloadSectionCatalog, downloadSectionTemplate } from "../../datasources/sectionsDataSource";

const SECTION_TABLE_OPTIONS = [
  { value: "Beams",    label: "Beams    (IS 808:2021)" },
  { value: "Columns",  label: "Columns  (IS 808:2021)" },
  { value: "Channels", label: "Channels (IS 808:2021)" },
  { value: "Angles",   label: "Angles   (IS 808:2021)" },
  { value: "SHS",      label: "SHS      (IS 4923:2017)" },
  { value: "RHS",      label: "RHS      (IS 4923:2017)" },
  { value: "CHS",      label: "CHS      (IS 1161:2014)" },
];

export default function XlsxDownloadModal({ isOpen, onClose }) {
  const [downloadTable, setDownloadTable] = useState("Beams");
  const [downloadFormat, setDownloadFormat] = useState("catalog");
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setBusy(true);
    try {
      if (downloadFormat === "template") {
        await downloadSectionTemplate(downloadTable);
      } else {
        await downloadSectionCatalog(downloadTable);
      }
      onClose();
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download section file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-osdag-green rounded-xl shadow-2xl p-6 w-[420px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Download Section Database (.xlsx)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Select Section Database Table:
            </label>
            <select
              value={downloadTable}
              onChange={(e) => setDownloadTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
            >
              {SECTION_TABLE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              File Type:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="download-format"
                  value="catalog"
                  checked={downloadFormat === "catalog"}
                  onChange={() => setDownloadFormat("catalog")}
                  className="accent-osdag-green"
                />
                <span>Full Catalog Data</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="download-format"
                  value="template"
                  checked={downloadFormat === "template"}
                  onChange={() => setDownloadFormat("template")}
                  className="accent-osdag-green"
                />
                <span>Blank Template</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={busy}
            className="px-4 py-2 text-sm bg-osdag-green text-white rounded-lg hover:bg-osdag-green/90 transition-colors font-medium disabled:opacity-50"
          >
            {busy ? "Downloading…" : "Download .xlsx"}
          </button>
        </div>
      </div>
    </div>
  );
}
