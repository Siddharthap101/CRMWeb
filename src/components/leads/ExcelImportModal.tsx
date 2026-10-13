import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import {
  parseLeadsSpreadsheet,
  downloadLeadTemplate,
  ImportParseResult,
  ImportPreviewRow,
} from '../../services/excel';

export const ExcelImportModal: React.FC = () => {
  const { activeModal, closeModal, leads, importLeadsBatch, showToast } = useCRM();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [duplicateMode, setDuplicateMode] = useState<'skip' | 'update' | 'all'>('skip');
  const [activeTab, setActiveTab] = useState<'valid' | 'invalid' | 'duplicates'>('valid');

  if (activeModal !== 'excel_import') return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await parseLeadsSpreadsheet(file, leads);
      setParseResult(result);
      if (result.validRows.length === 0 && result.invalidRows.length > 0) {
        setActiveTab('invalid');
      } else if (result.duplicateRows.length > 0) {
        setActiveTab('duplicates');
      } else {
        setActiveTab('valid');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to parse spreadsheet file.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await parseLeadsSpreadsheet(file, leads);
      setParseResult(result);
    } catch (err: any) {
      showToast(err.message || 'Failed to parse dropped file.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitImport = () => {
    if (!parseResult) return;

    // Filter valid rows depending on duplicateMode
    let rowsToImport: ImportPreviewRow[] = [];
    if (duplicateMode === 'skip') {
      rowsToImport = parseResult.validRows.filter((r) => !r.isDuplicate);
    } else if (duplicateMode === 'update') {
      rowsToImport = parseResult.validRows; // includes duplicates marked for update
    } else {
      // 'all'
      rowsToImport = parseResult.validRows;
    }

    if (rowsToImport.length === 0) {
      showToast('No records selected to import.', 'error');
      return;
    }

    const count = importLeadsBatch(rowsToImport, duplicateMode === 'update');
    showToast(`Successfully imported ${count} leads into CRM!`, 'success');
    closeModal();
  };

  const resetImport = () => {
    setParseResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Leads Spreadsheet</h3>
            <p className="text-xs text-slate-500">
              Import leads from .xlsx, .xls, or .csv files with column mapping & duplicate checking
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {!parseResult ? (
            /* Upload Drop Area */
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-sm">
                  {isLoading ? 'Parsing Spreadsheet...' : 'Choose or Drag Excel / CSV File'}
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Supports .xlsx, .xls, and .csv formats. Browser-based client parsing ensures complete privacy.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Template Download Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Need a blank template?</div>
                    <div className="text-[11px] text-slate-500">
                      Standard columns: SR No, Area, Business Name, Contact Number, Address, Calling Status, Requirement, Quotation.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={downloadLeadTemplate}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank Template</span>
                </button>
              </div>
            </div>
          ) : (
            /* Preview & Validation Results */
            <div className="space-y-4">
              {/* Summary Stats Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Rows</span>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">{parseResult.totalRows}</div>
                  <span className="text-[10px] text-slate-400">{parseResult.fileName}</span>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 uppercase font-semibold">Valid Records</span>
                  <div className="text-lg font-bold text-emerald-800 tabular-nums">
                    {parseResult.validRows.length - parseResult.duplicateRows.length}
                  </div>
                  <span className="text-[10px] text-emerald-600">Ready to import</span>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
                  <span className="text-[11px] text-amber-700 uppercase font-semibold">Duplicates Found</span>
                  <div className="text-lg font-bold text-amber-800 tabular-nums">
                    {parseResult.duplicateRows.length}
                  </div>
                  <span className="text-[10px] text-amber-600">Existing phone numbers</span>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
                  <span className="text-[11px] text-rose-700 uppercase font-semibold">Invalid Rows</span>
                  <div className="text-lg font-bold text-rose-800 tabular-nums">
                    {parseResult.invalidRows.length}
                  </div>
                  <span className="text-[10px] text-rose-600">Missing name / phone</span>
                </div>
              </div>

              {/* Duplicate Handling Option */}
              {parseResult.duplicateRows.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>How would you like to handle the {parseResult.duplicateRows.length} duplicate contacts?</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-amber-900">
                      <input
                        type="radio"
                        name="dupMode"
                        checked={duplicateMode === 'skip'}
                        onChange={() => setDuplicateMode('skip')}
                        className="text-amber-600"
                      />
                      <span>Skip duplicates (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-amber-900">
                      <input
                        type="radio"
                        name="dupMode"
                        checked={duplicateMode === 'update'}
                        onChange={() => setDuplicateMode('update')}
                        className="text-amber-600"
                      />
                      <span>Update existing leads with new data</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-amber-900">
                      <input
                        type="radio"
                        name="dupMode"
                        checked={duplicateMode === 'all'}
                        onChange={() => setDuplicateMode('all')}
                        className="text-amber-600"
                      />
                      <span>Import duplicates as new records</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Preview Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('valid')}
                  className={`px-3 py-2 font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
                    activeTab === 'valid'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Valid Rows ({parseResult.validRows.length})
                </button>
                {parseResult.duplicateRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('duplicates')}
                    className={`px-3 py-2 font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
                      activeTab === 'duplicates'
                        ? 'border-amber-600 text-amber-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Duplicates ({parseResult.duplicateRows.length})
                  </button>
                )}
                {parseResult.invalidRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('invalid')}
                    className={`px-3 py-2 font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
                      activeTab === 'invalid'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Invalid Rows ({parseResult.invalidRows.length})
                  </button>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-2.5">Row</th>
                      <th className="py-2 px-2.5">SR No</th>
                      <th className="py-2 px-2.5">Business Name</th>
                      <th className="py-2 px-2.5">Contact Number</th>
                      <th className="py-2 px-2.5">Area</th>
                      <th className="py-2 px-2.5">Requirement</th>
                      <th className="py-2 px-2.5">Status / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeTab === 'valid' &&
                      parseResult.validRows.map((r) => (
                        <tr key={r.rowNumber} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 text-slate-400 tabular-nums">#{r.rowNumber}</td>
                          <td className="py-2 px-2.5 font-mono tabular-nums">{r.srNo}</td>
                          <td className="py-2 px-2.5 font-semibold text-slate-900">{r.businessName}</td>
                          <td className="py-2 px-2.5 font-mono tabular-nums text-slate-600">{r.contactNumber}</td>
                          <td className="py-2 px-2.5 text-slate-700">{r.area}</td>
                          <td className="py-2 px-2.5 text-slate-700 truncate max-w-xs">{r.requirement}</td>
                          <td className="py-2 px-2.5">
                            {r.isDuplicate ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                Duplicate Contact
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                    {activeTab === 'duplicates' &&
                      parseResult.duplicateRows.map((r) => (
                        <tr key={r.rowNumber} className="bg-amber-50/20 hover:bg-amber-50/40">
                          <td className="py-2 px-2.5 text-slate-400 tabular-nums">#{r.rowNumber}</td>
                          <td className="py-2 px-2.5 font-mono tabular-nums">{r.srNo}</td>
                          <td className="py-2 px-2.5 font-semibold text-slate-900">{r.businessName}</td>
                          <td className="py-2 px-2.5 font-mono tabular-nums text-slate-700">{r.contactNumber}</td>
                          <td className="py-2 px-2.5 text-slate-700">{r.area}</td>
                          <td className="py-2 px-2.5 text-slate-700 truncate max-w-xs">{r.requirement}</td>
                          <td className="py-2 px-2.5 text-amber-800 text-[11px]">
                            Matches existing: {r.duplicateWithLead?.businessName || 'Lead in file'}
                          </td>
                        </tr>
                      ))}

                    {activeTab === 'invalid' &&
                      parseResult.invalidRows.map((r) => (
                        <tr key={r.rowNumber} className="bg-rose-50/20 hover:bg-rose-50/40">
                          <td className="py-2 px-2.5 text-rose-500 font-bold tabular-nums">Row #{r.rowNumber}</td>
                          <td className="py-2 px-2.5 font-mono tabular-nums">{r.srNo}</td>
                          <td className="py-2 px-2.5 text-slate-700">{r.businessName || '<Missing Name>'}</td>
                          <td className="py-2 px-2.5 text-slate-700 font-mono">{r.contactNumber || '<Missing Phone>'}</td>
                          <td className="py-2 px-2.5 text-slate-500">{r.area}</td>
                          <td className="py-2 px-2.5 text-slate-500 truncate max-w-xs">{r.requirement}</td>
                          <td className="py-2 px-2.5 text-rose-600 font-semibold">{r.validationError}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          {parseResult ? (
            <button
              type="button"
              onClick={resetImport}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← Choose another file
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {parseResult && (
              <button
                type="button"
                onClick={handleCommitImport}
                disabled={parseResult.validRows.length === 0}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-40 shadow-sm shadow-blue-500/20"
              >
                Import {duplicateMode === 'skip' ? parseResult.validRows.filter(r => !r.isDuplicate).length : parseResult.validRows.length} Valid Records
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
