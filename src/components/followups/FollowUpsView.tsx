import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Plus,
  FileText,
  Eye,
  MessageSquare,
  Check,
  CalendarDays,
  Share2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { FollowUp } from '../../types/crm';

type FollowUpTab = 'today' | 'overdue' | 'upcoming' | 'completed' | 'all';

export const FollowUpsView: React.FC = () => {
  const {
    followups,
    leads,
    completeFollowUp,
    rescheduleFollowUp,
    openModal,
    setSelectedLead,
    showToast,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<FollowUpTab>('today');
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);
  const [newDateTime, setNewDateTime] = useState('');
  const [completeTargetId, setCompleteTargetId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Categorize follow-ups
  const overdueFollowUps = useMemo(() => {
    return followups.filter((f) => f.status === 'pending' && f.scheduledAt < `${todayStr}T00:00:00`);
  }, [followups, todayStr]);

  const dueTodayFollowUps = useMemo(() => {
    return followups.filter(
      (f) => f.status === 'pending' && f.scheduledAt.startsWith(todayStr)
    );
  }, [followups, todayStr]);

  const upcomingFollowUps = useMemo(() => {
    return followups.filter(
      (f) => f.status === 'pending' && f.scheduledAt > `${todayStr}T23:59:59`
    );
  }, [followups, todayStr]);

  const completedFollowUps = useMemo(() => {
    return followups.filter((f) => f.status === 'completed');
  }, [followups]);

  // Active list based on tab
  const displayedFollowUps = useMemo(() => {
    if (activeTab === 'overdue') return overdueFollowUps;
    if (activeTab === 'today') return dueTodayFollowUps;
    if (activeTab === 'upcoming') return upcomingFollowUps;
    if (activeTab === 'completed') return completedFollowUps;
    return followups;
  }, [activeTab, overdueFollowUps, dueTodayFollowUps, upcomingFollowUps, completedFollowUps, followups]);

  const handleOpenLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      openModal('lead_detail', lead);
    }
  };

  const handleRecordResponse = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setSelectedLead(lead);
      openModal('record_response', lead);
    }
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (completeTargetId) {
      completeFollowUp(completeTargetId, completionNotes);
      setCompleteTargetId(null);
      setCompletionNotes('');
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rescheduleTargetId && newDateTime) {
      rescheduleFollowUp(rescheduleTargetId, newDateTime);
      setRescheduleTargetId(null);
      setNewDateTime('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Follow-up Management Schedule</h2>
            <p className="text-xs text-slate-500">
              Track customer call-backs, appointments, site surveys, and quotation check-ins
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('add_lead')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Follow-up / Lead</span>
            </button>
          </div>
        </div>

        {/* Segmented Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'today'
                ? 'bg-amber-100/80 text-amber-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Due Today ({dueTodayFollowUps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'overdue'
                ? 'bg-rose-100 text-rose-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Overdue ({overdueFollowUps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-blue-100 text-blue-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Upcoming ({upcomingFollowUps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-emerald-100 text-emerald-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed ({completedFollowUps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-200 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({followups.length})
          </button>
        </div>
      </div>

      {/* Follow-ups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {displayedFollowUps.length > 0 ? (
          displayedFollowUps.map((fup) => {
            const relatedLead = leads.find((l) => l.id === fup.leadId);
            const isOverdue = fup.status === 'pending' && fup.scheduledAt < `${todayStr}T00:00:00`;
            const isToday = fup.status === 'pending' && fup.scheduledAt.startsWith(todayStr);

            return (
              <div
                key={fup.id}
                className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-xs ${
                  isOverdue
                    ? 'border-rose-300 bg-rose-50/10'
                    : isToday
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top line status & timing */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        fup.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800'
                          : isToday
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {fup.status === 'completed'
                        ? 'Completed'
                        : isOverdue
                        ? 'Overdue'
                        : isToday
                        ? 'Due Today'
                        : 'Upcoming'}
                    </span>

                    <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                      {new Date(fup.scheduledAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      ·{' '}
                      {new Date(fup.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Business Name */}
                  <h3
                    onClick={() => handleOpenLead(fup.leadId)}
                    className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors cursor-pointer truncate"
                  >
                    {fup.leadBusinessName}
                  </h3>

                  {/* Contact Number & Click to Call */}
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <a
                      href={`tel:${fup.leadContactNumber}`}
                      className="font-mono text-slate-600 hover:text-blue-600 flex items-center gap-1 tabular-nums"
                    >
                      <PhoneCall className="w-3 h-3 text-slate-400" />
                      <span>{fup.leadContactNumber}</span>
                    </a>
                    {relatedLead?.area && (
                      <span className="text-slate-400 text-[11px]">· {relatedLead.area}</span>
                    )}
                  </div>

                  {/* Follow-up Action / Notes */}
                  <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-slate-800">{fup.action}</div>
                    {fup.notes && (
                      <div className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                        {fup.notes}
                      </div>
                    )}
                  </div>

                  {relatedLead?.customerResponse && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      Response on record:{' '}
                      <span className="font-medium text-slate-700">{relatedLead.customerResponse}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    {/* Call Customer */}
                    <a
                      href={`tel:${fup.leadContactNumber}`}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Call Now"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>

                    {/* Record Response */}
                    <button
                      onClick={() => handleRecordResponse(fup.leadId)}
                      className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                      title="Record Response"
                    >
                      Response
                    </button>

                    {/* View Lead */}
                    <button
                      onClick={() => handleOpenLead(fup.leadId)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      title="View Lead"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Quick Share Company Details, Portfolio & Rates */}
                    <button
                      onClick={() => {
                        const target = leads.find((l) => l.id === fup.leadId);
                        if (target) {
                          setSelectedLead(target);
                          openModal('share_details', target);
                        } else {
                          openModal('share_details');
                        }
                      }}
                      className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                      title="Share Company Details, Photos & Rates via WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {fup.status === 'pending' && (
                    <div className="flex items-center gap-1">
                      {/* Reschedule Button */}
                      <button
                        onClick={() => {
                          setRescheduleTargetId(fup.id);
                          setNewDateTime(fup.scheduledAt);
                        }}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                        title="Reschedule Follow-up"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Complete Button */}
                      <button
                        onClick={() => setCompleteTargetId(fup.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No follow-ups in this section</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Select another status tab or schedule follow-ups through customer response logs.
            </p>
          </div>
        )}
      </div>

      {/* Complete Follow-up Modal */}
      {completeTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Complete Follow-up Task</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add any completion remarks. The task will be stored in your history.
            </p>

            <form onSubmit={handleCompleteSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Completion Notes</label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Spoke with client, confirmed design file, quotation sent..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompleteTargetId(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Confirm Completed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Reschedule Follow-up</h3>
            <p className="text-xs text-slate-500 mt-1">
              Pick the new date and time for this customer follow-up.
            </p>

            <form onSubmit={handleRescheduleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newDateTime}
                  onChange={(e) => setNewDateTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleTargetId(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
