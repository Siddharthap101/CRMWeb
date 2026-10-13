import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Download,
  Share2,
  Copy,
  RotateCcw,
  CheckCircle,
  XCircle,
  Filter,
  IndianRupee,
  Search,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Quotation } from '../../types/crm';
import { downloadQuotationPDF } from '../../services/pdf';

export const QuotationsListView: React.FC = () => {
  const {
    quotations,
    settings,
    openModal,
    setSelectedQuotation,
    updateQuotationStatus,
    duplicateQuotation,
    createRevision,
    showToast,
  } = useCRM();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredQuotes = useMemo(() => {
    return quotations.filter((q) => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          q.quotationNumber.toLowerCase().includes(query) ||
          q.businessName.toLowerCase().includes(query) ||
          q.contactNumber.toLowerCase().includes(query) ||
          q.requirement.toLowerCase().includes(query);
        if (!matches) return false;
      }
      return true;
    });
  }, [quotations, statusFilter, search]);

  const handleEdit = (q: Quotation) => {
    setSelectedQuotation(q);
    openModal('quotation_builder', q);
  };

  const handlePreview = (q: Quotation) => {
    setSelectedQuotation(q);
    openModal('quotation_preview', q);
  };

  const handleDownload = (q: Quotation) => {
    downloadQuotationPDF(q, settings);
    showToast(`Downloaded ${q.quotationNumber}.pdf`, 'success');
  };

  const handleWhatsApp = (q: Quotation) => {
    setSelectedQuotation(q);
    openModal('whatsapp_share', q);
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateQuotation(id);
    setSelectedQuotation(duplicated);
    openModal('quotation_builder', duplicated);
  };

  const handleRevision = (id: string) => {
    const rev = createRevision(id);
    setSelectedQuotation(rev);
    openModal('quotation_builder', rev);
  };

  const totalPipelineValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
  const acceptedValue = quotations
    .filter((q) => q.status === 'Accepted')
    .reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header and Summary Cards */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Quotations & Pricing Estimates</h2>
            <p className="text-xs text-slate-500">
              Manage client quotations, version revisions, PDF downloads, and WhatsApp sharing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('quotation_builder')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Quotation</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Quotes</span>
            <div className="text-base font-bold text-slate-900 tabular-nums">{quotations.length}</div>
          </div>

          <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200">
            <span className="text-[11px] text-blue-700 uppercase font-semibold">Pipeline Value</span>
            <div className="text-base font-bold text-blue-800 tabular-nums font-mono">
              ₹{totalPipelineValue.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-700 uppercase font-semibold">Accepted Deals</span>
            <div className="text-base font-bold text-emerald-800 tabular-nums font-mono">
              ₹{acceptedValue.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Shared with Clients</span>
            <div className="text-base font-bold text-slate-900 tabular-nums">
              {quotations.filter((q) => q.status === 'Shared').length}
            </div>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1">
            {[
              { id: 'all', label: 'All Quotations' },
              { id: 'Draft', label: 'Draft' },
              { id: 'Prepared', label: 'Prepared' },
              { id: 'Shared', label: 'Shared' },
              { id: 'Accepted', label: 'Accepted' },
              { id: 'Rejected', label: 'Rejected' },
              { id: 'Revised', label: 'Revised' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quote no, customer..."
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Quotation #</th>
                <th className="py-3 px-3">Customer / Bill To</th>
                <th className="py-3 px-3">Date & Validity</th>
                <th className="py-3 px-3">Items Count</th>
                <th className="py-3 px-3">Grand Total (₹)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((q) => {
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Quote Number & Version */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => handlePreview(q)}
                          className="font-mono font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{q.quotationNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Version {q.version}
                        </div>
                      </td>

                      {/* Customer / Bill To */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{q.businessName}</div>
                        <div className="text-[11px] text-slate-500 font-mono tabular-nums">{q.contactNumber}</div>
                        {q.requirement && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{q.requirement}</div>
                        )}
                      </td>

                      {/* Date & Validity */}
                      <td className="py-3 px-3 tabular-nums text-slate-700">
                        <div className="font-mono">{q.date}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Valid: {q.validityDate} ({q.validityDays}d)
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {q.items.length} item{q.items.length === 1 ? '' : 's'}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono tabular-nums text-sm">
                        ₹{q.grandTotal.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                            q.status === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : q.status === 'Prepared'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : q.status === 'Shared'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : q.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : q.status === 'Revised'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview PDF */}
                          <button
                            onClick={() => handlePreview(q)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Preview Quotation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownload(q)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Share WhatsApp */}
                          <button
                            onClick={() => handleWhatsApp(q)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(q)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(q.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Duplicate Quote"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Create Revision */}
                          <button
                            onClick={() => handleRevision(q.id)}
                            className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                            title="Create Revised Version (v2)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {/* Mark Accepted */}
                          {q.status !== 'Accepted' && (
                            <button
                              onClick={() => updateQuotationStatus(q.id, 'Accepted', 'Client approved quotation')}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                              title="Mark Accepted (Won Deal)"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Mark Rejected */}
                          {q.status !== 'Rejected' && (
                            <button
                              onClick={() => updateQuotationStatus(q.id, 'Rejected', 'Client declined quotation')}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Mark Rejected"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No quotations found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Create quotations from leads or click "Create New Quotation" above.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
