import React, { useState, useMemo } from 'react';
import {
  PhoneCall,
  MessageSquare,
  FileText,
  Paperclip,
  Trash2,
  Eye,
  Filter,
  CheckSquare,
  Square,
  ArrowUpDown,
  Download,
  Plus,
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Share2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, CustomerResponse, CallingStatus, QuotationStatus, ProductCategory } from '../../types/crm';
import { ConfirmModal } from '../common/ConfirmModal';
import * as XLSX from 'xlsx';

interface LeadTableViewProps {
  filterType?: 'all' | 'my' | 'interested' | 'won' | 'lost' | 'callback';
}

export const LeadTableView: React.FC<LeadTableViewProps> = ({ filterType = 'all' }) => {
  const {
    leads,
    searchQuery,
    openModal,
    deleteLead,
    updateLead,
    setSelectedLead,
    showToast,
  } = useCRM();

  // Filters & Sorting state
  const [responseFilter, setResponseFilter] = useState<string>('all');
  const [callingStatusFilter, setCallingStatusFilter] = useState<string>('all');
  const [quotationStatusFilter, setQuotationStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'followup' | 'value'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination & selection
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Confirm delete dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Filter leads according to view type and filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // View type constraint
      if (filterType === 'my' && lead.callingStatus === 'Not Called') return false;
      if (filterType === 'callback' && lead.customerResponse !== 'Call Back') return false;
      if (
        filterType === 'interested' &&
        lead.customerResponse !== 'Yes, Required' &&
        lead.customerResponse !== 'Interested — Details Pending'
      )
        return false;
      if (filterType === 'won' && lead.customerResponse !== 'Won' && lead.quotationStatus !== 'Accepted')
        return false;
      if (filterType === 'lost' && lead.customerResponse !== 'Lost' && lead.quotationStatus !== 'Rejected')
        return false;

      // Search query (across business, phone, area, address, requirement)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          lead.businessName.toLowerCase().includes(q) ||
          lead.contactNumber.toLowerCase().includes(q) ||
          lead.area.toLowerCase().includes(q) ||
          lead.address.toLowerCase().includes(q) ||
          lead.requirement.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Explicit dropdown filters
      if (responseFilter !== 'all' && lead.customerResponse !== responseFilter) return false;
      if (callingStatusFilter !== 'all' && lead.callingStatus !== callingStatusFilter) return false;
      if (quotationStatusFilter !== 'all' && lead.quotationStatus !== quotationStatusFilter) return false;
      if (categoryFilter !== 'all' && lead.category !== categoryFilter) return false;

      return true;
    });
  }, [
    leads,
    filterType,
    searchQuery,
    responseFilter,
    callingStatusFilter,
    quotationStatusFilter,
    categoryFilter,
  ]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.businessName.localeCompare(b.businessName);
      } else if (sortBy === 'value') {
        comparison = (a.estimatedValue || 0) - (b.estimatedValue || 0);
      } else if (sortBy === 'followup') {
        const fa = a.nextFollowUpAt || '9999-99-99';
        const fb = b.nextFollowUpAt || '9999-99-99';
        comparison = fa.localeCompare(fb);
      } else {
        // default: updated
        comparison = (a.updatedAt || a.createdAt).localeCompare(b.updatedAt || b.createdAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredLeads, sortBy, sortOrder]);

  // Paginated leads
  const totalPages = Math.ceil(sortedLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, currentPage, pageSize]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExportSelected = () => {
    const targets = leads.filter((l) => selectedIds.has(l.id));
    if (targets.length === 0) {
      showToast('No leads selected for export.', 'error');
      return;
    }
    const rows = targets.map((l) => ({
      'SR No': l.srNo,
      'Business Name': l.businessName,
      'Contact Number': l.contactNumber,
      'Area': l.area,
      'Address': l.address,
      'Calling Status': l.callingStatus,
      'Customer Response': l.customerResponse,
      'Requirement': l.requirement,
      'Quotation Status': l.quotationStatus,
      'Estimated Value': l.estimatedValue,
      'Next Follow-up': l.nextFollowUpAt || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Selected Leads');
    XLSX.writeFile(wb, `Signage_Selected_Leads_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast(`Exported ${targets.length} selected leads.`, 'success');
  };

  const handleBulkDeleteConfirm = () => {
    selectedIds.forEach((id) => deleteLead(id));
    setSelectedIds(new Set());
    setIsBulkDeleteModalOpen(false);
    showToast(`Deleted selected leads.`, 'info');
  };

  // Helper status color classes
  const getResponseBadge = (response: CustomerResponse) => {
    switch (response) {
      case 'Yes, Required':
      case 'Won':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Required Quotation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Call Back':
      case 'Follow-up Required':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Interested — Details Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Lost':
      case 'Wrong Number':
      case 'Not Required':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getQuotationBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Prepared':
      case 'Shared':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Quotation Required':
      case 'Design Received':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Design Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active View Title & Count */}
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {filterType === 'all'
                ? 'All Leads'
                : filterType === 'my'
                ? 'My Active Leads'
                : filterType === 'callback'
                ? 'Callback Required Queue'
                : filterType === 'interested'
                ? 'Interested Customers'
                : filterType === 'won'
                ? 'Won Deals'
                : 'Lost Leads'}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 tabular-nums">
              {filteredLeads.length} records
            </span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export ({selectedIds.size})</span>
                </button>
                <button
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({selectedIds.size})</span>
                </button>
              </>
            )}

            <button
              onClick={() => openModal('excel_import')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Leads</span>
            </button>

            <button
              onClick={() => openModal('add_lead')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Customer Response Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Customer Response</label>
            <select
              value={responseFilter}
              onChange={(e) => {
                setResponseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Responses</option>
              <option value="Yes, Required">Yes, Required</option>
              <option value="Required Quotation">Required Quotation</option>
              <option value="Call Back">Call Back</option>
              <option value="Interested — Details Pending">Interested — Pending</option>
              <option value="Follow-up Required">Follow-up Required</option>
              <option value="No Answer">No Answer</option>
              <option value="Busy">Busy</option>
              <option value="Not Reachable">Not Reachable</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Not Required">Not Required</option>
            </select>
          </div>

          {/* Calling Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Calling Status</label>
            <select
              value={callingStatusFilter}
              onChange={(e) => {
                setCallingStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Call Statuses</option>
              <option value="Not Called">Not Called</option>
              <option value="Called - Connected">Called - Connected</option>
              <option value="Called - No Answer">Called - No Answer</option>
              <option value="Called - Busy">Called - Busy</option>
              <option value="Called - Not Reachable">Called - Not Reachable</option>
              <option value="Callback Scheduled">Callback Scheduled</option>
            </select>
          </div>

          {/* Quotation Status Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Quotation Status</label>
            <select
              value={quotationStatusFilter}
              onChange={(e) => {
                setQuotationStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Quote Statuses</option>
              <option value="Not Needed">Not Needed</option>
              <option value="Quotation Required">Quotation Required</option>
              <option value="Design Pending">Design Pending</option>
              <option value="Design Received">Design Received</option>
              <option value="Prepared">Prepared</option>
              <option value="Shared">Shared</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Product Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Signage Letters & Boards">Letters & Boards</option>
              <option value="Signage Materials">Signage Materials</option>
              <option value="Signage Machinery">Signage Machinery</option>
              <option value="Branding & Fabrication">Branding & Fabrication</option>
              <option value="Custom Signage / Other">Custom / Other</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Sort By</label>
            <div className="flex items-center gap-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="updated">Latest Activity</option>
                <option value="name">Business Name</option>
                <option value="followup">Follow-up Due</option>
                <option value="value">Estimated Value</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {selectedIds.size === paginatedLeads.length && paginatedLeads.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-2 w-16">SR No</th>
                <th className="py-3 px-3 min-w-[180px]">Business & Contact</th>
                <th className="py-3 px-3 min-w-[120px]">Area & Type</th>
                <th className="py-3 px-3 min-w-[200px]">Requirement</th>
                <th className="py-3 px-3 min-w-[140px]">Customer Response</th>
                <th className="py-3 px-3 min-w-[130px]">Quotation Status</th>
                <th className="py-3 px-3 min-w-[120px]">Next Follow-up</th>
                <th className="py-3 px-3 min-w-[180px] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id);
                  const isFollowupDueToday =
                    lead.nextFollowUpAt &&
                    lead.nextFollowUpAt.startsWith(new Date().toISOString().split('T')[0]);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(lead.id)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* SR No */}
                      <td className="py-3 px-2 font-mono text-slate-500 tabular-nums">
                        #{lead.srNo}
                      </td>

                      {/* Business Name & Contact */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => openModal('lead_detail', lead)}
                        >
                          {lead.businessName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${lead.contactNumber}`}
                            className="font-mono text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 tabular-nums"
                            title="Click to Call"
                          >
                            <PhoneCall className="w-3 h-3 text-slate-400" />
                            <span>{lead.contactNumber}</span>
                          </a>
                        </div>
                      </td>

                      {/* Area & Type */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{lead.area || 'Local'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium">{lead.customerType}</span>
                          <span>·</span>
                          <span className="truncate max-w-[90px]">{lead.category.split(' ')[0]}</span>
                        </div>
                      </td>

                      {/* Requirement */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 line-clamp-2 leading-relaxed" title={lead.requirement}>
                          {lead.requirement}
                        </div>
                        {lead.estimatedValue > 0 && (
                          <div className="text-[11px] text-emerald-700 font-semibold tabular-nums mt-0.5">
                            Est: ₹{lead.estimatedValue.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Customer Response */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium border ${getResponseBadge(
                            lead.customerResponse
                          )}`}
                        >
                          {lead.customerResponse}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {lead.callingStatus}
                        </div>
                      </td>

                      {/* Quotation Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getQuotationBadge(
                            lead.quotationStatus
                          )}`}
                        >
                          {lead.quotationStatus}
                        </span>
                      </td>

                      {/* Next Follow-up */}
                      <td className="py-3 px-3">
                        {lead.nextFollowUpAt ? (
                          <div className={`tabular-nums ${isFollowupDueToday ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                            <div>{new Date(lead.nextFollowUpAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {new Date(lead.nextFollowUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Not set</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Call Button */}
                          <a
                            href={`tel:${lead.contactNumber}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Click to Call"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>

                          {/* Record Response Button */}
                          <button
                            onClick={() => openModal('record_response', lead)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                            title="Record Customer Discussion & Response"
                          >
                            Response
                          </button>

                          {/* Detail View */}
                          <button
                            onClick={() => openModal('lead_detail', lead)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="View Full Lead Details & Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quotation / Create Quote */}
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              openModal('quotation_builder', { leadId: lead.id, prefillLead: lead });
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title="Create Quotation for Lead"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Share Company Details Pack */}
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              openModal('share_details', lead);
                            }}
                            className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                            title="Share Company Portfolio, Photos & Rates via WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Attachments */}
                          <button
                            onClick={() => openModal('file_upload', { leadId: lead.id })}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Upload Drawings / CDR / DXF / Files"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Lead */}
                          <button
                            onClick={() => setDeleteTargetId(lead.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Filter className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">No matching leads found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try adjusting your search criteria, clearing active filters, or adding a new lead.
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setResponseFilter('all');
                            setCallingStatusFilter('all');
                            setQuotationStatusFilter('all');
                            setCategoryFilter('all');
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                        <button
                          onClick={() => openModal('add_lead')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Add New Lead
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {sortedLeads.length > 0 && (
          <div className="py-3 px-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="tabular-nums">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, sortedLeads.length)} of {sortedLeads.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2 py-1 font-semibold text-slate-800 tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Single Lead Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? All associated call activities and follow-ups will also be removed."
        confirmLabel="Delete Lead"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteLead(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title={`Delete ${selectedIds.size} Selected Leads`}
        message={`Are you sure you want to permanently delete the ${selectedIds.size} selected leads? This action cannot be undone.`}
        confirmLabel="Delete Selected"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setIsBulkDeleteModalOpen(false)}
      />
    </div>
  );
};
