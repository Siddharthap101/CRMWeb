import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  FileText,
  IndianRupee,
  Share2,
  Download,
  Eye,
  CheckCircle,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Quotation, QuotationItem, CRMSettings } from '../../types/crm';
import { downloadQuotationPDF } from '../../services/pdf';

const PRODUCT_PRESETS = [
  {
    name: 'Trimless 3D Frontlit Acrylic Letters',
    desc: 'High-grade cast acrylic face with seamless aluminum profile return, 60mm depth.',
    unit: 'Running Ft',
    rate: 3800,
    material: 'Cast Acrylic + Powder Coated Aluminium',
    lighting: 'Samsung High-Lumen 2835 LED 3000K/6500K',
  },
  {
    name: 'Trimcap 3D LED Letters',
    desc: 'Acrylic letter face locked with CAB plastic trimcap, aluminum coil return, waterproof back.',
    unit: 'Running Ft',
    rate: 2600,
    material: 'Cast Acrylic + CAB Trimcap + Aluminum Coil',
    lighting: 'IP67 Waterproof Injection LED Modules',
  },
  {
    name: 'Liquid Acrylic Letters on SS Tray',
    desc: 'Photopolymer resin liquid acrylic letters with high gloss finish on stainless steel tray.',
    unit: 'Pieces',
    rate: 4200,
    material: 'UV Liquid Resin Acrylic + SS 304 Tray',
    lighting: 'High-Density Epoxy Sealed LEDs',
  },
  {
    name: 'SS 304 Titanium Hairline Backlit Letters',
    desc: 'Laser-cut 304-grade stainless steel with titanium gold/rose hairline finish, halo blue/warm white glow.',
    unit: 'Pieces',
    rate: 6500,
    material: 'SS 304 Titanium Hairline + Clear Acrylic Spacers',
    lighting: 'IP67 Blue / Warm White Halo LEDs',
  },
  {
    name: 'ACP Signboard with 3D Acrylic Letters',
    desc: 'Heavy-duty 1-inch MS pipe structural frame cladded with 3mm exterior grade ACP sheets.',
    unit: 'Sq.Ft',
    rate: 950,
    material: 'Alstrong / Aludecor 3mm ACP + MS Frame',
    lighting: 'External Spotlights / Internal LED Backing',
  },
  {
    name: 'CNC Automatic Channel Letter Bending Machine',
    desc: 'Servo-driven automatic slotting and bending for aluminum and stainless steel coils.',
    unit: 'Sets',
    rate: 385000,
    material: 'Cast Iron Heavy Duty Chassis',
    lighting: 'None',
  },
  {
    name: 'Laser Cutting Machine 1500W Raycus',
    desc: 'Fiber laser cutting machine with CypCut controller and dual exhaust system.',
    unit: 'Sets',
    rate: 750000,
    material: 'Heavy Gantry & Precision Linear Rails',
    lighting: 'None',
  },
  {
    name: 'Cast Acrylic Sheets (Opal White 3mm, 8x4 ft)',
    desc: 'Wholesale 100% virgin grade cast acrylic sheets with high light diffusion.',
    unit: 'Pieces',
    rate: 4800,
    material: 'Virgin Cast Acrylic',
    lighting: 'None',
  },
];

