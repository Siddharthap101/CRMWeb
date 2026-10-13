import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  FileText,
  IndianRupee,
  Users,
  Clock,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { exportDailyReport } from '../../services/excel';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const {
    leads,
    activities,
    followups,
    quotations,
    showToast,
  } = useCRM();

  const [dateRangeOption, setDateRangeOption] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all'>('today');

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const firstOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const filteredData = useMemo(() => {
    let targetStartDate = '';
    let label = 'Full CRM Archive';

    if (dateRangeOption === 'today') {
      targetStartDate = todayStr;
      label = `Daily_Report_${todayStr}`;
    } else if (dateRangeOption === 'yesterday') {
      targetStartDate = yesterdayStr;
      label = `Report_${yesterdayStr}`;
    } else if (dateRangeOption === '7days') {
      targetStartDate = sevenDaysAgoStr;
      label = 'Last_7_Days_Report';
    } else if (dateRangeOption === 'month') {
      targetStartDate = firstOfMonthStr;
      label = 'This_Month_Report';
    }

    const matchedLeads = targetStartDate
      ? leads.filter((l) => l.createdAt >= targetStartDate || (l.lastContactedAt && l.lastContactedAt >= targetStartDate))
      : leads;

    const matchedActivities = targetStartDate
      ? activities.filter((a) => a.timestamp >= targetStartDate)
      : activities;

    const matchedFollowups = targetStartDate
      ? followups.filter((f) => f.scheduledAt >= targetStartDate || f.createdAt >= targetStartDate)
      : followups;

    const matchedQuotations = targetStartDate
      ? quotations.filter((q) => q.date >= targetStartDate || q.createdAt >= targetStartDate)
      : quotations;

    return {
      leads: matchedLeads,
      activities: matchedActivities,
      followups: matchedFollowups,
      quotations: matchedQuotations,
      label,
    };
  }, [dateRangeOption, leads, activities, followups, quotations, todayStr, yesterdayStr, sevenDaysAgoStr, firstOfMonthStr]);

  const handleExportWorkbook = () => {
    try {
      exportDailyReport(
        filteredData.leads,
        filteredData.activities,
        filteredData.followups,
        filteredData.quotations,
        filteredData.label
      );
      showToast('Exported multi-sheet Excel workbook successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error generating Excel report.', 'error');
    }
  };

  // Performance calculations
  const totalLeads = leads.length;
  const contactedLeads = leads.filter((l) => l.callingStatus !== 'Not Called').length;
  const contactRate = totalLeads > 0 ? ((contactedLeads / totalLeads) * 100).toFixed(1) : '0';

  const relevantFollowups = followups.filter((f) => f.status === 'completed' || f.status === 'pending');
  const completedFollowups = followups.filter((f) => f.status === 'completed').length;
  const followUpCompletionRate = relevantFollowups.length > 0
    ? ((completedFollowups / relevantFollowups.length) * 100).toFixed(1)
    : '0';

  const decidedQuotes = quotations.filter((q) => q.status === 'Accepted' || q.status === 'Rejected');
  const acceptedQuotes = quotations.filter((q) => q.status === 'Accepted').length;
  const quotationAcceptanceRate = decidedQuotes.length > 0
    ? ((acceptedQuotes / decidedQuotes.length) * 100).toFixed(1)
    : '0';

  const wonLeads = leads.filter((l) => l.customerResponse === 'Won' || l.quotationStatus === 'Accepted');
  const wonSalesValue = wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const totalPipelineValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

  return (
    <div className="space-y-4">
      {/* Export Action Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Export Daily & Periodic Excel Reports</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Generates a comprehensive 6-sheet workbook (.xlsx) including Daily Summary, Lead Details, Call History, Follow-ups, Quotations, and Won/Lost Deals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <select
            value={dateRangeOption}
            onChange={(e) => setDateRangeOption(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="today">Today's Data</option>
            <option value="yesterday">Yesterday's Data</option>
            <option value="7days">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="all">All CRM Records</option>
          </select>

          <button
            onClick={handleExportWorkbook}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download Multi-Sheet Excel</span>
          </button>
        </div>
      </div>

      {/* Conversion & Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Key Sales Performance Indicators (KPIs)</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium">Contact Conversion Rate</span>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{contactRate}%</div>
            <p className="text-[11px] text-slate-500">
              {contactedLeads} of {totalLeads} registered leads have been called.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium">Follow-up Completion Rate</span>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{followUpCompletionRate}%</div>
            <p className="text-[11px] text-slate-500">
              {completedFollowups} of {relevantFollowups.length} scheduled tasks completed.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 font-medium">Quotation Acceptance Rate</span>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{quotationAcceptanceRate}%</div>
            <p className="text-[11px] text-slate-500">
              {acceptedQuotes} accepted out of {decidedQuotes.length} final customer decisions.
            </p>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
            <span className="text-emerald-800 font-medium">Total Closed Won Revenue</span>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              ₹{wonSalesValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-700">
              From {wonLeads.length} finalized client orders.
            </p>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-1">
            <span className="text-blue-800 font-medium">Active Quotation Pipeline</span>
            <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
              ₹{totalPipelineValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-blue-700">
              Across {quotations.length} total issued quotes.
            </p>
          </div>
        </div>
      </div>

      {/* Sheets Content Preview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Included Worksheets in Generated Report</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Sheet 1: Daily Summary</div>
            <p className="text-slate-500 text-[11px] mt-0.5">High-level metrics, contact rate, revenue totals</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Sheet 2: Lead Details</div>
            <p className="text-slate-500 text-[11px] mt-0.5">All registered leads with phone, area, requirements</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Sheet 3: Call History</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Logged phone calls, discussions, and technical specs</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Sheet 4: Follow-ups</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Scheduled appointments, call-backs, and completion notes</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Sheet 5: Quotations</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Quotation numbers, amounts, GST, and version tracking</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-bold text-slate-900">Sheet 6: Won & Lost Deals</div>
            <p className="text-slate-500 text-[11px] mt-0.5">Won deal values and lost deal feedback analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};
