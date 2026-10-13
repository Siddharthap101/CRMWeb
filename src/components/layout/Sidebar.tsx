import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarClock,
  PhoneCall,
  FileQuestion,
  FileText,
  ThumbsUp,
  Award,
  XCircle,
  BarChart3,
  Paperclip,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useCRM, ActiveView } from '../../context/CRMContext';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getBadge?: (leads: any[], followups: any[], quotations: any[]) => number | null;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isSidebarOpen,
    setIsSidebarOpen,
    leads,
    followups,
    quotations,
    attachmentsMeta,
    settings,
  } = useCRM();

  const todayStr = new Date().toISOString().split('T')[0];

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'all_leads',
      label: 'All Leads',
      icon: Users,
      getBadge: (l) => l.length,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'my_leads',
      label: 'My Leads',
      icon: UserCheck,
      getBadge: (l) => l.filter((x) => x.callingStatus !== 'Not Called').length,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'todays_followups',
      label: "Today's Follow-ups",
      icon: CalendarClock,
      getBadge: (_, f) =>
        f.filter((x) => x.status === 'pending' && x.scheduledAt.startsWith(todayStr)).length,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'callback_required',
      label: 'Callback Required',
      icon: PhoneCall,
      getBadge: (l) => l.filter((x) => x.customerResponse === 'Call Back').length,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'quotation_required',
      label: 'Quotation Required',
      icon: FileQuestion,
      getBadge: (l) =>
        l.filter(
          (x) =>
            x.customerResponse === 'Required Quotation' ||
            x.quotationStatus === 'Quotation Required' ||
            x.quotationStatus === 'Design Pending' ||
            x.quotationStatus === 'Design Received'
        ).length,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: FileText,
      getBadge: (_, __, q) => q.length,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'interested',
      label: 'Interested Customers',
      icon: ThumbsUp,
      getBadge: (l) =>
        l.filter(
          (x) =>
            x.customerResponse === 'Yes, Required' ||
            x.customerResponse === 'Interested — Details Pending'
        ).length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'won_deals',
      label: 'Won Deals',
      icon: Award,
      getBadge: (l) =>
        l.filter((x) => x.customerResponse === 'Won' || x.quotationStatus === 'Accepted').length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'lost_leads',
      label: 'Lost Leads',
      icon: XCircle,
      getBadge: (l) =>
        l.filter((x) => x.customerResponse === 'Lost' || x.quotationStatus === 'Rejected').length,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'reports',
      label: 'Reports & Performance',
      icon: BarChart3,
    },
    {
      id: 'attachments',
      label: 'File Attachments',
      icon: Paperclip,
      getBadge: () => attachmentsMeta.length,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'portfolio',
      label: 'Portfolio & Rate Card',
      icon: Sparkles,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-white truncate">
                Signage Sales CRM
              </span>
              <span className="text-xs text-slate-400 truncate">Letters · Materials · Machines</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const badgeCount = item.getBadge
            ? item.getBadge(leads, followups, quotations)
            : null;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />

              {isSidebarOpen && (
                <span className="flex-1 truncate tracking-tight">{item.label}</span>
              )}

              {isSidebarOpen && badgeCount !== null && badgeCount > 0 && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums shrink-0 ${
                    isActive ? 'bg-blue-700 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User / Storage Footer */}
      <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-blue-400 shrink-0">
            {settings.salesAgentName ? settings.salesAgentName.charAt(0) : 'S'}
          </div>
          {isSidebarOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {settings.salesAgentName || 'Sales Representative'}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Local Browser Engine</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
