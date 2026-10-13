import React, { useState } from 'react';
import {
  Paperclip,
  Download,
  Trash2,
  Plus,
  File,
  Eye,
  Building2,
  HardDrive,
  Clock,
  Search,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const AttachmentsView: React.FC = () => {
  const {
    attachmentsMeta,
    leads,
    openModal,
    setSelectedLead,
    downloadAttachmentFile,
    deleteAttachment,
  } = useCRM();

  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredAttachments = attachmentsMeta.filter((att) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const relatedLead = leads.find((l) => l.id === att.leadId);
    return (
      att.fileName.toLowerCase().includes(q) ||
      att.fileExtension.toLowerCase().includes(q) ||
      (att.description && att.description.toLowerCase().includes(q)) ||
      (relatedLead && relatedLead.businessName.toLowerCase().includes(q))
    );
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getExtensionColor = (ext: string) => {
    switch (ext.toUpperCase()) {
      case 'CDR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DXF':
      case 'DWG':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AI':
      case 'PSD':
      case 'EPS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PDF':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'ZIP':
      case 'RAR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Design Drawings & File Attachments</h2>
            <p className="text-xs text-slate-500">
              Browser-stored IndexedDB repository for CAD (DXF/DWG), CorelDraw (CDR), vector AI, and design PDFs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('file_upload')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Drawing / File</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drawings by filename, extension, client..."
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <span className="text-xs text-slate-500 tabular-nums">
            {filteredAttachments.length} file{filteredAttachments.length === 1 ? '' : 's'} stored
          </span>
        </div>
      </div>

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredAttachments.length > 0 ? (
          filteredAttachments.map((att) => {
            const relatedLead = leads.find((l) => l.id === att.leadId);

            return (
              <div
                key={att.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  {/* Top extension & size */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${getExtensionColor(
                        att.fileExtension
                      )}`}
                    >
                      .{att.fileExtension}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {formatBytes(att.fileSize)}
                    </span>
                  </div>

                  {/* File Name */}
                  <h3 className="font-bold text-slate-900 text-xs truncate" title={att.fileName}>
                    {att.fileName}
                  </h3>

                  {/* Description if present */}
                  {att.description && (
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                      {att.description}
                    </p>
                  )}

                  {/* Related Lead */}
                  {relatedLead && (
                    <div
                      onClick={() => {
                        setSelectedLead(relatedLead);
                        openModal('lead_detail', relatedLead);
                      }}
                      className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 cursor-pointer"
                    >
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate font-medium">{relatedLead.businessName}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 mt-1">
                    Uploaded: {new Date(att.uploadedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => downloadAttachmentFile(att.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>

                  <button
                    onClick={() => setDeleteId(att.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Paperclip className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No files uploaded yet</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload customer CDR logos, architectural CAD DXF/DWG drawings, or quotation references.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Stored File"
        message="Are you sure you want to delete this file attachment from your browser's IndexedDB storage? This cannot be undone."
        confirmLabel="Delete File"
        onConfirm={() => {
          if (deleteId) {
            deleteAttachment(deleteId);
            setDeleteId(null);
          }
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
