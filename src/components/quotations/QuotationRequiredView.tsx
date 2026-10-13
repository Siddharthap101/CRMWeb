import React, { useState, useMemo } from 'react';
import {
  FileQuestion,
  FileText,
  Paperclip,
  PhoneCall,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead } from '../../types/crm';

export const QuotationRequiredView: React.FC = () => {
  const {
    leads,
    quotations,
    attachmentsMeta,
    openModal,
    setSelectedLead,
    setSelectedQuotation,
  } = useCRM();

  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter leads that need a quote or are in the quote pipeline
  const quoteLeads = useMemo(() => {
    return leads.filter((lead) => {
      const isQuoteTarget =
        lead.customerResponse === 'Required Quotation' ||
        lead.quotationStatus !== 'Not Needed';

      if (!isQuoteTarget) return false;

      if (statusFilter !== 'all') {
        if (statusFilter === 'Design Pending' && lead.quotationStatus !== 'Design Pending') return false;
        if (statusFilter === 'Design Received' && lead.quotationStatus !== 'Design Received') return false;
        if (statusFilter === 'Prepared' && lead.quotationStatus !== 'Prepared') return false;
        if (statusFilter === 'Shared' && lead.quotationStatus !== 'Shared') return false;
        if (statusFilter === 'Accepted' && lead.quotationStatus !== 'Accepted') return false;
        if (statusFilter === 'Rejected' && lead.quotationStatus !== 'Rejected') return false;
      }

      return true;
    });
  }, [leads, statusFilter]);

  const handleCreateQuotation = (lead: Lead) => {
    setSelectedLead(lead);
    openModal('quotation_builder', { leadId: lead.id, prefillLead: lead });
  };

  const handleOpenExistingQuote = (lead: Lead) => {
    const existing = quotations.find((q) => q.leadId === lead.id || q.id === lead.quotationId);
    if (existing) {
      setSelectedQuotation(existing);
      openModal('quotation_builder', existing);
    } else {
      handleCreateQuotation(lead);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Quotation Required Pipeline</h2>
            <p className="text-xs text-slate-500">
              Manage leads awaiting signage estimates, design drawings approval, and quotation dispatch
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 tabular-nums">
              {quoteLeads.length} in pipeline
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          {[
            { id: 'all', label: 'All Quotation Leads' },
            { id: 'Design Pending', label: 'Design Pending' },
            { id: 'Design Received', label: 'Design Received' },
            { id: 'Prepared', label: 'Quotation Prepared' },
            { id: 'Shared', label: 'Quotation Shared' },
            { id: 'Accepted', label: 'Accepted (Won)' },
            { id: 'Rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-indigo-100 text-indigo-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Business & Contact</th>
                <th className="py-3 px-3">Area & Category</th>
                <th className="py-3 px-3">Requirement</th>
                <th className="py-3 px-3">Drawing / Files</th>
                <th className="py-3 px-3">Quotation Status</th>
                <th className="py-3 px-3">Quote / Est Amount</th>
                <th className="py-3 px-3">Next Action / Follow-up</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {quoteLeads.length > 0 ? (
                quoteLeads.map((lead) => {
                  const leadFiles = attachmentsMeta.filter((a) => a.leadId === lead.id);
                  const existingQuote = quotations.find((q) => q.leadId === lead.id || q.id === lead.quotationId);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Business & Contact */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => {
                            setSelectedLead(lead);
                            openModal('lead_detail', lead);
                          }}
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                        >
                          {lead.businessName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                          <a href={`tel:${lead.contactNumber}`} className="hover:text-blue-600 flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-slate-400" />
                            {lead.contactNumber}
                          </a>
                        </div>
                      </td>

                      {/* Area & Category */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{lead.area}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{lead.category}</div>
                      </td>

                      {/* Requirement */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="text-slate-800 line-clamp-2 leading-relaxed" title={lead.requirement}>
                          {lead.requirement}
                        </div>
                      </td>

                      {/* Drawing / File Status */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openModal('file_upload', { leadId: lead.id })}
                            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              leadFiles.length > 0
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>{leadFiles.length > 0 ? `${leadFiles.length} file(s)` : 'Upload file'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Quotation Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            lead.quotationStatus === 'Prepared' || lead.quotationStatus === 'Shared'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : lead.quotationStatus === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {lead.quotationStatus}
                        </span>
                        {existingQuote && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {existingQuote.quotationNumber} (v{existingQuote.version})
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 font-semibold text-slate-900 tabular-nums">
                        {existingQuote ? (
                          <span className="text-indigo-700">₹{existingQuote.grandTotal.toLocaleString('en-IN')}</span>
                        ) : lead.estimatedValue > 0 ? (
                          <span className="text-slate-600">Est. ₹{lead.estimatedValue.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Next Follow-up */}
                      <td className="py-3 px-3">
                        {lead.nextFollowUpAt ? (
                          <div className="tabular-nums text-slate-700">
                            <div>{new Date(lead.nextFollowUpAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(lead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No follow-up set</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {existingQuote ? (
                            <button
                              onClick={() => handleOpenExistingQuote(lead)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Edit or Preview Quotation"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Quote</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCreateQuotation(lead)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Create Quotation"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Create Quote</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              openModal('lead_detail', lead);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="View Lead Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileQuestion className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No leads requiring quotations</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      When you record "Required Quotation" on a customer call, the lead automatically appears here.
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
