import React, { useState, useMemo } from 'react';
import {
  Users,
  PhoneCall,
  Calendar,
  FileCheck,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Percent,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
  Plus,
  Upload,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useCRM } from '../../context/CRMContext';

type DateFilter = 'all' | 'today' | 'yesterday' | '7days' | 'month';

const COLORS = ['#2563eb', '#0d9488', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#64748b'];

export const DashboardView: React.FC = () => {
  const {
    leads,
    activities,
    followups,
    quotations,
    setCurrentView,
    openModal,
  } = useCRM();

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const firstOfMonthStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Filter leads based on selected timeframe
  const filteredLeads = useMemo(() => {
    if (dateFilter === 'all') return leads;
    if (dateFilter === 'today') return leads.filter((l) => l.createdAt.startsWith(todayStr) || (l.lastContactedAt && l.lastContactedAt.startsWith(todayStr)));
    if (dateFilter === 'yesterday') return leads.filter((l) => l.createdAt.startsWith(yesterdayStr) || (l.lastContactedAt && l.lastContactedAt.startsWith(yesterdayStr)));
    if (dateFilter === '7days') return leads.filter((l) => l.createdAt >= sevenDaysAgoStr);
    if (dateFilter === 'month') return leads.filter((l) => l.createdAt >= firstOfMonthStr);
    return leads;
  }, [leads, dateFilter, todayStr, yesterdayStr, sevenDaysAgoStr, firstOfMonthStr]);

  // Key KPI numbers
  const totalLeads = leads.length;
  const contactedLeads = leads.filter((l) => l.callingStatus !== 'Not Called').length;
  const callsToday = activities.filter((a) => a.type === 'call' && a.timestamp.startsWith(todayStr)).length;
  const interestedLeads = leads.filter((l) => l.customerResponse === 'Yes, Required' || l.customerResponse === 'Interested — Details Pending').length;
  const callbacksPending = leads.filter((l) => l.customerResponse === 'Call Back').length;

  const quotationsRequired = leads.filter(
    (l) =>
      l.customerResponse === 'Required Quotation' ||
      l.quotationStatus === 'Quotation Required' ||
      l.quotationStatus === 'Design Pending' ||
      l.quotationStatus === 'Design Received'
  ).length;

  const quotationsPrepared = quotations.filter((q) => q.status === 'Prepared').length;
  const quotationsShared = quotations.filter((q) => q.status === 'Shared').length;

  const followupsDueToday = followups.filter((f) => f.status === 'pending' && f.scheduledAt.startsWith(todayStr)).length;
  const overdueFollowups = followups.filter((f) => f.status === 'pending' && f.scheduledAt < `${todayStr}T00:00:00`).length;

  const wonDeals = leads.filter((l) => l.customerResponse === 'Won' || l.quotationStatus === 'Accepted').length;
  const lostDeals = leads.filter((l) => l.customerResponse === 'Lost' || l.quotationStatus === 'Rejected').length;

  const totalQuotationValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
  const wonSalesValue = leads
    .filter((l) => l.customerResponse === 'Won' || l.quotationStatus === 'Accepted')
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  // Performance calculations
  const contactRate = totalLeads > 0 ? ((contactedLeads / totalLeads) * 100).toFixed(1) : '0';

  const relevantFollowups = followups.filter((f) => f.status === 'completed' || f.status === 'pending');
  const completedFollowups = followups.filter((f) => f.status === 'completed').length;
  const followUpCompletionRate = relevantFollowups.length > 0
    ? ((completedFollowups / relevantFollowups.length) * 100).toFixed(1)
    : '0';

  const finalQuotationOutcomes = quotations.filter((q) => q.status === 'Accepted' || q.status === 'Rejected').length;
  const acceptedQuotations = quotations.filter((q) => q.status === 'Accepted').length;
  const quotationAcceptanceRate = finalQuotationOutcomes > 0
    ? ((acceptedQuotations / finalQuotationOutcomes) * 100).toFixed(1)
    : '0';

  // Chart 1: Customer Responses distribution
  const responseChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLeads.forEach((l) => {
      counts[l.customerResponse] = (counts[l.customerResponse] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredLeads]);

  // Chart 2: Daily Call Trend (Last 7 days)
  const callTrendData = useMemo(() => {
    const days: { date: string; label: string; calls: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0];
      const count = activities.filter((a) => a.type === 'call' && a.timestamp.startsWith(dateKey)).length;
      days.push({
        date: dateKey,
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        calls: count,
      });
    }
    return days;
  }, [activities]);

  // Chart 3: Leads by Product Category
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.category] = (counts[l.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Chart 4: Leads by Top Areas
  const areaChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      const area = l.area || 'Other';
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [leads]);

  // Overdue follow-up preview list
  const urgentFollowUps = useMemo(() => {
    return followups
      .filter((f) => f.status === 'pending' && f.scheduledAt <= `${todayStr}T23:59:59`)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .slice(0, 4);
  }, [followups, todayStr]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sales Agent Mission Control</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline analytics, call outcomes, and quotation conversion tracking.
          </p>
        </div>

        {/* Date Filter Segmented Bar */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id as DateFilter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                dateFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid (14 Cards arranged in responsive grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Leads */}
        <div
          onClick={() => setCurrentView('all_leads')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">In CRM database</div>
        </div>

        {/* Leads Contacted */}
        <div
          onClick={() => setCurrentView('my_leads')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Contacted</span>
            <PhoneCall className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{contactedLeads}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">{contactRate}% contact rate</div>
        </div>

        {/* Calls Recorded Today */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Calls Today</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{callsToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">Logged calls today</div>
        </div>

        {/* Interested Customers */}
        <div
          onClick={() => setCurrentView('interested')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Interested</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums">{interestedLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active requirements</div>
        </div>

        {/* Callbacks Pending */}
        <div
          onClick={() => setCurrentView('callback_required')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Callbacks</span>
            <PhoneCall className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-700 tabular-nums">{callbacksPending}</div>
          <div className="text-[11px] text-slate-500 mt-1">Callback requested</div>
        </div>

        {/* Quotations Required */}
        <div
          onClick={() => setCurrentView('quotation_required')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Quote Needed</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-700 tabular-nums">{quotationsRequired}</div>
          <div className="text-[11px] text-slate-500 mt-1">Pending quotation</div>
        </div>

        {/* Quotations Prepared */}
        <div
          onClick={() => setCurrentView('quotations')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Prepared</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{quotationsPrepared}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready to share</div>
        </div>

        {/* Quotations Shared */}
        <div
          onClick={() => setCurrentView('quotations')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Quotes Sent</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{quotationsShared}</div>
          <div className="text-[11px] text-slate-500 mt-1">Dispatched to client</div>
        </div>

        {/* Follow-ups Due Today */}
        <div
          onClick={() => setCurrentView('todays_followups')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Due Today</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700 tabular-nums">{followupsDueToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">Scheduled today</div>
        </div>

        {/* Overdue Follow-ups */}
        <div
          onClick={() => setCurrentView('todays_followups')}
          className="bg-white p-3.5 rounded-xl border border-rose-200 hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-rose-600 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-700 tabular-nums">{overdueFollowups}</div>
          <div className="text-[11px] text-rose-600 mt-1">Action required</div>
        </div>

        {/* Won Deals */}
        <div
          onClick={() => setCurrentView('won_deals')}
          className="bg-white p-3.5 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Won Deals</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-700 tabular-nums">{wonDeals}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Orders closed</div>
        </div>

        {/* Lost Deals */}
        <div
          onClick={() => setCurrentView('lost_leads')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Lost Leads</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-slate-700 tabular-nums">{lostDeals}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lost deals logged</div>
        </div>

        {/* Total Quotation Pipeline Value */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 col-span-2 sm:col-span-1 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Quote Value</span>
            <IndianRupee className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 tabular-nums">
            ₹{totalQuotationValue > 100000 ? `${(totalQuotationValue / 100000).toFixed(1)}L` : totalQuotationValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total pipeline</div>
        </div>

        {/* Won Sales Value */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-700 mb-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider">Won Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700 tabular-nums">
            ₹{wonSalesValue > 100000 ? `${(wonSalesValue / 100000).toFixed(1)}L` : wonSalesValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Revenue closed</div>
        </div>
      </div>

      {/* Conversion Rate Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Contact Rate</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">{contactRate}%</div>
            <div className="text-[11px] text-slate-400">
              {contactedLeads} out of {totalLeads} leads called
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Follow-up Completion Rate</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">{followUpCompletionRate}%</div>
            <div className="text-[11px] text-slate-400">
              {completedFollowups} tasks completed
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Quotation Acceptance Rate</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">{quotationAcceptanceRate}%</div>
            <div className="text-[11px] text-slate-400">
              {acceptedQuotations} accepted of {finalQuotationOutcomes} decided
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Urgent Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Customer Responses Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leads by Customer Response</h3>
              <p className="text-xs text-slate-500">Breakdown of recorded outcomes from customer phone calls</p>
            </div>
          </div>

          <div className="h-64">
            {responseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} name="Leads" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No customer responses recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Urgent Follow-ups & Action Alert Panel (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Urgent Follow-ups</h3>
              <p className="text-xs text-slate-500">Tasks due today or overdue</p>
            </div>
            <button
              onClick={() => setCurrentView('todays_followups')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto">
            {urgentFollowUps.length > 0 ? (
              urgentFollowUps.map((fup) => {
                const isOverdue = fup.scheduledAt < `${todayStr}T00:00:00`;
                return (
                  <div
                    key={fup.id}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      isOverdue ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 truncate">{fup.leadBusinessName}</span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isOverdue ? 'Overdue' : 'Due Today'}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1 line-clamp-1">{fup.action}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="font-mono tabular-nums">{new Date(fup.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <a
                        href={`tel:${fup.leadContactNumber}`}
                        className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="font-medium text-slate-600">All caught up!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No overdue follow-ups pending right now.</p>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
            <button
              onClick={() => openModal('add_lead')}
              className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Lead
            </button>
            <button
              onClick={() => openModal('excel_import')}
              className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Charts: Call Trend & Product Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls Recorded By Day */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Calling Velocity (Last 7 Days)</h3>
              <p className="text-xs text-slate-500">Volume of logged calls across the sales week</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={callTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="calls" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#callGradient)" name="Calls" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product / Requirement Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leads by Product Category</h3>
              <p className="text-xs text-slate-500">Letters & boards, materials, machinery distribution</p>
            </div>
          </div>
          <div className="h-60 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend */}
            <div className="flex-1 space-y-1.5 text-xs">
              {categoryChartData.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-700 truncate">{cat.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 tabular-nums ml-2">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
