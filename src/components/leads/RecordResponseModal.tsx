import React, { useState, useEffect } from 'react';
import {
  X,
  PhoneCall,
  Calendar,
  IndianRupee,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
  Share2,
  MessageCircle,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CustomerResponse, DiscussionDetails, Priority } from '../../types/crm';
import {
  generateCompanyProfilePDF,
  getStoredPortfolio,
  getStoredRateCard,
} from '../../services/portfolioData';

const RESPONSE_OPTIONS: { id: CustomerResponse; label: string; color: string; desc: string }[] = [
  { id: 'Yes, Required', label: 'Yes, Required', color: 'border-emerald-500 bg-emerald-50/50 text-emerald-800', desc: 'Customer confirmed requirement' },
  { id: 'Required Quotation', label: 'Required Quotation', color: 'border-indigo-500 bg-indigo-50/50 text-indigo-800', desc: 'Wants official estimate & pricing' },
  { id: 'Call Back', label: 'Call Back', color: 'border-blue-500 bg-blue-50/50 text-blue-800', desc: 'Customer requested a callback' },
  { id: 'Interested — Details Pending', label: 'Interested — Details Pending', color: 'border-amber-500 bg-amber-50/50 text-amber-800', desc: 'Site visit or drawings awaited' },
  { id: 'Follow-up Required', label: 'Follow-up Required', color: 'border-sky-500 bg-sky-50/50 text-sky-800', desc: 'General follow-up needed' },
  { id: 'No Answer', label: 'No Answer', color: 'border-slate-300 bg-slate-50 text-slate-700', desc: 'Call was not answered' },
  { id: 'Busy', label: 'Busy', color: 'border-slate-300 bg-slate-50 text-slate-700', desc: 'Customer on another call / busy' },
  { id: 'Not Reachable', label: 'Not Reachable', color: 'border-slate-300 bg-slate-50 text-slate-700', desc: 'Out of coverage / switched off' },
  { id: 'Wrong Number', label: 'Wrong Number', color: 'border-rose-300 bg-rose-50 text-rose-700', desc: 'Invalid contact details' },
  { id: 'Already Purchased', label: 'Already Purchased', color: 'border-slate-300 bg-slate-50 text-slate-700', desc: 'Bought from another supplier' },
  { id: 'Not Required', label: 'Not Required', color: 'border-slate-300 bg-slate-50 text-slate-700', desc: 'No current requirement' },
  { id: 'Won', label: 'Won Deal', color: 'border-emerald-600 bg-emerald-100 text-emerald-900', desc: 'Deal finalized & closed' },
  { id: 'Lost', label: 'Lost Deal', color: 'border-rose-500 bg-rose-50 text-rose-800', desc: 'Lost to competitor or dropped' },
];

