import React, { useState, useMemo } from 'react';
import {
  X,
  PhoneCall,
  Calendar,
  IndianRupee,
  Building2,
  MapPin,
  Tag,
  Paperclip,
  FileText,
  Clock,
  Send,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, ActivityLog } from '../../types/crm';

export const LeadDetailModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedLead,
    activities,
    attachmentsMeta,
    quotations,
    openModal,
    addActivityNote,
    downloadAttachmentFile,
  } = useCRM();

  const [noteInput, setNoteInput] = useState('');

  // Filter activities for this lead
  const leadActivities = useMemo(() => {
    if (!selectedLead) return [];
    return activities
      .filter((a) => a.leadId === selectedLead.id)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [activities, selectedLead]);

  // Filter attachments for this lead
  const leadAttachments = useMemo(() => {
    if (!selectedLead) return [];
    return attachmentsMeta.filter((a) => a.leadId === selectedLead.id);
  }, [attachmentsMeta, selectedLead]);

  // Filter quotations for this lead
  const leadQuotations = useMemo(() => {
    if (!selectedLead) return [];
    return quotations.filter((q) => q.leadId === selectedLead.id);
  }, [quotations, selectedLead]);

  if (activeModal !== 'lead_detail' || !selectedLead) return null;

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addActivityNote(selectedLead.id, noteInput.trim());
    setNoteInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        {/* Header with Quick Actions */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                SR #{selectedLead.srNo}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                {selectedLead.customerType}
              </span>
              <h2 className="text-lg font-bold text-slate-900">{selectedLead.businessName}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedLead.area}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono text-slate-700 font-medium">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                {selectedLead.contactNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Click to Call */}
            <a
              href={`tel:${selectedLead.contactNumber}`}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Now</span>
            </a>

            {/* Share Portfolio & Details */}
            <button
              onClick={() => openModal('share_details', selectedLead)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share Project Photos, Rate Card & Company Details"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share Portfolio & Rates</span>
            </button>

            {/* Record Response */}
            <button
              onClick={() => openModal('record_response', selectedLead)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Record Response</span>
            </button>

            {/* Close */}
            <button
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs">
          {/* Top Status & Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Customer Response</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedLead.customerResponse}</span>
              <span className="text-[10px] text-slate-400">{selectedLead.callingStatus}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Quotation Status</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedLead.quotationStatus}</span>
              <span className="text-[10px] text-slate-400">
                {leadQuotations.length} quote{leadQuotations.length === 1 ? '' : 's'} on record
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Estimated Value</span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block tabular-nums">
                ₹{selectedLead.estimatedValue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400">Priority: {selectedLead.priority}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Next Follow-up</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                {selectedLead.nextFollowUpAt
                  ? new Date(selectedLead.nextFollowUpAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : 'None scheduled'}
              </span>
              <span className="text-[10px] text-slate-400">
                {selectedLead.nextFollowUpAt
                  ? new Date(selectedLead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Set in response modal'}
              </span>
            </div>
          </div>

          {/* Customer & Technical Requirement Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Customer & Site Information
              </h3>
              <div className="space-y-1.5">
                <div>
                  <span className="text-slate-400">Category:</span>{' '}
                  <span className="font-semibold text-slate-800">{selectedLead.category}</span>
                </div>
                <div>
                  <span className="text-slate-400">Address:</span>{' '}
                  <span className="text-slate-700">{selectedLead.address || 'Address not recorded.'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Notes:</span>{' '}
                  <span className="text-slate-700">{selectedLead.notes || 'No extra notes recorded.'}</span>
                </div>
                {selectedLead.lostReason && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-700">
                    <span className="font-semibold">Reason for Loss:</span> {selectedLead.lostReason}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Current Signage Requirement
                </h3>
                <p className="mt-1 text-slate-800 leading-relaxed font-medium">
                  {selectedLead.requirement}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => openModal('quotation_builder', { leadId: selectedLead.id, prefillLead: selectedLead })}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Prepare Quotation</span>
                </button>
                <button
                  onClick={() => openModal('share_details', selectedLead)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Portfolio</span>
                </button>
                <button
                  onClick={() => openModal('file_upload', { leadId: selectedLead.id })}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Upload Files ({leadAttachments.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attachments List for this Lead */}
          {leadAttachments.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs">Attached Drawings & Files ({leadAttachments.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {leadAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        {att.fileExtension}
                      </span>
                      <span className="truncate font-medium text-slate-800 text-[11px]" title={att.fileName}>
                        {att.fileName}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadAttachmentFile(att.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold shrink-0 cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Chronological Activity Timeline</h3>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {leadActivities.length} logged events
              </span>
            </div>

            {/* Quick Note Input Box */}
            <form onSubmit={handleAddQuickNote} className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Log a quick note, site update, customer remark..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!noteInput.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </form>

            {/* Timeline Events */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {leadActivities.length > 0 ? (
                leadActivities.map((act) => {
                  return (
                    <div key={act.id} className="relative">
                      {/* Timeline node */}
                      <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white" />

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                            {new Date(act.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{act.summary}</p>

                        {/* Optional discussion parameters */}
                        {act.discussion && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                            {act.discussion.dimensions && (
                              <div>
                                <span className="text-slate-400">Dimensions:</span> {act.discussion.dimensions}
                              </div>
                            )}
                            {act.discussion.quantity && (
                              <div>
                                <span className="text-slate-400">Quantity:</span> {act.discussion.quantity}
                              </div>
                            )}
                            {act.discussion.materialPreferences && (
                              <div>
                                <span className="text-slate-400">Material:</span> {act.discussion.materialPreferences}
                              </div>
                            )}
                            {act.discussion.lightingPreferences && (
                              <div>
                                <span className="text-slate-400">Lighting:</span> {act.discussion.lightingPreferences}
                              </div>
                            )}
                            {act.discussion.budget && (
                              <div className="font-semibold text-emerald-700">
                                <span className="text-slate-400">Budget:</span> ₹{act.discussion.budget.toLocaleString('en-IN')}
                              </div>
                            )}
                            {act.discussion.nextAction && (
                              <div className="col-span-2 text-blue-700">
                                <span className="text-slate-400">Next Action:</span> {act.discussion.nextAction}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-xs italic py-2">
                  No activity history logged yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Lead created {new Date(selectedLead.createdAt).toLocaleDateString()}
          </div>
          <button
            onClick={closeModal}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
