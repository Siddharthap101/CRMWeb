import React from 'react';
import { X, Download, Share2, Printer, CheckCircle, IndianRupee } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { downloadQuotationPDF, numberToIndianWords } from '../../services/pdf';

export const QuotationPreviewModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedQuotation,
    settings,
    openModal,
    showToast,
  } = useCRM();

  if (activeModal !== 'quotation_preview' || !selectedQuotation) return null;

  const handleDownload = () => {
    downloadQuotationPDF(selectedQuotation, settings);
    showToast(`Downloaded quotation ${selectedQuotation.quotationNumber}.pdf`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    openModal('whatsapp_share', selectedQuotation);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 animate-in fade-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        {/* Header toolbar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {selectedQuotation.quotationNumber}
            </span>
            <span className="text-xs text-slate-500 font-medium">Preview Document</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={closeModal}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Paper Layout */}
        <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-8 bg-slate-100/60 rounded-xl my-4 text-xs font-sans">
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
            {/* Header Box */}
            <div className="bg-slate-900 text-white p-5 rounded-lg flex items-start justify-between">
              <div>
                <h1 className="text-base font-bold tracking-tight">{settings.companyName}</h1>
                <p className="text-[11px] text-slate-300 mt-1 max-w-sm leading-relaxed">
                  {settings.companyAddress}
                </p>
                <div className="text-[11px] text-slate-400 mt-1 space-x-3">
                  <span>Phone: {settings.companyContactNumber}</span>
                  <span>GSTIN: {settings.gstin}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black tracking-wider text-blue-400">QUOTATION</span>
                <div className="font-mono text-xs font-semibold mt-1">
                  #{selectedQuotation.quotationNumber}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Version {selectedQuotation.version}
                </div>
              </div>
            </div>

            {/* Client & Quotation Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Client / Bill To:
                </span>
                <div className="font-bold text-slate-900 text-sm">{selectedQuotation.businessName}</div>
                <div className="text-slate-600 mt-0.5">{selectedQuotation.billingAddress}</div>
                <div className="font-mono text-slate-700 mt-1 font-medium">
                  Ph: {selectedQuotation.contactNumber}
                </div>
                {selectedQuotation.projectAddress && (
                  <div className="text-[11px] text-slate-500 mt-1">
                    Site: {selectedQuotation.projectAddress}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Quotation Meta:
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedQuotation.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedQuotation.validityDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prepared By:</span>
                  <span className="font-medium text-slate-800">{selectedQuotation.preparedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-slate-900">{selectedQuotation.status}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800 text-white text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Product / Specifications</th>
                    <th className="py-2.5 px-2">Unit</th>
                    <th className="py-2.5 px-2 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedQuotation.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {[
                            item.dimensions ? `Dim: ${item.dimensions}` : null,
                            item.material ? `Mat: ${item.material}` : null,
                            item.lightingType ? `LED: ${item.lightingType}` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                        {item.description && (
                          <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">{item.unit}</td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Amount:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    ₹{selectedQuotation.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedQuotation.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount ({selectedQuotation.discountPercent}%):</span>
                    <span className="font-mono tabular-nums font-semibold">
                      - ₹{selectedQuotation.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>GST ({selectedQuotation.gstRate}%):</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    + ₹{selectedQuotation.gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedQuotation.additionalCharges > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Additional Charges:</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      + ₹{selectedQuotation.additionalCharges.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="p-2.5 bg-slate-900 text-white rounded flex justify-between items-center text-sm font-bold">
                  <span>Grand Total (INR):</span>
                  <span className="font-mono tabular-nums text-blue-400">
                    ₹{selectedQuotation.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 text-right pt-1 font-medium">
                  {numberToIndianWords(selectedQuotation.grandTotal)}
                </div>
              </div>
            </div>

            {/* Terms and Payment */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-[11px]">
              <div>
                <span className="font-bold text-slate-800 uppercase block mb-1">Terms & Conditions</span>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                  {selectedQuotation.termsAndConditions}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase block mb-1">Payment Terms</span>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                  {selectedQuotation.paymentTerms}
                </p>

                <div className="mt-8 pt-4 border-t border-slate-300 text-center">
                  <div className="font-bold text-slate-900">For {settings.companyName}</div>
                  <div className="text-slate-400 text-[10px]">Authorized Signatory</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
