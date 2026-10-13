import React, { useState, useRef } from 'react';
import {
  Building2,
  Phone,
  Mail,
  FileText,
  Percent,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CRMSettings } from '../../types/crm';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  exportFullJSONBackup,
  parseAndValidateJSONBackup,
} from '../../services/excel';
import { saveStoredLeads, saveStoredActivities, saveStoredFollowUps, saveStoredQuotations, saveStoredAttachmentMetas, saveStoredSettings } from '../../services/storage';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    leads,
    activities,
    followups,
    quotations,
    attachmentsMeta,
    storageUsageBytes,
    browserStorageInfo,
    reloadSeedData,
    clearAllData,
    showToast,
  } = useCRM();

  const backupInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CRMSettings>(settings);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSeedConfirmOpen, setIsSeedConfirmOpen] = useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (field: keyof CRMSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    showToast('Company settings successfully updated!', 'success');
  };

  const handleExportJSON = () => {
    exportFullJSONBackup(
      leads,
      activities,
      followups,
      quotations,
      attachmentsMeta,
      settings
    );
    showToast('CRM full JSON backup downloaded.', 'success');
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseAndValidateJSONBackup(file);
      // Save data
      saveStoredLeads(data.leads);
      saveStoredActivities(data.activities);
      saveStoredFollowUps(data.followups);
      saveStoredQuotations(data.quotations);
      saveStoredAttachmentMetas(data.attachmentsMeta);
      if (data.settings && data.settings.companyName) {
        saveStoredSettings(data.settings);
      }
      showToast(`Backup restored! Loaded ${data.leads.length} leads. Refreshing...`, 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      showToast(err.message || 'Failed to restore backup file.', 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">CRM & Company Profile Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure branding, tax / GST rates, quotation terms, and browser offline storage
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
        {/* Company Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Company & Branding Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                placeholder="e.g. 27AABCA1234F1Z8"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Contact Phone</label>
              <input
                type="tel"
                value={formData.companyContactNumber}
                onChange={(e) => handleChange('companyContactNumber', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Registered Address / Facility</label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Sales Agent Profile */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Sales Representative Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sales Representative Name</label>
              <input
                type="text"
                value={formData.salesAgentName}
                onChange={(e) => handleChange('salesAgentName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Direct Calling Contact</label>
              <input
                type="tel"
                value={formData.salesContactNumber}
                onChange={(e) => handleChange('salesContactNumber', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Quotation & Tax Configuration */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Percent className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Quotation & Finance Defaults</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default GST Rate (%)</label>
              <select
                value={formData.defaultGstRate}
                onChange={(e) => handleChange('defaultGstRate', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard Signage)</option>
                <option value={28}>28%</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quotation Validity</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={formData.validityPeriodDays}
                  onChange={(e) => handleChange('validityPeriodDays', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
                <span className="text-slate-400">days</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quotation Prefix</label>
              <input
                type="text"
                value={formData.quotationPrefix}
                onChange={(e) => handleChange('quotationPrefix', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Payment Terms</label>
              <textarea
                rows={2}
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Terms & Conditions</label>
              <textarea
                rows={4}
                value={formData.termsAndConditions}
                onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Storage, Backup & Privacy Management */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Local Storage & Privacy Architecture</h3>
        </div>

        {/* Informational callout */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-slate-600 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Server / Complete Privacy Guarantee</span>
          </div>
          <p>
            This CRM runs 100% in your browser. No lead records, phone numbers, or CAD files are ever transmitted to any remote database.
            Structured records are stored in <strong>localStorage</strong>, while heavy drawings and attachments are held in <strong>IndexedDB</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-slate-700">
            <span>LocalStorage Usage: <strong>{formatBytes(storageUsageBytes)}</strong></span>
            <span>Files in IndexedDB: <strong>{attachmentsMeta.length} files</strong></span>
            {browserStorageInfo.quotaBytes > 0 && (
              <span>
                Browser Quota Used: <strong>{browserStorageInfo.percentageUsed}%</strong>
              </span>
            )}
          </div>
        </div>

        {/* Backup & Restore Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON Backup */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-slate-900">Export Full JSON Backup</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download a complete JSON snapshot containing all leads, activities, quotations, and settings.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full py-2 font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download Full Backup (.json)</span>
            </button>
          </div>

          {/* Restore JSON Backup */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <div className="font-bold text-slate-900">Restore From Backup File</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Restore CRM records from a previously exported JSON backup file.
              </p>
            </div>
            <div>
              <input
                ref={backupInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreBackupFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="w-full py-2 font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Upload & Restore Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-rose-900">Reset or Seed Data</div>
              <p className="text-[11px] text-rose-700">
                Reload sample signage dataset or completely wipe browser storage.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsSeedConfirmOpen(true)}
              className="px-3.5 py-1.5 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Sample Signage Dataset</span>
            </button>

            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-1.5 font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Wipe All CRM Data?"
        message="Are you sure you want to completely erase all leads, quotations, call history, and stored attachments? Make sure you have exported a JSON backup first."
        confirmLabel="Wipe Everything"
        onConfirm={async () => {
          await clearAllData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Confirm Seed Modal */}
      <ConfirmModal
        isOpen={isSeedConfirmOpen}
        title="Reload Sample Signage Data?"
        message="This will reset your CRM to the sample dataset featuring letters, materials, and machinery leads. Any existing local records will be replaced."
        confirmLabel="Load Sample Data"
        isDestructive={false}
        onConfirm={() => {
          reloadSeedData();
          setIsSeedConfirmOpen(false);
        }}
        onCancel={() => setIsSeedConfirmOpen(false)}
      />
    </div>
  );
};
