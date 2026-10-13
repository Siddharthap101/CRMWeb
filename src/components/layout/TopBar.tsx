import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  Clock,
  HardDrive,
  Calendar,
  Trash2,
  Share2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { exportDailyReport } from '../../services/excel';
import { ConfirmModal } from '../common/ConfirmModal';

export const TopBar: React.FC = () => {
  const {
    currentView,
    searchQuery,
    setSearchQuery,
    openModal,
    leads,
    activities,
    followups,
    quotations,
    lastSaved,
    clearAllData,
    showToast,
  } = useCRM();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    all_leads: 'All Leads Management',
    my_leads: 'My Active Leads',
    todays_followups: "Today's Follow-up Schedule",
    callback_required: 'Callback Required Queue',
    quotation_required: 'Quotations Required & Design Pending',
    quotations: 'Quotations & Estimates',
    interested: 'Interested Customer Pipeline',
    won_deals: 'Won Deals & Order Confirmations',
    lost_leads: 'Lost Deals & Reasons',
    reports: 'Performance Analytics & Reports',
    attachments: 'Design Drawings & File Attachments',
    portfolio: 'Company Portfolio, Project Photos & Rates',
    settings: 'Company Profile & CRM Settings',
  };

  const handleExportQuickReport = () => {
    try {
      exportDailyReport(leads, activities, followups, quotations, 'Full_CRM_Report');
      showToast('Downloaded multi-sheet Excel report.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error generating Excel report.', 'error');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Zone 1: Breadcrumb & View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden sm:flex flex-col">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Signage Sales CRM
          </div>
          <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight truncate">
            {viewTitles[currentView] || 'Overview'}
          </h1>
        </div>
      </div>

      {/* Zone 2: Global Search & Current Date */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by business, phone, area, requirement..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Zone 3: Live Date, Sync & Quick Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Date / Time */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime}</span>
        </div>

        {/* Local Storage Indicator */}
        <div
          className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
          title={`Last saved at ${lastSaved.toLocaleTimeString()}`}
        >
          <HardDrive className="w-3 h-3 text-emerald-600" />
          <span className="font-medium">Offline Saved</span>
        </div>

        {/* Export Report */}
        <button
          onClick={handleExportQuickReport}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Export Multi-Sheet Excel Report"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>

        {/* Share Details to Customer */}
        <button
          onClick={() => openModal('share_details')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-xs"
          title="Share Company Portfolio, Photos & Rates with Customer"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Share Portfolio</span>
        </button>

        {/* Import Leads */}
        <button
          onClick={() => openModal('excel_import')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer shadow-xs"
          title="Import leads from .xlsx, .xls, .csv"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden md:inline">Import Leads</span>
        </button>

        {/* Clear Data */}
        <button
          onClick={() => setIsClearConfirmOpen(true)}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          title="Clear all leads and local records"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Data</span>
        </button>

        {/* Quick Add Lead */}
        <button
          onClick={() => openModal('add_lead')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Clear Data Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Clear All CRM Data?"
        message="Are you sure you want to completely erase all leads, call history, follow-ups, quotations, and attached drawings? Your workspace will be completely empty."
        confirmLabel="Clear All Data"
        onConfirm={async () => {
          await clearAllData();
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </header>
  );
};
