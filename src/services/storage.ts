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
  ProductCategory,
} from '../types/crm';

const KEYS = {
  LEADS: 'signage_crm_leads',
  ACTIVITIES: 'signage_crm_activities',
  FOLLOWUPS: 'signage_crm_followups',
  QUOTATIONS: 'signage_crm_quotations',
  ATTACHMENTS: 'signage_crm_attachments_meta',
  SETTINGS: 'signage_crm_settings',
  INITIALIZED: 'signage_crm_initialized_v1',
};

export const DEFAULT_SETTINGS: CRMSettings = {
  companyName: 'Apex Signage Solutions & Machinery',
  companyLogo: '',
  companyAddress: 'Plot 42, Industrial Area Phase II, Signage Park, Mumbai, Maharashtra 400072',
  companyContactNumber: '+91 98201 55678',
  salesAgentName: 'Rahul Sharma',
  salesContactNumber: '+91 98201 55678',
  email: 'sales@apexsignage.com',
  gstin: '27AABCA1234F1Z8',
  defaultCurrency: '₹',
  defaultGstRate: 18,
  validityPeriodDays: 15,
  paymentTerms: '50% advance along with confirmed order, 40% before dispatch, 10% after successful installation.',
  termsAndConditions: '1. Quotation valid for 15 days from date of issue.\n2. Taxes as applicable by law.\n3. Electrical supply points at site to be provided by customer.\n4. Design artwork must be approved prior to laser/letter fabrication.\n5. Delivery timeline: 7 to 10 working days from advance receipt and artwork sign-off.',
  quotationPrefix: 'QUO-2026',
  quotationCounter: 104,
};

// Safe JSON parser
function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
    return false;
  }
}

// Leads
export function getStoredLeads(): Lead[] {
  return safeGet<Lead[]>(KEYS.LEADS, []);
}

export function saveStoredLeads(leads: Lead[]): boolean {
  return safeSet(KEYS.LEADS, leads);
}

// Activities
export function getStoredActivities(): ActivityLog[] {
  return safeGet<ActivityLog[]>(KEYS.ACTIVITIES, []);
}

export function saveStoredActivities(activities: ActivityLog[]): boolean {
  return safeSet(KEYS.ACTIVITIES, activities);
}

// Follow-ups
export function getStoredFollowUps(): FollowUp[] {
  return safeGet<FollowUp[]>(KEYS.FOLLOWUPS, []);
}

export function saveStoredFollowUps(followups: FollowUp[]): boolean {
  return safeSet(KEYS.FOLLOWUPS, followups);
}

// Quotations
export function getStoredQuotations(): Quotation[] {
  return safeGet<Quotation[]>(KEYS.QUOTATIONS, []);
}

export function saveStoredQuotations(quotations: Quotation[]): boolean {
  return safeSet(KEYS.QUOTATIONS, quotations);
}

// Attachments metadata
export function getStoredAttachmentMetas(): FileAttachmentMeta[] {
  return safeGet<FileAttachmentMeta[]>(KEYS.ATTACHMENTS, []);
}

export function saveStoredAttachmentMetas(metas: FileAttachmentMeta[]): boolean {
  return safeSet(KEYS.ATTACHMENTS, metas);
}

// Settings
export function getStoredSettings(): CRMSettings {
  return safeGet<CRMSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveStoredSettings(settings: CRMSettings): boolean {
  return safeSet(KEYS.SETTINGS, settings);
}

// Get LocalStorage usage in bytes
export function getLocalStorageUsage(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += (localStorage[key]?.length || 0) * 2; // UTF-16 characters = 2 bytes
    }
  }
  return total;
}

// Initialize clean storage if needed
export function initializeCleanStorage(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(KEYS.LEADS)) {
    saveStoredLeads([]);
  }
  if (!localStorage.getItem(KEYS.ACTIVITIES)) {
    saveStoredActivities([]);
  }
  if (!localStorage.getItem(KEYS.FOLLOWUPS)) {
    saveStoredFollowUps([]);
  }
  if (!localStorage.getItem(KEYS.QUOTATIONS)) {
    saveStoredQuotations([]);
  }
  if (!localStorage.getItem(KEYS.ATTACHMENTS)) {
    saveStoredAttachmentMetas([]);
  }
}

