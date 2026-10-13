import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Lead,
  ActivityLog,
  FollowUp,
  FileAttachmentMeta,
  Quotation,
  CRMSettings,
  CustomerResponse,
  CallingStatus,
  QuotationStatus,
  DiscussionDetails,
} from '../types/crm';
import {
  getStoredLeads,
  saveStoredLeads,
  getStoredActivities,
  saveStoredActivities,
  getStoredFollowUps,
  saveStoredFollowUps,
  getStoredQuotations,
  saveStoredQuotations,
  getStoredAttachmentMetas,
  saveStoredAttachmentMetas,
  getStoredSettings,
  saveStoredSettings,
  initializeCleanStorage,
  loadSampleSeedData,
  DEFAULT_SETTINGS,
  getLocalStorageUsage,
  resetAllCRMData,
} from '../services/storage';
import {
  saveAttachmentBlob,
  getAttachmentBlob,
  deleteAttachmentBlob,
  clearAllAttachmentBlobs,
  getBrowserStorageStats,
} from '../services/db';

export type ActiveView =
  | 'dashboard'
  | 'all_leads'
  | 'my_leads'
  | 'todays_followups'
  | 'callback_required'
  | 'quotation_required'
  | 'quotations'
  | 'interested'
  | 'won_deals'
  | 'lost_leads'
  | 'reports'
  | 'attachments'
  | 'portfolio'
  | 'settings';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface CRMContextType {
  // Navigation & View
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  // Data Collections
  leads: Lead[];
  activities: ActivityLog[];
  followups: FollowUp[];
  quotations: Quotation[];
  attachmentsMeta: FileAttachmentMeta[];
  settings: CRMSettings;
  lastSaved: Date;

  // Modals & Selections
  activeModal: string | null;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  selectedLead: Lead | null;
  setSelectedLead: (lead: Lead | null) => void;
  selectedQuotation: Quotation | null;
  setSelectedQuotation: (q: Quotation | null) => void;

  // Actions - Leads
  createLead: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  importLeadsBatch: (validRows: any[], updateDuplicates: boolean) => number;

  // Actions - Call Outcomes & Activities
  recordCustomerResponse: (
    leadId: string,
    params: {
      response: CustomerResponse;
      discussionSummary: string;
      discussionDetails?: DiscussionDetails;
      followUpDate?: string | null;
      priority?: 'High' | 'Medium' | 'Low';
      estimatedValue?: number;
      lostReason?: string;
    }
  ) => void;
  addActivityNote: (leadId: string, note: string) => void;

  // Actions - Follow-ups
  createFollowUp: (leadId: string, scheduledAt: string, action: string, notes?: string) => void;
  completeFollowUp: (id: string, notes?: string) => void;
  rescheduleFollowUp: (id: string, newDateTime: string, notes?: string) => void;

  // Actions - Quotations
  saveQuotation: (quotation: Quotation) => void;
  updateQuotationStatus: (id: string, status: Quotation['status'], feedback?: string) => void;
  duplicateQuotation: (id: string) => Quotation;
  createRevision: (id: string) => Quotation;

  // Actions - Attachments
  uploadAttachment: (
    leadId: string,
    file: File,
    quotationId?: string,
    description?: string
  ) => Promise<FileAttachmentMeta>;
  deleteAttachment: (id: string) => Promise<void>;
  downloadAttachmentFile: (id: string) => Promise<void>;

  // Actions - Settings & System
  updateSettings: (newSettings: CRMSettings) => void;
  reloadSeedData: () => void;
  clearAllData: () => Promise<void>;
  storageUsageBytes: number;
  browserStorageInfo: { usageBytes: number; quotaBytes: number; percentageUsed: number };

  // Toast
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [attachmentsMeta, setAttachmentsMeta] = useState<FileAttachmentMeta[]>([]);
  const [settings, setSettings] = useState<CRMSettings>(DEFAULT_SETTINGS);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [storageUsageBytes, setStorageUsageBytes] = useState(0);
  const [browserStorageInfo, setBrowserStorageInfo] = useState({ usageBytes: 0, quotaBytes: 0, percentageUsed: 0 });

  // Initial load - clean workspace with zero mock data
  useEffect(() => {
    // Purge any previously seeded demo data on startup to ensure a completely clean CRM
    if (localStorage.getItem('signage_crm_clean_purged_v3') !== 'true') {
      resetAllCRMData();
      clearAllAttachmentBlobs();
      localStorage.setItem('signage_crm_clean_purged_v3', 'true');
    }

    initializeCleanStorage();
    const l = getStoredLeads();
    const a = getStoredActivities();
    const f = getStoredFollowUps();
    const q = getStoredQuotations();
    const att = getStoredAttachmentMetas();
    const s = getStoredSettings();

    setLeads(l);
    setActivities(a);
    setFollowups(f);
    setQuotations(q);
    setAttachmentsMeta(att);
    setSettings(s);
    setStorageUsageBytes(getLocalStorageUsage());

    getBrowserStorageStats().then(setBrowserStorageInfo);
  }, []);

  // Update storage usage periodically
  const refreshStorageStats = useCallback(() => {
    setStorageUsageBytes(getLocalStorageUsage());
    getBrowserStorageStats().then(setBrowserStorageInfo);
    setLastSaved(new Date());
  }, []);

  // Toasts
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openModal = useCallback((modalName: string, data?: any) => {
    if (modalName === 'lead_detail' || modalName === 'record_response') {
      if (data) setSelectedLead(data);
    } else if (modalName === 'quotation_builder' || modalName === 'quotation_preview' || modalName === 'whatsapp_share') {
      if (data) setSelectedQuotation(data);
    }
    setActiveModal(modalName);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Lead CRUD
  const createLead = useCallback(
    (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
      const now = new Date().toISOString();
      const newLead: Lead = {
        ...leadData,
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: now,
        updatedAt: now,
      };

      const updated = [newLead, ...leads];
      setLeads(updated);
      saveStoredLeads(updated);

      // Create initial activity log
      const newAct: ActivityLog = {
        id: `act_${Date.now()}`,
        leadId: newLead.id,
        timestamp: now,
        type: 'lead_created',
        title: 'Lead Created',
        summary: `Created lead for ${newLead.businessName} (${newLead.category}).`,
      };
      const updatedActs = [newAct, ...activities];
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);

      // If next follow-up specified
      if (newLead.nextFollowUpAt) {
        const newFup: FollowUp = {
          id: `fup_${Date.now()}`,
          leadId: newLead.id,
          leadBusinessName: newLead.businessName,
          leadContactNumber: newLead.contactNumber,
          scheduledAt: newLead.nextFollowUpAt,
          action: 'Initial follow-up',
          notes: newLead.notes || '',
          status: 'pending',
          createdAt: now,
        };
        const updatedFups = [newFup, ...followups];
        setFollowups(updatedFups);
        saveStoredFollowUps(updatedFups);
      }

      refreshStorageStats();
      showToast(`Lead "${newLead.businessName}" created successfully!`, 'success');
      return newLead;
    },
    [leads, activities, followups, refreshStorageStats, showToast]
  );

  const updateLead = useCallback(
    (id: string, updates: Partial<Lead>) => {
      const now = new Date().toISOString();
      const updated = leads.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: now } : l));
      setLeads(updated);
      saveStoredLeads(updated);

      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, ...updates, updatedAt: now });
      }

      refreshStorageStats();
      showToast('Lead updated successfully.', 'success');
    },
    [leads, selectedLead, refreshStorageStats, showToast]
  );

  const deleteLead = useCallback(
    (id: string) => {
      const target = leads.find((l) => l.id === id);
      const name = target ? target.businessName : 'Lead';

      const updatedLeads = leads.filter((l) => l.id !== id);
      const updatedActs = activities.filter((a) => a.leadId !== id);
      const updatedFups = followups.filter((f) => f.leadId !== id);

      setLeads(updatedLeads);
      saveStoredLeads(updatedLeads);
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);
      setFollowups(updatedFups);
      saveStoredFollowUps(updatedFups);

      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(null);
      }

      refreshStorageStats();
      showToast(`Deleted ${name}.`, 'info');
    },
    [leads, activities, followups, selectedLead, refreshStorageStats, showToast]
  );

  // Import Leads Batch
  const importLeadsBatch = useCallback(
    (validRows: any[], updateDuplicates: boolean): number => {
      const now = new Date().toISOString();
      let importedCount = 0;
      const newLeadsList = [...leads];
      const newActivitiesList = [...activities];

      validRows.forEach((row, i) => {
        if (row.isDuplicate && row.duplicateWithLead && updateDuplicates) {
          // Update existing
          const leadIndex = newLeadsList.findIndex((l) => l.id === row.duplicateWithLead.id);
          if (leadIndex !== -1) {
            newLeadsList[leadIndex] = {
              ...newLeadsList[leadIndex],
              requirement: row.requirement || newLeadsList[leadIndex].requirement,
              area: row.area || newLeadsList[leadIndex].area,
              address: row.address || newLeadsList[leadIndex].address,
              callingStatus: row.callingStatus || newLeadsList[leadIndex].callingStatus,
              quotationStatus: row.quotationStatus || newLeadsList[leadIndex].quotationStatus,
              updatedAt: now,
            };
            importedCount++;
          }
        } else if (!row.isDuplicate || !updateDuplicates) {
          // Create new
          const newLead: Lead = {
            id: `lead_imp_${Date.now()}_${i}`,
            srNo: row.srNo || newLeadsList.length + 1,
            businessName: row.businessName,
            contactNumber: row.contactNumber,
            area: row.area || 'Local',
            address: row.address || '',
            customerType: 'B2B',
            category: 'Signage Letters & Boards',
            requirement: row.requirement || 'Signage requirement',
            callingStatus: row.callingStatus || 'Not Called',
            customerResponse: row.customerResponse || 'Follow-up Required',
            priority: 'Medium',
            estimatedValue: 50000,
            notes: `Imported from Excel on ${new Date().toLocaleDateString()}`,
            lastContactedAt: row.callingStatus !== 'Not Called' ? now : null,
            nextFollowUpAt: null,
            quotationStatus: row.quotationStatus || 'Not Needed',
            createdAt: now,
            updatedAt: now,
          };
          newLeadsList.unshift(newLead);
          importedCount++;

          newActivitiesList.unshift({
            id: `act_imp_${Date.now()}_${i}`,
            leadId: newLead.id,
            timestamp: now,
            type: 'lead_created',
            title: 'Lead Imported',
            summary: `Imported via spreadsheet batch: ${newLead.businessName}`,
          });
        }
      });

      setLeads(newLeadsList);
      saveStoredLeads(newLeadsList);
      setActivities(newActivitiesList);
      saveStoredActivities(newActivitiesList);

      refreshStorageStats();
      showToast(`Successfully processed ${importedCount} records!`, 'success');
      return importedCount;
    },
    [leads, activities, refreshStorageStats, showToast]
  );

  // Record Customer Response & Discussion
  const recordCustomerResponse = useCallback(
    (
      leadId: string,
      params: {
        response: CustomerResponse;
        discussionSummary: string;
        discussionDetails?: DiscussionDetails;
        followUpDate?: string | null;
        priority?: 'High' | 'Medium' | 'Low';
        estimatedValue?: number;
        lostReason?: string;
      }
    ) => {
      const now = new Date().toISOString();
      const currentLead = leads.find((l) => l.id === leadId);
      if (!currentLead) return;

      // Determine calling status based on customer response
      let newCallingStatus: CallingStatus = 'Called - Connected';
      if (params.response === 'No Answer') newCallingStatus = 'Called - No Answer';
      else if (params.response === 'Busy') newCallingStatus = 'Called - Busy';
      else if (params.response === 'Not Reachable') newCallingStatus = 'Called - Not Reachable';
      else if (params.response === 'Wrong Number') newCallingStatus = 'Called - Wrong Number';
      else if (params.response === 'Call Back') newCallingStatus = 'Callback Scheduled';

      // Determine quotation status transition
      let nextQuotationStatus = currentLead.quotationStatus;
      if (params.response === 'Required Quotation') {
        if (currentLead.quotationStatus === 'Not Needed') {
          nextQuotationStatus = 'Quotation Required';
        }
      }

      const updatedLead: Lead = {
        ...currentLead,
        customerResponse: params.response,
        callingStatus: newCallingStatus,
        lastContactedAt: now,
        nextFollowUpAt: params.followUpDate || currentLead.nextFollowUpAt,
        priority: params.priority || currentLead.priority,
        estimatedValue: params.estimatedValue !== undefined ? params.estimatedValue : currentLead.estimatedValue,
        quotationStatus: nextQuotationStatus,
        wonAt: params.response === 'Won' ? now : currentLead.wonAt,
        lostAt: params.response === 'Lost' ? now : currentLead.lostAt,
        lostReason: params.response === 'Lost' ? params.lostReason : currentLead.lostReason,
        updatedAt: now,
      };

      const updatedLeads = leads.map((l) => (l.id === leadId ? updatedLead : l));
      setLeads(updatedLeads);
      saveStoredLeads(updatedLeads);

      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updatedLead);
      }

      // Create rich activity log entry
      const newActivity: ActivityLog = {
        id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        leadId,
        timestamp: now,
        type: 'call',
        title: `Response: ${params.response}`,
        summary: params.discussionSummary || `Recorded response: ${params.response}`,
        response: params.response,
        discussion: params.discussionDetails,
        followUpDate: params.followUpDate,
      };
      const updatedActs = [newActivity, ...activities];
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);

      // If follow-up date was scheduled, create follow-up item
      if (params.followUpDate) {
        const newFup: FollowUp = {
          id: `fup_${Date.now()}`,
          leadId,
          leadBusinessName: updatedLead.businessName,
          leadContactNumber: updatedLead.contactNumber,
          scheduledAt: params.followUpDate,
          action: params.discussionDetails?.nextAction || `Follow up on response: ${params.response}`,
          notes: params.discussionSummary || '',
          status: 'pending',
          createdAt: now,
        };
        const updatedFups = [newFup, ...followups];
        setFollowups(updatedFups);
        saveStoredFollowUps(updatedFups);
      }

      refreshStorageStats();
      showToast(`Recorded response "${params.response}" for ${updatedLead.businessName}`, 'success');
    },
    [leads, activities, followups, selectedLead, refreshStorageStats, showToast]
  );

  const addActivityNote = useCallback(
    (leadId: string, note: string) => {
      const now = new Date().toISOString();
      const newAct: ActivityLog = {
        id: `act_${Date.now()}`,
        leadId,
        timestamp: now,
        type: 'note',
        title: 'Note Added',
        summary: note,
      };
      const updatedActs = [newAct, ...activities];
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);
      refreshStorageStats();
      showToast('Note saved to activity timeline.', 'info');
    },
    [activities, refreshStorageStats, showToast]
  );

  // Follow-up actions
  const createFollowUp = useCallback(
    (leadId: string, scheduledAt: string, action: string, notes: string = '') => {
      const currentLead = leads.find((l) => l.id === leadId);
      if (!currentLead) return;

      const now = new Date().toISOString();
      const newFup: FollowUp = {
        id: `fup_${Date.now()}`,
        leadId,
        leadBusinessName: currentLead.businessName,
        leadContactNumber: currentLead.contactNumber,
        scheduledAt,
        action,
        notes,
        status: 'pending',
        createdAt: now,
      };

      const updatedFups = [newFup, ...followups];
      setFollowups(updatedFups);
      saveStoredFollowUps(updatedFups);

      // Update lead's next follow-up
      const updatedLeads = leads.map((l) => (l.id === leadId ? { ...l, nextFollowUpAt: scheduledAt, updatedAt: now } : l));
      setLeads(updatedLeads);
      saveStoredLeads(updatedLeads);

      refreshStorageStats();
      showToast(`Follow-up scheduled for ${new Date(scheduledAt).toLocaleString()}`, 'success');
    },
    [leads, followups, refreshStorageStats, showToast]
  );

  const completeFollowUp = useCallback(
    (id: string, notes: string = '') => {
      const now = new Date().toISOString();
      const fup = followups.find((f) => f.id === id);
      if (!fup) return;

      const updatedFups = followups.map((f) =>
        f.id === id ? { ...f, status: 'completed' as const, completedAt: now, notes: notes || f.notes } : f
      );
      setFollowups(updatedFups);
      saveStoredFollowUps(updatedFups);

      // Add activity
      const newAct: ActivityLog = {
        id: `act_${Date.now()}`,
        leadId: fup.leadId,
        timestamp: now,
        type: 'followup_completed',
        title: 'Follow-up Completed',
        summary: `Completed follow-up: "${fup.action}". Notes: ${notes || 'No extra notes.'}`,
      };
      const updatedActs = [newAct, ...activities];
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);

      refreshStorageStats();
      showToast('Follow-up marked as completed.', 'success');
    },
    [followups, activities, refreshStorageStats, showToast]
  );

  const rescheduleFollowUp = useCallback(
    (id: string, newDateTime: string, notes: string = '') => {
      const now = new Date().toISOString();
      const fup = followups.find((f) => f.id === id);
      if (!fup) return;

      const updatedFups = followups.map((f) =>
        f.id === id ? { ...f, status: 'rescheduled' as const, rescheduledTo: newDateTime } : f
      );
      // Create fresh pending follow-up
      const newFup: FollowUp = {
        id: `fup_${Date.now()}`,
        leadId: fup.leadId,
        leadBusinessName: fup.leadBusinessName,
        leadContactNumber: fup.leadContactNumber,
        scheduledAt: newDateTime,
        action: fup.action,
        notes: notes || `Rescheduled from ${new Date(fup.scheduledAt).toLocaleString()}`,
        status: 'pending',
        createdAt: now,
      };

      const finalFups = [newFup, ...updatedFups];
      setFollowups(finalFups);
      saveStoredFollowUps(finalFups);

      // Update lead
      const updatedLeads = leads.map((l) => (l.id === fup.leadId ? { ...l, nextFollowUpAt: newDateTime, updatedAt: now } : l));
      setLeads(updatedLeads);
      saveStoredLeads(updatedLeads);

      refreshStorageStats();
      showToast('Follow-up rescheduled successfully.', 'info');
    },
    [followups, leads, refreshStorageStats, showToast]
  );

  // Quotations CRUD
  const saveQuotation = useCallback(
    (quotation: Quotation) => {
      const now = new Date().toISOString();
      const exists = quotations.some((q) => q.id === quotation.id);
      let updatedQuotes: Quotation[];

      if (exists) {
        updatedQuotes = quotations.map((q) => (q.id === quotation.id ? { ...quotation, updatedAt: now } : q));
      } else {
        updatedQuotes = [quotation, ...quotations];
      }

      setQuotations(updatedQuotes);
      saveStoredQuotations(updatedQuotes);

      // Increment quotation counter in settings if new
      if (!exists) {
        const nextSettings: CRMSettings = {
          ...settings,
          quotationCounter: settings.quotationCounter + 1,
        };
        setSettings(nextSettings);
        saveStoredSettings(nextSettings);
      }

      // Update lead's quotation status and ID
      const updatedLeads = leads.map((l) => {
        if (l.id === quotation.leadId) {
          return {
            ...l,
            quotationId: quotation.id,
            quotationStatus: (quotation.status === 'Draft' ? 'Drafting' : 'Prepared') as QuotationStatus,
            estimatedValue: quotation.grandTotal || l.estimatedValue,
            updatedAt: now,
          };
        }
        return l;
      });
      setLeads(updatedLeads);
      saveStoredLeads(updatedLeads);

      // Log activity
      const actType = exists ? 'quotation_created' : 'quotation_created';
      const newAct: ActivityLog = {
        id: `act_${Date.now()}`,
        leadId: quotation.leadId,
        timestamp: now,
        type: actType,
        title: exists ? `Quotation ${quotation.quotationNumber} Updated` : `Quotation ${quotation.quotationNumber} Prepared`,
        summary: `Quotation grand total: ₹${Number(quotation.grandTotal).toLocaleString('en-IN')}. Items: ${quotation.items.length}.`,
      };
      const updatedActs = [newAct, ...activities];
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);

      refreshStorageStats();
      showToast(`Quotation ${quotation.quotationNumber} saved!`, 'success');
    },
    [quotations, leads, settings, activities, refreshStorageStats, showToast]
  );

  const updateQuotationStatus = useCallback(
    (id: string, status: Quotation['status'], feedback?: string) => {
      const now = new Date().toISOString();
      const quote = quotations.find((q) => q.id === id);
      if (!quote) return;

      const updatedQuote: Quotation = {
        ...quote,
        status,
        feedback: feedback || quote.feedback,
        sharedAt: status === 'Shared' ? now : quote.sharedAt,
        updatedAt: now,
      };

      const updatedQuotes = quotations.map((q) => (q.id === id ? updatedQuote : q));
      setQuotations(updatedQuotes);
      saveStoredQuotations(updatedQuotes);

      // Update lead status
      const updatedLeads = leads.map((l) => {
        if (l.id === quote.leadId) {
          let leadQuoStatus: QuotationStatus = 'Prepared';
          if (status === 'Shared') leadQuoStatus = 'Shared';
          if (status === 'Accepted') leadQuoStatus = 'Accepted';
          if (status === 'Rejected') leadQuoStatus = 'Rejected';

          return {
            ...l,
            quotationStatus: leadQuoStatus,
            customerResponse: (status === 'Accepted' ? 'Won' : status === 'Rejected' ? 'Lost' : l.customerResponse),
            wonAt: status === 'Accepted' ? now : l.wonAt,
            lostAt: status === 'Rejected' ? now : l.lostAt,
            lostReason: status === 'Rejected' ? (feedback || 'Customer declined quotation') : l.lostReason,
            updatedAt: now,
          };
        }
        return l;
      });
      setLeads(updatedLeads);
      saveStoredLeads(updatedLeads);

      // Activity
      const actType = status === 'Shared' ? 'quotation_shared' : status === 'Accepted' ? 'quotation_accepted' : 'quotation_rejected';
      const newAct: ActivityLog = {
        id: `act_${Date.now()}`,
        leadId: quote.leadId,
        timestamp: now,
        type: actType,
        title: `Quotation Marked as ${status}`,
        summary: `Status of ${quote.quotationNumber} updated to ${status}.${feedback ? ` Notes: ${feedback}` : ''}`,
      };
      const updatedActs = [newAct, ...activities];
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);

      refreshStorageStats();
      showToast(`Quotation status updated to ${status}.`, 'success');
    },
    [quotations, leads, activities, refreshStorageStats, showToast]
  );

  const duplicateQuotation = useCallback(
    (id: string): Quotation => {
      const source = quotations.find((q) => q.id === id);
      if (!source) throw new Error('Quotation not found.');

      const now = new Date().toISOString();
      const newNumber = `${settings.quotationPrefix}-${String(settings.quotationCounter + 1).padStart(4, '0')}`;

      const duplicated: Quotation = {
        ...source,
        id: `quo_${Date.now()}`,
        quotationNumber: newNumber,
        version: 1,
        parentQuotationId: undefined,
        status: 'Draft',
        createdAt: now,
        updatedAt: now,
      };

      const updated = [duplicated, ...quotations];
      setQuotations(updated);
      saveStoredQuotations(updated);

      const nextSettings = { ...settings, quotationCounter: settings.quotationCounter + 1 };
      setSettings(nextSettings);
      saveStoredSettings(nextSettings);

      refreshStorageStats();
      showToast(`Duplicated into ${newNumber}`, 'info');
      return duplicated;
    },
    [quotations, settings, refreshStorageStats, showToast]
  );

  const createRevision = useCallback(
    (id: string): Quotation => {
      const source = quotations.find((q) => q.id === id);
      if (!source) throw new Error('Quotation not found.');

      const now = new Date().toISOString();
      const nextVersion = source.version + 1;

      // Mark source as revised
      const revisedSource: Quotation = { ...source, status: 'Revised', updatedAt: now };

      const newRevision: Quotation = {
        ...source,
        id: `quo_rev_${Date.now()}`,
        version: nextVersion,
        parentQuotationId: source.id,
        status: 'Draft',
        date: now.split('T')[0],
        createdAt: now,
        updatedAt: now,
      };

      const updated = [newRevision, ...quotations.map((q) => (q.id === id ? revisedSource : q))];
      setQuotations(updated);
      saveStoredQuotations(updated);

      refreshStorageStats();
      showToast(`Created revision v${nextVersion} of ${source.quotationNumber}`, 'info');
      return newRevision;
    },
    [quotations, refreshStorageStats, showToast]
  );

  // Unrestricted File Attachments (IndexedDB + Meta)
  const uploadAttachment = useCallback(
    async (leadId: string, file: File, quotationId?: string, description?: string): Promise<FileAttachmentMeta> => {
      const now = new Date().toISOString();
      const id = `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const ext = file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() || '' : 'FILE';

      // Store blob in IndexedDB
      await saveAttachmentBlob(id, file);

      // Store metadata
      const meta: FileAttachmentMeta = {
        id,
        leadId,
        quotationId,
        fileName: file.name,
        fileExtension: ext,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        uploadedAt: now,
        description: description || '',
      };

      const updated = [meta, ...attachmentsMeta];
      setAttachmentsMeta(updated);
      saveStoredAttachmentMetas(updated);

      // Log activity
      const newAct: ActivityLog = {
        id: `act_${Date.now()}`,
        leadId,
        timestamp: now,
        type: 'file_uploaded',
        title: `File Uploaded: ${file.name}`,
        summary: `Stored ${ext} file (${(file.size / 1024).toFixed(1)} KB) in local IndexedDB.`,
      };
      const updatedActs = [newAct, ...activities];
      setActivities(updatedActs);
      saveStoredActivities(updatedActs);

      // If lead was design pending, update to design received
      const targetLead = leads.find((l) => l.id === leadId);
      if (targetLead && targetLead.quotationStatus === 'Design Pending') {
        const updatedLeads = leads.map((l) => (l.id === leadId ? { ...l, quotationStatus: 'Design Received' as const, updatedAt: now } : l));
        setLeads(updatedLeads);
        saveStoredLeads(updatedLeads);
      }

      refreshStorageStats();
      showToast(`File "${file.name}" saved to local storage!`, 'success');
      return meta;
    },
    [attachmentsMeta, activities, leads, refreshStorageStats, showToast]
  );

  const deleteAttachment = useCallback(
    async (id: string): Promise<void> => {
      await deleteAttachmentBlob(id);
      const updated = attachmentsMeta.filter((a) => a.id !== id);
      setAttachmentsMeta(updated);
      saveStoredAttachmentMetas(updated);
      refreshStorageStats();
      showToast('Attachment deleted.', 'info');
    },
    [attachmentsMeta, refreshStorageStats, showToast]
  );

  const downloadAttachmentFile = useCallback(
    async (id: string): Promise<void> => {
      const meta = attachmentsMeta.find((a) => a.id === id);
      if (!meta) {
        showToast('File metadata not found.', 'error');
        return;
      }

      const blob = await getAttachmentBlob(id);
      if (!blob) {
        showToast('File blob not found in IndexedDB.', 'error');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = meta.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [attachmentsMeta, showToast]
  );

  // Settings
  const updateSettings = useCallback(
    (newSettings: CRMSettings) => {
      setSettings(newSettings);
      saveStoredSettings(newSettings);
      refreshStorageStats();
      showToast('Company settings updated.', 'success');
    },
    [refreshStorageStats, showToast]
  );

  const reloadSeedData = useCallback(() => {
    resetAllCRMData();
    clearAllAttachmentBlobs();
    loadSampleSeedData();
    setLeads(getStoredLeads());
    setActivities(getStoredActivities());
    setFollowups(getStoredFollowUps());
    setQuotations(getStoredQuotations());
    setAttachmentsMeta([]);
    setSettings(getStoredSettings());
    refreshStorageStats();
    showToast('Loaded demo signage dataset.', 'success');
  }, [refreshStorageStats, showToast]);

  const clearAllData = useCallback(async () => {
    resetAllCRMData();
    await clearAllAttachmentBlobs();
    setLeads([]);
    setActivities([]);
    setFollowups([]);
    setQuotations([]);
    setAttachmentsMeta([]);
    setSettings(DEFAULT_SETTINGS);
    refreshStorageStats();
    showToast('All CRM records and local files have been cleared.', 'info');
  }, [refreshStorageStats, showToast]);

  return (
    <CRMContext.Provider
      value={{
        currentView,
        setCurrentView,
        searchQuery,
        setSearchQuery,
        isSidebarOpen,
        setIsSidebarOpen,
        leads,
        activities,
        followups,
        quotations,
        attachmentsMeta,
        settings,
        lastSaved,
        activeModal,
        openModal,
        closeModal,
        selectedLead,
        setSelectedLead,
        selectedQuotation,
        setSelectedQuotation,
        createLead,
        updateLead,
        deleteLead,
        importLeadsBatch,
        recordCustomerResponse,
        addActivityNote,
        createFollowUp,
        completeFollowUp,
        rescheduleFollowUp,
        saveQuotation,
        updateQuotationStatus,
        duplicateQuotation,
        createRevision,
        uploadAttachment,
        deleteAttachment,
        downloadAttachmentFile,
        updateSettings,
        reloadSeedData,
        clearAllData,
        storageUsageBytes,
        browserStorageInfo,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export function useCRM(): CRMContextType {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
