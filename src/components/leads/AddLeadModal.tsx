import React, { useState } from 'react';
import { X, Building2, Phone, MapPin, Tag, Calendar, IndianRupee, FileText } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CustomerType, ProductCategory, Priority, CallingStatus, CustomerResponse } from '../../types/crm';
import { formatPhoneNumber } from '../../services/excel';

export const AddLeadModal: React.FC = () => {
  const { activeModal, closeModal, createLead } = useCRM();

  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('B2B');
  const [category, setCategory] = useState<ProductCategory>('Signage Letters & Boards');
  const [requirement, setRequirement] = useState('');
  const [callingStatus, setCallingStatus] = useState<CallingStatus>('Not Called');
  const [customerResponse, setCustomerResponse] = useState<CustomerResponse>('Follow-up Required');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [estimatedValue, setEstimatedValue] = useState<string>('50000');
  const [nextFollowUpAt, setNextFollowUpAt] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ businessName?: string; contactNumber?: string }>({});

  if (activeModal !== 'add_lead') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { businessName?: string; contactNumber?: string } = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Business or customer name is required.';
    }
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact phone number is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createLead({
      srNo: Date.now().toString().slice(-4),
      businessName: businessName.trim(),
      contactNumber: formatPhoneNumber(contactNumber.trim()),
      area: area.trim() || 'Local',
      address: address.trim(),
      customerType,
      category,
      requirement: requirement.trim() || 'Custom signage requirement',
      callingStatus,
      customerResponse,
      priority,
      estimatedValue: Number(estimatedValue) || 0,
      notes: notes.trim(),
      lastContactedAt: callingStatus !== 'Not Called' ? new Date().toISOString() : null,
      nextFollowUpAt: nextFollowUpAt || null,
      quotationStatus: customerResponse === 'Required Quotation' ? 'Quotation Required' : 'Not Needed',
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Add New Signage Lead</h3>
            <p className="text-xs text-slate-500">Record B2B/B2C prospect with requirements</p>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Business Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business / Customer Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (errors.businessName) setErrors({ ...errors, businessName: undefined });
                  }}
                  placeholder="e.g. Apex Studio, Dr. Mehta Clinic"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.businessName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.businessName && (
                <p className="text-rose-600 text-[11px] mt-1">{errors.businessName}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    if (errors.contactNumber) setErrors({ ...errors, contactNumber: undefined });
                  }}
                  placeholder="e.g. +91 98200 12345"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    errors.contactNumber ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.contactNumber && (
                <p className="text-rose-600 text-[11px] mt-1">{errors.contactNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Area */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Area / Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Andheri East, Mumbai"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Customer Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Category</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerType('B2B')}
                  className={`py-2 text-center rounded-lg border font-medium cursor-pointer transition-colors ${
                    customerType === 'B2B'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  B2B (Architect, Fabricator)
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType('B2C')}
                  className={`py-2 text-center rounded-lg border font-medium cursor-pointer transition-colors ${
                    customerType === 'B2C'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  B2C (Shop Owner, Retail)
                </button>
              </div>
            </div>
          </div>

          {/* Product Category & Requirement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Signage Letters & Boards">Signage Letters & Boards (3D/Liquid/SS/LED)</option>
                <option value="Signage Materials">Signage Materials (Acrylic, ACP, LED modules)</option>
                <option value="Signage Machinery">Signage Machinery (CNC, Letter Bender, Laser)</option>
                <option value="Branding & Fabrication">Branding & Fabrication Projects</option>
                <option value="Custom Signage / Other">Custom Signage / Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Estimated Value (INR ₹)</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Requirement Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Requirement Details</label>
            <textarea
              rows={2}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="e.g. 18 R.Ft Trimless Frontlit Letters, Samsung LEDs, warm white 3000K, needs artwork approval."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Calling Status & Customer Response */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Calling Status</label>
              <select
                value={callingStatus}
                onChange={(e) => setCallingStatus(e.target.value as CallingStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Not Called">Not Called</option>
                <option value="Called - Connected">Called - Connected</option>
                <option value="Called - No Answer">Called - No Answer</option>
                <option value="Called - Busy">Called - Busy</option>
                <option value="Called - Not Reachable">Called - Not Reachable</option>
                <option value="Callback Scheduled">Callback Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Response</label>
              <select
                value={customerResponse}
                onChange={(e) => setCustomerResponse(e.target.value as CustomerResponse)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Follow-up Required">Follow-up Required</option>
                <option value="Yes, Required">Yes, Required</option>
                <option value="Required Quotation">Required Quotation</option>
                <option value="Call Back">Call Back</option>
                <option value="Interested — Details Pending">Interested — Details Pending</option>
                <option value="No Answer">No Answer</option>
                <option value="Not Required">Not Required</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
          </div>

          {/* Next Follow-up & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Schedule Follow-up</label>
              <input
                type="datetime-local"
                value={nextFollowUpAt}
                onChange={(e) => setNextFollowUpAt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
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

          {/* Full Address & Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Site / Billing Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Shop 4, High Street, Near Station Road"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notes / Special Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes, customer preferences, reference contacts..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
