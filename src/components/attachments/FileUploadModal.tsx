import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  File,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const FileUploadModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    leads,
    selectedLead,
    uploadAttachment,
    showToast,
  } = useCRM();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetLeadId, setTargetLeadId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    if (selectedLead) {
      setTargetLeadId(selectedLead.id);
    } else if (leads.length > 0) {
      setTargetLeadId(leads[0].id);
    }
    setSelectedFiles([]);
    setDescription('');
  }, [selectedLead, leads, activeModal]);

  if (activeModal !== 'file_upload') return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      showToast('Please select at least one file to upload.', 'error');
      return;
    }
    if (!targetLeadId) {
      showToast('Please select a lead to attach these files to.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadAttachment(targetLeadId, file, undefined, description);
      }
      showToast(`Saved ${selectedFiles.length} file(s) into IndexedDB!`, 'success');
      closeModal();
    } catch (err: any) {
      console.error(err);
      showToast(`Upload failed: ${err.message || 'Storage error'}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Design & CAD Drawings</h3>
            <p className="text-xs text-slate-500">
              Unrestricted file formats: CDR, DXF, DWG, AI, PSD, PDF, EPS, ZIP, etc.
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4 text-xs">
          {/* Lead Association */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Associate with Lead <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetLeadId}
              onChange={(e) => setTargetLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.businessName} ({l.contactNumber}) — {l.area}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all text-center"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800">Choose or Drop Any Drawing / File</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              No extension restrictions. Stored securely inside your browser's IndexedDB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-semibold text-slate-700">Selected Files ({selectedFiles.length}):</div>
              <div className="max-h-36 overflow-y-auto space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 shrink-0 uppercase">
                        {file.name.includes('.') ? file.name.split('.').pop() : 'FILE'}
                      </span>
                      <span className="truncate font-medium text-slate-800" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Optional Notes / Remarks</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Approved CorelDraw vector artwork, DXF CNC routing paths"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedFiles.length === 0 || isUploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer disabled:opacity-40 shadow-sm shadow-blue-500/20"
            >
              {isUploading ? 'Saving to IndexedDB...' : `Upload ${selectedFiles.length} File(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