export const QuotationBuilderModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    selectedLead,
    selectedQuotation,
    settings,
    saveQuotation,
    openModal,
    showToast,
  } = useCRM();

  const [quotationNumber, setQuotationNumber] = useState('');
  const [version, setVersion] = useState(1);
  const [date, setDate] = useState('');
  const [validityDays, setValidityDays] = useState(15);
  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [requirement, setRequirement] = useState('');
  const [preparedBy, setPreparedBy] = useState('');
  const [status, setStatus] = useState<Quotation['status']>('Prepared');

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<string>('0');
  const [additionalChargesDescription, setAdditionalChargesDescription] = useState('Installation & Transport');
  const [paymentTerms, setPaymentTerms] = useState(settings.paymentTerms);
  const [termsAndConditions, setTermsAndConditions] = useState(settings.termsAndConditions);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<string>('0');
  const [gstRate, setGstRate] = useState<number>(settings.defaultGstRate || 18);

  // Initialize form
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedQuotation && activeModal === 'quotation_builder') {
      // Editing existing quotation
      setQuotationNumber(selectedQuotation.quotationNumber);
      setVersion(selectedQuotation.version);
      setDate(selectedQuotation.date);
      setValidityDays(selectedQuotation.validityDays);
      setBusinessName(selectedQuotation.businessName);
      setContactNumber(selectedQuotation.contactNumber);
      setBillingAddress(selectedQuotation.billingAddress);
      setProjectAddress(selectedQuotation.projectAddress);
      setRequirement(selectedQuotation.requirement);
      setPreparedBy(selectedQuotation.preparedBy);
      setStatus(selectedQuotation.status);
      setItems(selectedQuotation.items);
      setAdditionalCharges(String(selectedQuotation.additionalCharges || 0));
      setAdditionalChargesDescription(selectedQuotation.additionalChargesDescription || 'Installation & Transport');
      setPaymentTerms(selectedQuotation.paymentTerms);
      setTermsAndConditions(selectedQuotation.termsAndConditions);
      setOverallDiscountPercent(String(selectedQuotation.discountPercent || 0));
      setGstRate(selectedQuotation.gstRate || 18);
    } else if (activeModal === 'quotation_builder') {
      // Creating new quotation
      const nextNum = `${settings.quotationPrefix}-${String(settings.quotationCounter + 1).padStart(4, '0')}`;
      setQuotationNumber(nextNum);
      setVersion(1);
      setDate(todayStr);
      setValidityDays(settings.validityPeriodDays || 15);
      setBusinessName(selectedLead?.businessName || '');
      setContactNumber(selectedLead?.contactNumber || '');
      setBillingAddress(selectedLead?.address || '');
      setProjectAddress(selectedLead?.address || '');
      setRequirement(selectedLead?.requirement || '');
      setPreparedBy(settings.salesAgentName || 'Sales Representative');
      setStatus('Prepared');
      setAdditionalCharges('0');
      setAdditionalChargesDescription('Installation & Transport');
      setPaymentTerms(settings.paymentTerms);
      setTermsAndConditions(settings.termsAndConditions);
      setOverallDiscountPercent('0');
      setGstRate(settings.defaultGstRate || 18);

      // Default item 1
      setItems([
        {
          id: `item_${Date.now()}`,
          productName: selectedLead?.requirement || 'Custom Signage Letters',
          description: 'High-quality fabrication according to approved drawing specifications.',
          unit: 'Sq.Ft',
          quantity: 1,
          installationCharges: 2500,
          unitPrice: selectedLead?.estimatedValue || 25000,
          discountPercent: 0,
          taxRate: 18,
          lineTotal: (selectedLead?.estimatedValue || 25000) + 2500,
        },
      ]);
    }
  }, [activeModal, selectedQuotation, selectedLead, settings]);

  if (activeModal !== 'quotation_builder') return null;

  // Add Item
  const handleAddItem = (preset?: typeof PRODUCT_PRESETS[0]) => {
    const newItem: QuotationItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      productName: preset ? preset.name : 'New Signage Item',
      description: preset ? preset.desc : '',
      unit: preset ? preset.unit : 'Pieces',
      quantity: 1,
      material: preset ? preset.material : '',
      lightingType: preset ? preset.lighting : '',
      installationCharges: 0,
      unitPrice: preset ? preset.rate : 5000,
      discountPercent: 0,
      taxRate: gstRate,
      lineTotal: preset ? preset.rate : 5000,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<QuotationItem>) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        const price = Number(updated.unitPrice) || 0;
        const qty = Number(updated.quantity) || 1;
        const disc = Number(updated.discountPercent) || 0;
        const inst = Number(updated.installationCharges) || 0;

        const discountedUnit = price * (1 - disc / 100);
        const lineTotal = Math.round(discountedUnit * qty + inst);
        return { ...updated, lineTotal };
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      showToast('A quotation must have at least one line item.', 'error');
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  };

  // Live calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  }, [items]);

  const discountPercentNum = Number(overallDiscountPercent) || 0;
  const discountAmount = Math.round((subtotal * discountPercentNum) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstAmount = Math.round((taxableAmount * (gstRate / 100)));
  const addChargesNum = Number(additionalCharges) || 0;
  const grandTotal = taxableAmount + gstAmount + addChargesNum;

  const validityDate = useMemo(() => {
    const d = new Date(date || Date.now());
    d.setDate(d.getDate() + (validityDays || 15));
    return d.toISOString().split('T')[0];
  }, [date, validityDays]);

  const buildQuotationObject = (): Quotation => {
    const now = new Date().toISOString();
    return {
      id: selectedQuotation ? selectedQuotation.id : `quo_${Date.now()}`,
      quotationNumber,
      version,
      parentQuotationId: selectedQuotation?.parentQuotationId,
      leadId: selectedLead ? selectedLead.id : selectedQuotation?.leadId || 'lead_general',
      businessName,
      contactNumber,
      billingAddress,
      projectAddress,
      requirement,
      date,
      validityDays,
      validityDate,
      preparedBy,
      status,
      items,
      subtotal,
      discountPercent: discountPercentNum,
      discountAmount,
      taxableAmount,
      gstRate,
      gstAmount,
      additionalCharges: addChargesNum,
      additionalChargesDescription,
      grandTotal,
      paymentTerms,
      termsAndConditions,
      createdAt: selectedQuotation ? selectedQuotation.createdAt : now,
      updatedAt: now,
    };
  };

  const handleSaveDraft = () => {
    const quo = buildQuotationObject();
    saveQuotation({ ...quo, status: 'Draft' });
    closeModal();
  };

  const handleSaveAndPreview = () => {
    const quo = buildQuotationObject();
    saveQuotation(quo);
    openModal('quotation_preview', quo);
  };

  const handleSaveAndDownload = () => {
    const quo = buildQuotationObject();
    saveQuotation(quo);
    downloadQuotationPDF(quo, settings);
    showToast(`Downloaded ${quo.quotationNumber} PDF.`, 'success');
    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full p-6 animate-in fade-in zoom-in-95 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                {quotationNumber}
              </span>
              <span className="text-xs text-slate-500 font-medium">(Version {version})</span>
              <h2 className="text-base font-bold text-slate-900">Signage Quotation Builder</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemized estimates with automatic INR totals, GST, and direct PDF generation
            </p>
          </div>

          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Quotation Header & Customer Particulars
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Quotation Number</label>
                <input
                  type="text"
                  value={quotationNumber}
                  onChange={(e) => setQuotationNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md font-mono text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Prepared By</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-200/60">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Customer / Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Project / Site Address</label>
                <input
                  type="text"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  placeholder="e.g. Corporate Lobby, 4th Floor"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Preset Buttons Strip */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Quick Add Signage Presets:</span>
              <span className="text-[11px] text-slate-400">Click to append pre-calculated product row</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddItem(preset)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-blue-600" />
                  <span>{preset.name.split(' ')[0]} {preset.name.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Quotation Line Items ({items.length})
              </span>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Blank Item</span>
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-500 font-mono text-[11px]">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Product / Service Name</label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleUpdateItem(item.id, { productName: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Dimensions (L × H)</label>
                      <input
                        type="text"
                        value={item.dimensions || ''}
                        onChange={(e) => handleUpdateItem(item.id, { dimensions: e.target.value })}
                        placeholder="e.g. 18 in height, 12 ft length"
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Unit</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                      >
                        <option value="Pieces">Pieces</option>
                        <option value="Running Ft">Running Ft</option>
                        <option value="Sq.Ft">Sq.Ft</option>
                        <option value="Sets">Sets</option>
                        <option value="Nos">Nos</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, { quantity: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 tabular-nums font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Rate (₹)</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, { unitPrice: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 tabular-nums font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Disc (%)</label>
                      <input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) => handleUpdateItem(item.id, { discountPercent: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 tabular-nums font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Installation (₹)</label>
                      <input
                        type="number"
                        value={item.installationCharges}
                        onChange={(e) => handleUpdateItem(item.id, { installationCharges: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 tabular-nums font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Line Total</label>
                      <div className="py-1.5 px-2 bg-slate-100 rounded text-slate-900 font-bold tabular-nums text-right font-mono">
                        ₹{item.lineTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <input
                      type="text"
                      value={item.material || ''}
                      onChange={(e) => handleUpdateItem(item.id, { material: e.target.value })}
                      placeholder="Material specs (e.g. Cast Acrylic, 304 SS, CAB trim)"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700"
                    />
                    <input
                      type="text"
                      value={item.lightingType || ''}
                      onChange={(e) => handleUpdateItem(item.id, { lightingType: e.target.value })}
                      placeholder="Lighting (e.g. Samsung 2835 LEDs, 3000K warm white)"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Terms and Conditions */}
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                <textarea
                  rows={2}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-[11px] resize-none"
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900 tabular-nums font-mono">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Discount (%):</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={overallDiscountPercent}
                    onChange={(e) => setOverallDiscountPercent(e.target.value)}
                    className="w-16 px-2 py-1 bg-white border border-slate-200 rounded font-mono tabular-nums text-right text-xs"
                  />
                  <span className="font-bold text-rose-600 tabular-nums font-mono w-24 text-right">
                    - ₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">GST / Tax Rate (%):</span>
                <div className="flex items-center gap-2">
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-xs"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                  <span className="font-bold text-slate-900 tabular-nums font-mono w-24 text-right">
                    + ₹{gstAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                <input
                  type="text"
                  value={additionalChargesDescription}
                  onChange={(e) => setAdditionalChargesDescription(e.target.value)}
                  placeholder="Additional charges"
                  className="w-36 px-2 py-1 bg-white border border-slate-200 rounded text-[11px] text-slate-700"
                />
                <input
                  type="number"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(e.target.value)}
                  className="w-28 px-2 py-1 bg-white border border-slate-200 rounded font-mono tabular-nums text-right text-xs"
                />
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">Grand Total (INR):</span>
                <span className="text-lg font-bold text-blue-700 tabular-nums font-mono">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Save Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndPreview}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndDownload}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save & Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