export const RecordResponseModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    openModal,
    selectedLead,
    recordCustomerResponse,
    settings,
    showToast,
    addActivityNote,
  } = useCRM();

  const [response, setResponse] = useState<CustomerResponse>('Follow-up Required');
  const [discussionSummary, setDiscussionSummary] = useState('');
  const [productRequired, setProductRequired] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [quantity, setQuantity] = useState('');
  const [materialPreferences, setMaterialPreferences] = useState('');
  const [lightingPreferences, setLightingPreferences] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [nextAction, setNextAction] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [lostReason, setLostReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedLead) {
      setResponse(selectedLead.customerResponse || 'Follow-up Required');
      setProductRequired(selectedLead.requirement || '');
      setPriority(selectedLead.priority || 'Medium');
      setBudget(selectedLead.estimatedValue ? String(selectedLead.estimatedValue) : '');
      setDiscussionSummary('');
      setSpecifications('');
      setDimensions('');
      setQuantity('');
      setMaterialPreferences('');
      setLightingPreferences('');
      setNextAction('');
      setFollowUpDate('');
      setLostReason('');
      setErrorMsg('');
    }
  }, [selectedLead]);

  if (activeModal !== 'record_response' || !selectedLead) return null;

  // Direct 1-Click WhatsApp Share of Company Profile, Project Photos & Indicative Rates
  const handleQuickWhatsAppShare = () => {
    const rawDigits = selectedLead.contactNumber.replace(/\D/g, '');
    const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
    const companyName = settings.companyName || 'Apex Signage Solutions & Machinery';
    const agentName = settings.salesAgentName || 'Sales Representative';
    const contact = settings.salesContactNumber || settings.companyContactNumber;
    const clientName = selectedLead.businessName || 'Sir / Madam';
    const reqText = selectedLead.requirement ? `regarding your requirement for "${selectedLead.requirement}"` : 'regarding your signage requirements';

    const message = `Hello ${clientName},

Greetings from *${companyName}*!

As requested during our discussion ${reqText}, here are our company details, executed project showcase, and indicative rate card:

🏢 *ABOUT OUR MANUFACTURING UNIT:*
We are a premier signage manufacturing & machinery fabrication unit specializing in high-precision 3D acrylic letters, stainless steel backlit signs, ACP boards, and automated CNC channel letter benders.

📸 *EXECUTED PROJECT HIGHLIGHTS:*
1. *3D Frontlit Acrylic Channel Letters* — High-grade cast acrylic with Samsung IP67 waterproof LEDs (Corporate facades & showrooms).
2. *Gold Titanium SS 304 Backlit Halo Letters* — Anti-rust 304-grade stainless steel with luxury PVD mirror finish & warm halo glow.
3. *Retail Liquid Acrylic Signboards* — High-gloss seamless liquid resin letters on 3mm exterior ACP cladding tray.
4. *CNC Automatic Channel Letter Benders* — Servo-driven automated channel bending machines for aluminum & SS coils.

💰 *INDICATIVE SIGNAGE RATE CARD:*
• Trimless 3D Frontlit Acrylic: ₹3,200 - ₹3,800 / Running Ft
• Trimcap 3D LED Letters: ₹2,400 - ₹2,800 / Running Ft
• Liquid Acrylic on SS Tray: ₹3,800 - ₹4,500 / Piece
• SS 304 Titanium Backlit Halo: ₹5,500 - ₹7,500 / Piece
• ACP Signboard with 3D Letters: ₹850 - ₹1,250 / Sq.Ft
• Wholesale Cast Acrylic Sheets (3mm): ₹4,800 / Sheet (8x4 ft)
• CNC Channel Letter Bender Pro: ₹3,85,000 / Complete Setup
*(Custom quote provided based on exact font vector, dimensions & height).*

🛡️ *QUALITY ASSURANCE & WARRANTY:*
• 3-Year comprehensive replacement warranty on Samsung LED modules & power supplies.
• 100% Virgin Grade outdoor cast acrylic (no yellowing or UV fading).
• Grade 304 certified rust-proof stainless steel.
• Standard dispatch: 5 to 7 working days from artwork sign-off.

📍 *FACTORY & WORKSHOP LOCATION:*
${settings.companyAddress}
*(You are cordially invited to visit our workshop for live letter samples & machine demos).*

📋 *REGISTRATION & TAXES:*
GSTIN: ${settings.gstin} | Pan-India Delivery & Installation Available.

Please let me know if you would like a customized formal quotation or a site measurement survey.

Warm regards,
*${agentName}*
*${companyName}*
📞 ${contact} | ✉️ ${settings.email}`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');

    // Auto record activity & autofill discussion summary
    addActivityNote(
      selectedLead.id,
      `⚡ 1-Click WhatsApp: Directly shared Company Profile, Executed Project Photos list & Indicative Rate Card pack with customer.`
    );

    if (!discussionSummary.trim()) {
      setDiscussionSummary('Customer requested details. Directly shared company profile, project photos, rate card, and workshop address via WhatsApp.');
    }

    if (response === 'Follow-up Required' || response === 'Call Back') {
      setResponse('Interested — Details Pending');
    }

    showToast(`Dispatched details pack to ${selectedLead.businessName} on WhatsApp!`, 'success');
  };

  const handleDownloadBrochure = () => {
    const portfolioItems = getStoredPortfolio();
    const rateCardItems = getStoredRateCard();
    const doc = generateCompanyProfilePDF(settings, portfolioItems, rateCardItems);
    const fileName = `${settings.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Portfolio_Brochure.pdf`;
    doc.save(fileName);
    showToast('Downloaded Company Portfolio & Rate Card PDF Brochure!', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (response === 'Call Back' && !followUpDate) {
      setErrorMsg('Please specify a callback date and time for "Call Back".');
      return;
    }
    if (response === 'Lost' && !lostReason.trim()) {
      setErrorMsg('Please provide a reason for the lost deal.');
      return;
    }

    const discussionDetails: DiscussionDetails = {
      specifications: [productRequired, specifications].filter(Boolean).join(' — '),
      dimensions: dimensions.trim() || undefined,
      quantity: quantity.trim() || undefined,
      materialPreferences: materialPreferences.trim() || undefined,
      lightingPreferences: lightingPreferences.trim() || undefined,
      budget: budget ? Number(budget) : undefined,
      nextAction: nextAction.trim() || undefined,
    };

    recordCustomerResponse(selectedLead.id, {
      response,
      discussionSummary: discussionSummary.trim() || `Customer response: ${response}`,
      discussionDetails,
      followUpDate: followUpDate || null,
      priority,
      estimatedValue: budget ? Number(budget) : selectedLead.estimatedValue,
      lostReason: response === 'Lost' ? lostReason.trim() : undefined,
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                Call Discussion
              </span>
              <h3 className="text-base font-bold text-slate-900">{selectedLead.businessName}</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Contact: {selectedLead.contactNumber} · Area: {selectedLead.area}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROMINENT DIRECT FACILITY: Customer Requested Details */}
        <div className="mt-3.5 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-300 rounded-xl shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Customer says: "Share me details"?</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Directly dispatch company profile, executed project photos, indicative rates, 3-year warranty, and workshop location to <strong>{selectedLead.contactNumber}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleQuickWhatsAppShare}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5"
                title="Send Company Details, Project Photos & Rates to Customer on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>1-Click WhatsApp Share</span>
              </button>

              <button
                type="button"
                onClick={() => openModal('share_details', selectedLead)}
                className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Customize Templates, Pick Project Photos & Edit Message"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Custom Pack</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBrochure}
                className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Download PDF Catalog to attach"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Step 1: Select Customer Response (13 Options) */}
          <div>
            <label className="block font-bold text-slate-800 mb-2">
              Customer Response <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RESPONSE_OPTIONS.map((opt) => {
                const isSelected = response === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setResponse(opt.id);
                      setErrorMsg('');
                    }}
                    className={`p-2.5 text-left rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? `border-2 font-bold shadow-xs ${opt.color}`
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="truncate">{opt.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Discussion Summary */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Discussion Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={discussionSummary}
              onChange={(e) => setDiscussionSummary(e.target.value)}
              placeholder="Summary of conversation, key points discussed, customer attitude..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Lost Deal Reason (if Lost selected) */}
          {response === 'Lost' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
              <label className="block font-bold text-rose-800">
                Reason for Lost Deal <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                placeholder="e.g. Price too high, Competitor won, Requirement cancelled..."
                className="w-full px-3 py-1.5 bg-white border border-rose-300 rounded text-slate-900 focus:outline-none"
              />
            </div>
          )}

          {/* Step 3: Product & Technical Specifications */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Signage Specifications & Dimensions</span>
              <span className="text-[10px] font-normal text-slate-500">Optional technical details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Product / Service
                </label>
                <input
                  type="text"
                  value={productRequired}
                  onChange={(e) => setProductRequired(e.target.value)}
                  placeholder="e.g. Trimcap 3D LED Letters"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Dimensions (Length × Height)
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 24 ft × 4 ft or 18 inches letter height"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Quantity / Running Feet
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 1 Board / 24 Letters / 50 Sheets"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Customer Budget (INR ₹)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 85000"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Material Preferences
                </label>
                <input
                  type="text"
                  value={materialPreferences}
                  onChange={(e) => setMaterialPreferences(e.target.value)}
                  placeholder="e.g. Cast Acrylic, SS 304 Mirror Gold, ACP 3mm"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Lighting Preferences
                </label>
                <input
                  type="text"
                  value={lightingPreferences}
                  onChange={(e) => setLightingPreferences(e.target.value)}
                  placeholder="e.g. Warm White 3000K, Halo Backlit, Samsung LED"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Next Follow-up & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Schedule Follow-up Date & Time{' '}
                {response === 'Call Back' && <span className="text-rose-500">* (Required)</span>}
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required={response === 'Call Back'}
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Next Action Note */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Next Action Required</label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g. Send WhatsApp quote, prepare CAD drawing, site visit"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick Share Details Callout Banner */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Customer requested details?</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Instantly send company portfolio, executed project photos, indicative rates & factory address via WhatsApp.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openModal('share_details', selectedLead)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <span>Share Details Pack</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => openModal('share_details', selectedLead)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Share Portfolio & Rates →</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
              >
                Record Customer Response
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