// Sample demo seed data for explicit user request in Settings
export function loadSampleSeedData(): void {

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

  const sampleLeads: Lead[] = [
    {
      id: 'lead_101',
      srNo: 1,
      businessName: 'Skyline Architects & Interiors',
      contactNumber: '+919820011223',
      area: 'Andheri East',
      address: '702, Pinnacle Business Park, Andheri East, Mumbai',
      customerType: 'B2B',
      category: 'Signage Letters & Boards',
      requirement: 'Trimless 3D Frontlit Acrylic Letters for corporate lobby (40 sq.ft)',
      callingStatus: 'Called - Connected',
      customerResponse: 'Required Quotation',
      priority: 'High',
      estimatedValue: 85000,
      notes: 'Wants premium warm white 3000K LED modules and Samsung LEDs. Needs drawing approval.',
      lastContactedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      nextFollowUpAt: `${todayStr}T16:00:00`,
      quotationStatus: 'Prepared',
      quotationId: 'quo_101',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'lead_102',
      srNo: 2,
      businessName: 'Royal Sweets & Bakers',
      contactNumber: '+919819922334',
      area: 'Bandra West',
      address: 'Shop 4, Hill Road, Bandra West, Mumbai',
      customerType: 'B2C',
      category: 'Signage Letters & Boards',
      requirement: 'Liquid Acrylic Letters on Gold Mirror Stainless Steel ACP Board (24x4 ft)',
      callingStatus: 'Called - Connected',
      customerResponse: 'Call Back',
      priority: 'Medium',
      estimatedValue: 120000,
      notes: 'Owner Mr. Jignesh was busy with delivery. Asked to call back sharp at 5 PM today.',
      lastContactedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      nextFollowUpAt: `${todayStr}T17:00:00`,
      quotationStatus: 'Not Needed',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'lead_103',
      srNo: 3,
      businessName: 'Metropolis Sign Fabricators',
      contactNumber: '+919833445566',
      area: 'Bhiwandi',
      address: 'Shed 12, Prithvi Complex, Bhiwandi, Thane',
      customerType: 'B2B',
      category: 'Signage Machinery',
      requirement: 'Automatic CNC Channel Letter Bending Machine (Aluminum & SS coils)',
      callingStatus: 'Called - Connected',
      customerResponse: 'Required Quotation',
      priority: 'High',
      estimatedValue: 450000,
      notes: 'Wants demo on flanged and trimless profiles. Inquired about delivery lead time.',
      lastContactedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      nextFollowUpAt: `${tomorrowStr}T11:30:00`,
      quotationStatus: 'Shared',
      quotationId: 'quo_102',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'lead_104',
      srNo: 4,
      businessName: 'Dr. Mehta Eye Care Hospital',
      contactNumber: '+919766554433',
      area: 'Dadar',
      address: '1st Floor, Sunshine Tower, Senapati Bapat Marg, Dadar',
      customerType: 'B2C',
      category: 'Signage Letters & Boards',
      requirement: 'SS Backlit Letters with Blue Halo effect (Hospital facade 30 ft)',
      callingStatus: 'Called - Connected',
      customerResponse: 'Won',
      priority: 'High',
      estimatedValue: 165000,
      notes: 'Quotation approved! 50% advance received. Sent vector files to production.',
      lastContactedAt: new Date(Date.now() - 3600000 * 26).toISOString(),
      nextFollowUpAt: null,
      quotationStatus: 'Accepted',
      quotationId: 'quo_103',
      wonAt: yesterdayStr,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: yesterdayStr,
    },
    {
      id: 'lead_105',
      srNo: 5,
      businessName: 'Vanguard Realty & Infra',
      contactNumber: '+919920887766',
      area: 'Kalyan',
      address: 'Site Office, Vanguard Greens, Gandhar Nagar, Kalyan West',
      customerType: 'B2B',
      category: 'Branding & Fabrication',
      requirement: 'Site hoarding glow sign boards + 3D entrance logo structure',
      callingStatus: 'Called - Connected',
      customerResponse: 'Interested — Details Pending',
      priority: 'Medium',
      estimatedValue: 240000,
      notes: 'Site measurements are scheduled for this Thursday. CAD drawings will be emailed.',
      lastContactedAt: yesterdayStr,
      nextFollowUpAt: `${tomorrowStr}T14:00:00`,
      quotationStatus: 'Design Pending',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: yesterdayStr,
    },
    {
      id: 'lead_106',
      srNo: 6,
      businessName: 'QuickPrint Ads Agency',
      contactNumber: '+919821443322',
      area: 'Lower Parel',
      address: 'CSB 14, Mathuradas Mills Compound, Lower Parel',
      customerType: 'B2B',
      category: 'Signage Materials',
      requirement: 'Wholesale Cast Acrylic Sheets (3mm & 5mm Opal White, 50 sheets) + LED rolls',
      callingStatus: 'Called - Connected',
      customerResponse: 'Yes, Required',
      priority: 'Medium',
      estimatedValue: 95000,
      notes: 'Looking for continuous monthly supply. Sent rate card for cast sheets.',
      lastContactedAt: todayStr,
      nextFollowUpAt: `${nextWeekStr}T11:00:00`,
      quotationStatus: 'Quotation Required',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: todayStr,
    },
    {
      id: 'lead_107',
      srNo: 7,
      businessName: 'Ambika Jewellery Studio',
      contactNumber: '+919820551100',
      area: 'Zaveri Bazaar',
      address: '22, Mumbadevi Road, Zaveri Bazaar, Kalbadevi',
      customerType: 'B2C',
      category: 'Signage Letters & Boards',
      requirement: 'Rose Gold Titanium Coated Stainless Steel Letters with acrylic base',
      callingStatus: 'Called - No Answer',
      customerResponse: 'No Answer',
      priority: 'Low',
      estimatedValue: 70000,
      notes: 'Called twice, no response. Will re-attempt tomorrow morning.',
      lastContactedAt: todayStr,
      nextFollowUpAt: `${tomorrowStr}T10:30:00`,
      quotationStatus: 'Not Needed',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: todayStr,
    },
    {
      id: 'lead_108',
      srNo: 8,
      businessName: 'Zenith Retail Outlets',
      contactNumber: '+919867009988',
      area: 'Thane West',
      address: 'G-12, Viviana Mall, Eastern Express Highway, Thane',
      customerType: 'B2B',
      category: 'Signage Letters & Boards',
      requirement: 'Trimcap 3D LED Letters for 5 retail outlet branches',
      callingStatus: 'Called - Connected',
      customerResponse: 'Lost',
      priority: 'Low',
      estimatedValue: 310000,
      notes: 'Customer opted for a local vendor who quoted 25% lower without warranty.',
      lastContactedAt: yesterdayStr,
      nextFollowUpAt: null,
      quotationStatus: 'Rejected',
      lostAt: yesterdayStr,
      lostReason: 'Price difference - competitor offered cheaper unbranded modules.',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: yesterdayStr,
    },
  ];

  const sampleQuotations: Quotation[] = [
    {
      id: 'quo_101',
      quotationNumber: 'QUO-2026-0101',
      version: 1,
      leadId: 'lead_101',
      businessName: 'Skyline Architects & Interiors',
      contactNumber: '+919820011223',
      billingAddress: '702, Pinnacle Business Park, Andheri East, Mumbai',
      projectAddress: 'Corporate Lobby, Floor 1, Tower B, Andheri East',
      requirement: 'Trimless 3D Frontlit Acrylic Letters for corporate lobby',
      date: todayStr,
      validityDays: 15,
      validityDate: nextWeekStr,
      preparedBy: 'Rahul Sharma',
      status: 'Prepared',
      items: [
        {
          id: 'item_1',
          productName: 'Trimless 3D Acrylic Frontlit Letters',
          description: 'High-grade cast acrylic face with seamless aluminum profile return, 60mm depth.',
          letterType: 'Trimless 3D Acrylic',
          dimensions: 'Height: 12 inches, Total Length: 18 ft',
          unit: 'Running Ft',
          quantity: 18,
          material: 'Cast Acrylic + Powder Coated Aluminium',
          lightingType: 'Samsung High-Lumen 2835 LED 3000K Warm White',
          fabricationDetails: 'Precision CNC routing, seamless bending',
          installationCharges: 5000,
          unitPrice: 3800,
          discountPercent: 5,
          taxRate: 18,
          lineTotal: 69920,
        },
        {
          id: 'item_2',
          productName: 'Waterproof Power Supply 12V 400W',
          description: 'Rainproof ultra-slim SMPS power converter with surge protection.',
          unit: 'Pieces',
          quantity: 2,
          installationCharges: 0,
          unitPrice: 2800,
          discountPercent: 0,
          taxRate: 18,
          lineTotal: 5600,
        },
      ],
      subtotal: 75520,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 75520,
      gstRate: 18,
      gstAmount: 13593.6,
      additionalCharges: 2500,
      additionalChargesDescription: 'On-site scaffolding & night installation access',
      grandTotal: 91614,
      paymentTerms: '50% advance, balance upon installation sign-off',
      termsAndConditions: DEFAULT_SETTINGS.termsAndConditions,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'quo_102',
      quotationNumber: 'QUO-2026-0102',
      version: 1,
      leadId: 'lead_103',
      businessName: 'Metropolis Sign Fabricators',
      contactNumber: '+919833445566',
      billingAddress: 'Shed 12, Prithvi Complex, Bhiwandi, Thane',
      projectAddress: 'Metropolis Workshop, Bhiwandi',
      requirement: 'Automatic CNC Channel Letter Bending Machine',
      date: yesterdayStr,
      validityDays: 15,
      validityDate: nextWeekStr,
      preparedBy: 'Rahul Sharma',
      status: 'Shared',
      items: [
        {
          id: 'item_102_1',
          productName: 'CNC Automatic Channel Letter Bending Machine Pro-3000',
          description: 'Dual-slotting & bending system supporting stainless steel (0.6-1.0mm) and aluminium profiles (0.6-1.5mm). Servo-driven with heavy-duty cutter.',
          unit: 'Sets',
          quantity: 1,
          material: 'Cast Iron Frame + High Speed Tool Steel Blade',
          installationCharges: 15000,
          unitPrice: 385000,
          discountPercent: 2,
          taxRate: 18,
          lineTotal: 392300,
        },
      ],
      subtotal: 392300,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 392300,
      gstRate: 18,
      gstAmount: 70614,
      additionalCharges: 8000,
      additionalChargesDescription: 'Wooden crating & insured transit to Bhiwandi',
      grandTotal: 470914,
      paymentTerms: '40% booking, 50% before dispatch, 10% after commissioning',
      termsAndConditions: DEFAULT_SETTINGS.termsAndConditions,
      sharedAt: yesterdayStr,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'quo_103',
      quotationNumber: 'QUO-2026-0103',
      version: 1,
      leadId: 'lead_104',
      businessName: 'Dr. Mehta Eye Care Hospital',
      contactNumber: '+919766554433',
      billingAddress: '1st Floor, Sunshine Tower, Senapati Bapat Marg, Dadar',
      projectAddress: 'Facade Building Frontage, Sunshine Tower, Dadar',
      requirement: 'SS Backlit Letters with Blue Halo effect',
      date: yesterdayStr,
      validityDays: 15,
      validityDate: nextWeekStr,
      preparedBy: 'Rahul Sharma',
      status: 'Accepted',
      items: [
        {
          id: 'item_103_1',
          productName: 'Stainless Steel 304 Grade Backlit Halo Letters',
          description: 'Laser-cut SS 304 with titanium hairline finish, 12mm clear acrylic backing, IP67 blue LEDs.',
          letterType: 'Stainless Steel Backlit',
          dimensions: 'Height: 18 inches, 14 characters',
          unit: 'Pieces',
          quantity: 14,
          material: 'SS 304 Hairline Finish + 12mm Cast Acrylic',
          lightingType: 'IP67 Royal Blue Halo Backlit LED Modules',
          installationCharges: 12000,
          unitPrice: 8500,
          discountPercent: 0,
          taxRate: 18,
          lineTotal: 131000,
        },
      ],
      subtotal: 131000,
      discountPercent: 0,
      discountAmount: 0,
      taxableAmount: 131000,
      gstRate: 18,
      gstAmount: 23580,
      additionalCharges: 4000,
      additionalChargesDescription: 'Boom lift hydraulic cherry picker charge',
      grandTotal: 158580,
      paymentTerms: '50% advance, 50% upon handover',
      termsAndConditions: DEFAULT_SETTINGS.termsAndConditions,
      sharedAt: yesterdayStr,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: yesterdayStr,
    },
  ];

  const sampleFollowUps: FollowUp[] = [
    {
      id: 'fup_1',
      leadId: 'lead_101',
      leadBusinessName: 'Skyline Architects & Interiors',
      leadContactNumber: '+919820011223',
      scheduledAt: `${todayStr}T16:00:00`,
      action: 'Confirm quotation receipt & schedule client drawing sign-off',
      notes: 'Architect wanted to review LED lumen rating and sample warm white shade.',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'fup_2',
      leadId: 'lead_102',
      leadBusinessName: 'Royal Sweets & Bakers',
      leadContactNumber: '+919819922334',
      scheduledAt: `${todayStr}T17:00:00`,
      action: 'Call back shop owner regarding Gold SS Liquid letter board',
      notes: 'Customer specifically said to call between 5 PM and 6 PM.',
      status: 'pending',
      createdAt: todayStr,
    },
    {
      id: 'fup_3',
      leadId: 'lead_103',
      leadBusinessName: 'Metropolis Sign Fabricators',
      leadContactNumber: '+919833445566',
      scheduledAt: `${tomorrowStr}T11:30:00`,
      action: 'Follow up on CNC channel letter bending machine quotation',
      notes: 'Provide video demo link of aluminium coil auto-flanging.',
      status: 'pending',
      createdAt: yesterdayStr,
    },
    {
      id: 'fup_4',
      leadId: 'lead_105',
      leadBusinessName: 'Vanguard Realty & Infra',
      leadContactNumber: '+919920887766',
      scheduledAt: `${tomorrowStr}T14:00:00`,
      action: 'Obtain site dimensions for hoarding boards',
      notes: 'Site supervisor will provide final column clearances.',
      status: 'pending',
      createdAt: yesterdayStr,
    },
  ];

  const sampleActivities: ActivityLog[] = [
    {
      id: 'act_1',
      leadId: 'lead_101',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'quotation_created',
      title: 'Quotation QUO-2026-0101 Generated',
      summary: 'Prepared quotation for 18 R.Ft Trimless Frontlit Acrylic letters totaling ₹91,614.',
      response: 'Required Quotation',
    },
    {
      id: 'act_2',
      leadId: 'lead_102',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      type: 'call',
      title: 'Phone Call Connected',
      summary: 'Spoke with Mr. Jignesh. Discussed Gold SS Liquid letters. Requested callback at 5:00 PM today.',
      response: 'Call Back',
      followUpDate: `${todayStr}T17:00:00`,
    },
    {
      id: 'act_3',
      leadId: 'lead_103',
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      type: 'quotation_shared',
      title: 'Quotation QUO-2026-0102 Shared',
      summary: 'Sent detailed specifications & machinery quote of ₹4,70,914 via WhatsApp.',
      response: 'Required Quotation',
    },
    {
      id: 'act_4',
      leadId: 'lead_104',
      timestamp: yesterdayStr,
      type: 'quotation_accepted',
      title: 'Quotation Accepted - Deal Won',
      summary: 'Customer approved quotation QUO-2026-0103. ₹80,000 token advance received.',
      response: 'Won',
    },
  ];

  saveStoredLeads(sampleLeads);
  saveStoredQuotations(sampleQuotations);
  saveStoredFollowUps(sampleFollowUps);
  saveStoredActivities(sampleActivities);
  saveStoredSettings(DEFAULT_SETTINGS);
  localStorage.setItem(KEYS.INITIALIZED, 'true');
}

export function resetAllCRMData(): void {
  if (typeof window === 'undefined') return;
  saveStoredLeads([]);
  saveStoredActivities([]);
  saveStoredFollowUps([]);
  saveStoredQuotations([]);
  saveStoredAttachmentMetas([]);
  saveStoredSettings(DEFAULT_SETTINGS);
  localStorage.setItem(KEYS.INITIALIZED, 'clean');
}

