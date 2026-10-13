import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Download,
  CheckCircle,
  ExternalLink,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { downloadQuotationPDF } from '../../services/pdf';
import { normalizePhoneNumber } from '../../services/excel';

export const WhatsAppShareModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedQuotation,
    settings,
    updateQuotationStatus,
    showToast,
  } = useCRM();

  const [message, setMessage] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (selectedQuotation) {
      const defaultText = `Hello ${selectedQuotation.businessName},

Greetings from ${settings.companyName}.

As discussed, we have prepared quotation #${selectedQuotation.quotationNumber} for your signage requirement: "${selectedQuotation.requirement || 'Signage Project'}".

Quotation Amount: ₹${Number(selectedQuotation.grandTotal).toLocaleString('en-IN')}

Please review the quotation and let us know if you require any modifications.

Thank you.

${selectedQuotation.preparedBy || settings.salesAgentName}
${settings.companyName}
${settings.companyContactNumber}`;
      setMessage(defaultText);
      setHasCopied(false);
    }
  }, [selectedQuotation, settings]);

  if (activeModal !== 'whatsapp_share' || !selectedQuotation) return null;

  // Clean phone number for WhatsApp wa.me link
  const rawDigits = (selectedQuotation.contactNumber || '').replace(/\D/g, '');
  const cleanPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setHasCopied(true);
    showToast('Message text copied to clipboard!', 'info');
    setTimeout(() => setHasCopied(false), 3000);
  };

  const handleDownloadPDF = () => {
    downloadQuotationPDF(selectedQuotation, settings);
    showToast(`Downloaded quotation PDF. You can now attach it in WhatsApp!`, 'success');
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmShared = () => {
    updateQuotationStatus(selectedQuotation.id, 'Shared', 'Shared with customer via WhatsApp');
    showToast(`Quotation #${selectedQuotation.quotationNumber} marked as Shared!`, 'success');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Share Quotation via WhatsApp</h3>
              <p className="text-xs text-slate-500">
                Send to: {selectedQuotation.businessName} ({selectedQuotation.contactNumber})
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Important Notice on Local PDF Attachments */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Attaching Quotation PDF:</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Standard web security prevents websites from automatically attaching local files into WhatsApp.
              Please <strong>Download the PDF</strong> below, then click <strong>Open WhatsApp</strong> and attach the PDF file into your chat.
            </p>
          </div>

          {/* Download PDF Shortcut Button */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <div className="font-bold text-slate-900">1. Download Quotation PDF</div>
              <div className="text-[11px] text-slate-500 font-mono">
                {selectedQuotation.quotationNumber}.pdf (Grand Total: ₹{selectedQuotation.grandTotal.toLocaleString('en-IN')})
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-3.5 py-1.5 font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Editable WhatsApp Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">2. Review / Customize WhatsApp Message:</label>
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
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Open WhatsApp Trigger */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-bold text-emerald-900">3. Send to Customer Phone</div>
              <div className="text-[11px] text-emerald-700">Opens WhatsApp app or web interface with prefilled message</div>
            </div>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open WhatsApp</span>
            </button>
          </div>

          {/* Step 4: Mark As Shared Confirmation */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">Once sent, mark status as Shared:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShared}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as Shared</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
