import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  ExternalLink,
  MessageCircle,
  Building2,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Phone,
  MapPin,
  Sparkles,
  Sliders,
  AlertCircle,
  CreditCard,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, PortfolioItem } from '../../types/crm';
import {
  getStoredPortfolio,
  getStoredRateCard,
  generateCompanyProfilePDF,
} from '../../services/portfolioData';

type TemplateType = 'full' | 'ratecard' | 'portfolio' | 'machinery' | 'short';

export const ShareDetailsModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedLead,
    settings,
    leads,
    addActivityNote,
    showToast,
  } = useCRM();

  const [targetLead, setTargetLead] = useState<Lead | null>(selectedLead);
  const [template, setTemplate] = useState<TemplateType>('full');
  const [includeRates, setIncludeRates] = useState(true);
  const [includeAddress, setIncludeAddress] = useState(true);
  const [includeWarranty, setIncludeWarranty] = useState(true);
  const [includeGSTIN, setIncludeGSTIN] = useState(true);
  const [includeBank, setIncludeBank] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'message' | 'photos' | 'rates'>('message');
  const [previewPhoto, setPreviewPhoto] = useState<PortfolioItem | null>(null);

  const portfolioItems = getStoredPortfolio();
  const rateCardItems = getStoredRateCard();

  useEffect(() => {
    if (selectedLead) {
      setTargetLead(selectedLead);
    } else if (leads.length > 0) {
      setTargetLead(leads[0]);
    }
  }, [selectedLead, leads, activeModal]);

  // Generate dynamic message based on chosen template and toggles
  useEffect(() => {
    const clientName = targetLead?.businessName || 'Sir / Madam';
    const requirement = targetLead?.requirement ? `regarding your requirement for "${targetLead.requirement}"` : 'regarding your signage requirements';
    const agentName = settings.salesAgentName || 'Sales Representative';
    const companyName = settings.companyName || 'Apex Signage Solutions & Machinery';
    const contact = settings.salesContactNumber || settings.companyContactNumber;

    let msg = '';

    if (template === 'full') {
      msg = `Hello ${clientName},

Greetings from *${companyName}*!

As discussed on our call ${requirement}, I am pleased to share our complete company profile, indicative rate card, and executed project showcase with you.

🏢 *ABOUT US:*
We are a premier signage manufacturing & machinery fabrication unit specializing in high-finish architectural letters, commercial glow signboards, and turnkey branding installations.

📸 *EXECUTED PROJECT HIGHLIGHTS:*
1. *3D Frontlit Acrylic Channel Letters* — High-grade cast acrylic with Samsung IP67 warm/cool LEDs (Corporate facades & lobbies).
2. *Gold Titanium SS 304 Backlit Halo Letters* — Anti-rust 304-grade stainless steel with luxury PVD mirror finish & halo blue/warm illumination.
3. *Retail Liquid Acrylic Signboards* — High-gloss seamless liquid resin letters on 3mm exterior ACP cladding tray.
4. *CNC Automatic Letter Benders* — Servo-driven automated channel bending machines for aluminum & SS coils.
`;

      if (includeRates) {
        msg += `
💰 *INDICATIVE SIGNAGE RATE CARD:*
• Trimless 3D Frontlit Acrylic: ₹3,200 - ₹3,800 / Running Ft
• Trimcap 3D LED Letters: ₹2,400 - ₹2,800 / Running Ft
• Liquid Acrylic on SS Tray: ₹3,800 - ₹4,500 / Piece
• SS 304 Titanium Backlit Halo: ₹5,500 - ₹7,500 / Piece
• ACP Signboard with 3D Letters: ₹850 - ₹1,250 / Sq.Ft
• Wholesale Cast Acrylic Sheets (3mm): ₹4,800 / Sheet (8x4 ft)
• CNC Channel Letter Bender Pro: ₹3,85,000 / Complete Setup
*(Final quote provided based on exact font, size & site height).*
`;
      }

      if (includeWarranty) {
        msg += `
🛡️ *QUALITY ASSURANCE & WARRANTY:*
• 3-Year comprehensive replacement warranty on Samsung LED modules & power supplies.
• 100% Virgin Grade outdoor cast acrylic (no yellowing or UV fading).
• Grade 304 certified rust-proof stainless steel.
• Standard dispatch: 5 to 7 working days from artwork sign-off.
`;
      }

      if (includeAddress) {
        msg += `
📍 *FACTORY & WORKSHOP LOCATION:*
${settings.companyAddress}
*(You are cordially invited to visit our workshop to see live letter samples & machine demos).*
`;
      }

      if (includeGSTIN) {
        msg += `
📋 *REGISTRATION & TAXES:*
GSTIN: ${settings.gstin} | Pan-India Delivery & Installation Available.
`;
      }

      if (includeBank) {
        msg += `
💳 *ADVANCE BOOKING & BANK DETAILS:*
Bank: HDFC Bank | A/C No: 50200038491823 | IFSC: HDFC0001824
UPI ID: apex.signage@hdfcbank | Advance: 50% with PO, 50% on dispatch.
`;
      }

      msg += `
Please let me know if you would like us to prepare a formal customized quotation or conduct a site measurement survey.

Warm regards,
*${agentName}*
*${companyName}*
📞 ${contact} | ✉️ ${settings.email}`;
    } else if (template === 'ratecard') {
      msg = `Hello ${clientName},

Greetings from *${companyName}*!

Here is our updated *Signage Indicative Rate Card* for your reference:

📐 *LETTERS & SIGNAGE RATES:*
• Trimless 3D Frontlit Letters: ₹3,800 / Running Ft (Samsung LEDs)
• Trimcap 3D Channel Letters: ₹2,600 / Running Ft
• Liquid Acrylic on SS Tray: ₹4,200 / Piece
• SS 304 Titanium Gold Backlit: ₹6,500 / Piece
• ACP Cladded Glow Signboard: ₹950 / Sq.Ft
• Double-Sided Flex Glow Sign: ₹380 / Sq.Ft

⚙️ *SIGNAGE MACHINERY:*
• CNC Channel Letter Bender: ₹3,85,000 / Setup
• 1500W Raycus Fiber Laser Cutter: ₹7,50,000 / Setup

📦 *WHOLESALE MATERIALS:*
• Cast Acrylic Sheet 3mm (8x4 ft): ₹4,800 / Sheet
• Samsung 2835 LED Modules (100 pcs): ₹2,800 / Pack

GST: 18% as applicable. We also provide on-site installation and hydraulic crane access.

Feel free to send your drawing or dimensions to receive a formal quotation!

*${agentName}* | *${companyName}*
📞 ${contact}`;
    } else if (template === 'portfolio') {
      msg = `Hello ${clientName},

Greetings from *${companyName}*!

Following up on our discussion, here is a preview of our recent executed signage projects and craftsmanship:

✨ *1. Corporate 3D Frontlit Acrylic Letters*
Cast acrylic face, seamless return, uniform Samsung LED lighting. Perfect for corporate reception and building frontage.

✨ *2. Titanium Gold SS 304 Halo Backlit Letters*
Laser-cut Grade 304 Stainless Steel with PVD titanium finish. Elegant halo warm glow for luxury showrooms, hotels & clinics.

✨ *3. Retail Storefront Liquid Acrylic & ACP Boards*
Solid liquid resin letters with high gloss finish mounted on matte black ACP tray. Exceptional visibility day & night.

✨ *4. Industrial CNC Channel Letter Bending Machine*
Automated dual-slotting & bending machinery for precision letter fabrication.

We invite you to inspect live material samples at our workshop:
📍 ${settings.companyAddress}

Looking forward to collaborating on your signage project!

*${agentName}* | *${companyName}*
📞 ${contact}`;
    } else if (template === 'machinery') {
      msg = `Hello ${clientName},

Greetings from *${companyName}* — Machinery Division.

Here are the specifications for our *CNC Automatic Channel Letter Bending Machine Pro-3000*:

🔧 *TECHNICAL SPECIFICATIONS:*
• Supported Materials: Stainless Steel (0.6-1.0mm), Aluminum Coils (0.6-1.5mm), GI Coils.
• Slotting: Dual mechanism with diamond milling cutter + high-speed planer.
• Bending System: Heavy-duty servo-driven mechanical bending arm.
• Software: Easy DXF / PLT vector import with kerf compensation.
• Operating Air Pressure: 0.6 - 0.8 MPa.
• Price: ₹3,85,000 (Includes software, training & tooling).

Ready stock available at our facility for live demonstration.

*${agentName}* | *${companyName}*
📞 ${contact}`;
    } else {
      // Short / Greeting
      msg = `Hello ${clientName},

Thank you for speaking with me today regarding your signage requirement.

Greetings from *${companyName}*!
We specialize in 3D acrylic letters, stainless steel signage, ACP boards, and letter bending machinery.

📍 *Our Workshop & Facility:*
${settings.companyAddress}

📞 Direct Helpline: ${contact}
✉️ Email: ${settings.email}

Please let me know your convenient time for a quick site survey or drawing review.

Warm regards,
*${agentName}*`;
    }

    setCustomMessage(msg);
  }, [template, targetLead, includeRates, includeAddress, includeWarranty, includeGSTIN, includeBank, settings]);

  if (activeModal !== 'share_details') return null;

  // Clean phone number for WhatsApp wa.me link
  const rawPhone = targetLead ? targetLead.contactNumber : '';
  const rawDigits = rawPhone.replace(/\D/g, '');
  const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setHasCopied(true);
    showToast('Details pack copied to clipboard!', 'info');
    setTimeout(() => setHasCopied(false), 3000);
  };

  const handleDownloadBrochurePDF = () => {
    const doc = generateCompanyProfilePDF(settings, portfolioItems, rateCardItems);
    const fileName = `${settings.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Company_Profile_Rates.pdf`;
    doc.save(fileName);
    showToast('Downloaded Company Profile & Rate Card PDF brochure!', 'success');
  };

  const handleOpenWhatsApp = () => {
    // Open in WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Automatically record activity for this lead
    if (targetLead) {
      addActivityNote(
        targetLead.id,
        `Shared Company Details, Portfolio & Rate Card Pack with customer on WhatsApp (${template.toUpperCase()} template).`
      );
      showToast(`Logged activity: Details pack shared with ${targetLead.businessName}.`, 'success');
    }
  };

  const handleCopyPhotoDetails = (item: PortfolioItem) => {
    const photoText = `📸 *${item.title}* (${item.category})
${item.description}
💰 Indicative Rate: ${item.indicativePrice}
⏱️ Lead Time: ${item.leadTime}
• Specs: ${item.specifications.join(', ')}`;

    navigator.clipboard.writeText(photoText);
    showToast(`Copied details for "${item.title}"!`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 animate-in fade-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Direct Share: Company Portfolio, Photos & Rates</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Ready Customer Pitch
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Instantly dispatch photos, indicative pricing, company profile, and workshop location to customer
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Selector & Template Picker */}
        <div className="pt-3 pb-3 border-b border-slate-100 shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Target Lead Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Customer / Lead</label>
            <select
              value={targetLead?.id || ''}
              onChange={(e) => {
                const found = leads.find((l) => l.id === e.target.value);
                if (found) setTargetLead(found);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.businessName} ({l.contactNumber}) — {l.area}
                </option>
              ))}
            </select>
          </div>

          {/* Template Format Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Message Content Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateType)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold"
            >
              <option value="full">Complete Pitch Pack (Portfolio + Rates + Intro + Address)</option>
              <option value="ratecard">Indicative Rate Card & Pricing Sheet Only</option>
              <option value="portfolio">Project Photos & Craftsmanship Showcase</option>
              <option value="machinery">Signage Machinery (CNC Bender & Laser Specs)</option>
              <option value="short">Quick Greeting & Workshop Address</option>
            </select>
          </div>
        </div>

        {/* View Tabs: Message / Photos / Rates */}
        <div className="flex items-center gap-2 pt-2 border-b border-slate-100 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('message')}
            className={`px-3 py-1.5 font-semibold border-b-2 -mb-px flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'message'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Message Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-1.5 font-semibold border-b-2 -mb-px flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'photos'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Project Photos ({portfolioItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-3 py-1.5 font-semibold border-b-2 -mb-px flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'rates'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Indicative Rate Card Table</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
          {activeTab === 'message' && (
            <div className="space-y-3">
              {/* Customization Toggles Strip */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center gap-4 text-[11px]">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" /> Options:
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeRates}
                    onChange={(e) => setIncludeRates(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Include Rate Card</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeWarranty}
                    onChange={(e) => setIncludeWarranty(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Include 3-Year Warranty</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeAddress}
                    onChange={(e) => setIncludeAddress(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Include Workshop Location</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeGSTIN}
                    onChange={(e) => setIncludeGSTIN(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Include GSTIN</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeBank}
                    onChange={(e) => setIncludeBank(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>Include Bank / UPI Advance</span>
                </label>
              </div>

              {/* Editable WhatsApp Text Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Message Text (Editable before sending):</label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{hasCopied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={11}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* Informational Callout */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-800 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Clicking <strong>Send on WhatsApp</strong> opens a direct chat with {targetLead?.businessName} ({targetLead?.contactNumber}).
                  You can also download the <strong>Company Profile & Rates PDF Brochure</strong> below to attach in the chat!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-slate-500 text-[11px]">
                  High-resolution photos of executed signage projects that demonstrate manufacturing precision:
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between group"
                  >
                    <div className="aspect-4/3 relative bg-slate-100 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 cursor-pointer"
                        onClick={() => setPreviewPhoto(item)}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.specifications.map((spec, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-emerald-700">{item.indicativePrice}</span>
                          <span className="text-slate-400 text-[10px] block">{item.leadTime}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyPhotoDetails(item)}
                          className="px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy details to paste into WhatsApp alongside image"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Caption</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rates' && (
            <div className="space-y-3">
              <div className="text-slate-500 text-[11px]">
                Standard indicative rate card for signage letters, boards, raw materials, and machinery:
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Product / Service</th>
                      <th className="py-2.5 px-3">Specifications</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3 text-right">Indicative Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rateCardItems.map((rc) => (
                      <tr key={rc.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{rc.item}</td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">{rc.spec}</td>
                        <td className="py-2.5 px-3 text-slate-500">{rc.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                          {rc.rate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Download Brochure PDF */}
            <button
              type="button"
              onClick={handleDownloadBrochurePDF}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Download PDF Brochure</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Close
            </button>

            {/* Direct WhatsApp Send */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/25"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/10 bg-black">
              <img
                src={previewPhoto.imageUrl}
                alt={previewPhoto.title}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{previewPhoto.title}</h3>
                <p className="text-xs text-slate-500">{previewPhoto.indicativePrice} · {previewPhoto.leadTime}</p>
              </div>
              <button
                onClick={() => handleCopyPhotoDetails(previewPhoto)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Caption</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
