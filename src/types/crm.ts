export type CustomerType = 'B2B' | 'B2C';

export type CustomerResponse =
  | 'Yes, Required'
  | 'Not Required'
  | 'Call Back'
  | 'Required Quotation'
  | 'Interested — Details Pending'
  | 'Follow-up Required'
  | 'No Answer'
  | 'Busy'
  | 'Not Reachable'
  | 'Wrong Number'
  | 'Already Purchased'
  | 'Won'
  | 'Lost';

export type CallingStatus =
  | 'Not Called'
  | 'Called - Connected'
  | 'Called - No Answer'
  | 'Called - Busy'
  | 'Called - Not Reachable'
  | 'Called - Wrong Number'
  | 'Callback Scheduled';

export type QuotationStatus =
  | 'Not Needed'
  | 'Quotation Required'
  | 'Design Pending'
  | 'Design Received'
  | 'Drafting'
  | 'Prepared'
  | 'Shared'
  | 'Accepted'
  | 'Rejected'
  | 'Revised';

export type ProductCategory =
  | 'Signage Letters & Boards'
  | 'Signage Materials'
  | 'Signage Machinery'
  | 'Branding & Fabrication'
  | 'Custom Signage / Other';

export type Priority = 'High' | 'Medium' | 'Low';

export interface Lead {
  id: string;
  srNo: string | number;
  businessName: string;
  contactNumber: string;
  area: string;
  address: string;
  customerType: CustomerType;
  category: ProductCategory;
  requirement: string;
  callingStatus: CallingStatus;
  customerResponse: CustomerResponse;
  priority: Priority;
  estimatedValue: number;
  notes: string;
  lastContactedAt: string | null; // ISO string
  nextFollowUpAt: string | null; // ISO string
  quotationStatus: QuotationStatus;
  quotationId?: string | null;
  wonAt?: string | null;
  lostAt?: string | null;
  lostReason?: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type ActivityType =
  | 'call'
  | 'response_update'
  | 'followup_created'
  | 'followup_completed'
  | 'followup_rescheduled'
  | 'quotation_created'
  | 'quotation_shared'
  | 'quotation_accepted'
  | 'quotation_rejected'
  | 'file_uploaded'
  | 'lead_created'
  | 'lead_edited'
  | 'note';

export interface DiscussionDetails {
  specifications?: string;
  dimensions?: string;
  quantity?: string;
  materialPreferences?: string;
  lightingPreferences?: string;
  budget?: number;
  nextAction?: string;
}

export interface ActivityLog {
  id: string;
  leadId: string;
  timestamp: string; // ISO string
  type: ActivityType;
  title: string;
  summary: string;
  response?: CustomerResponse | null;
  discussion?: DiscussionDetails;
  followUpDate?: string | null;
  metadata?: Record<string, any>;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadBusinessName: string;
  leadContactNumber: string;
  scheduledAt: string; // ISO string (date or datetime)
  action: string;
  notes: string;
  status: 'pending' | 'completed' | 'rescheduled' | 'cancelled';
  completedAt?: string | null;
  rescheduledTo?: string | null;
  createdAt: string;
}

export interface FileAttachmentMeta {
  id: string;
  leadId: string;
  quotationId?: string;
  fileName: string;
  fileExtension: string;
  fileType: string;
  fileSize: number; // in bytes
  uploadedAt: string; // ISO string
  description?: string;
}

export interface QuotationItem {
  id: string;
  productName: string;
  description: string;
  letterType?: string;
  dimensions?: string;
  unit: string; // 'Pieces' | 'Sq.Ft' | 'Running Ft' | 'Sets' | 'Nos' | 'Custom'
  quantity: number;
  material?: string;
  lightingType?: string;
  fabricationDetails?: string;
  installationCharges: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number; // percentage, e.g. 18
  lineTotal: number;
}

export type QuotationState = 'Draft' | 'Prepared' | 'Shared' | 'Accepted' | 'Rejected' | 'Revised';

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. QUO-2026-0001
  version: number;
  parentQuotationId?: string;
  leadId: string;
  businessName: string;
  contactNumber: string;
  billingAddress: string;
  projectAddress: string;
  requirement: string;
  date: string; // YYYY-MM-DD
  validityDays: number;
  validityDate: string; // YYYY-MM-DD
  preparedBy: string;
  status: QuotationState;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
  additionalCharges: number;
  additionalChargesDescription: string;
  grandTotal: number;
  paymentTerms: string;
  termsAndConditions: string;
  sharedAt?: string | null;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  indicativePrice: string;
  leadTime: string;
  specifications: string[];
}

export interface RateCardItem {
  id: string;
  category: string;
  item: string;
  spec: string;
  rate: string;
  unit: string;
}

export interface CRMSettings {
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyContactNumber: string;
  salesAgentName: string;
  salesContactNumber: string;
  email: string;
  gstin: string;
  defaultCurrency: string; // '₹'
  defaultGstRate: number; // 18
  validityPeriodDays: number; // 15
  paymentTerms: string;
  termsAndConditions: string;
  quotationPrefix: string; // 'QUO'
  quotationCounter: number;
}
