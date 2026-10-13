import * as XLSX from 'xlsx';
import {
  Lead,
  ActivityLog,
  FollowUp,
  Quotation,
  CRMSettings,
  FileAttachmentMeta,
  CallingStatus,
  CustomerResponse,
  QuotationStatus,
  ProductCategory,
} from '../types/crm';

export interface ImportPreviewRow {
  rowNumber: number;
  srNo: string | number;
  businessName: string;
  contactNumber: string;
  normalizedPhone: string;
  area: string;
  address: string;
  callingStatus: CallingStatus;
  customerResponse: CustomerResponse;
  requirement: string;
  quotationStatus: QuotationStatus;
  isValid: boolean;
  validationError?: string;
  isDuplicate: boolean;
  duplicateWithLead?: Lead;
}

export interface ImportParseResult {
  fileName: string;
  totalRows: number;
  validRows: ImportPreviewRow[];
  invalidRows: ImportPreviewRow[];
  duplicateRows: ImportPreviewRow[];
  allRows: ImportPreviewRow[];
}

// Normalize phone number to last 10 digits or digits only for duplicate matching
export function normalizePhoneNumber(phone: string | number | undefined | null): string {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Format phone nicely
export function formatPhoneNumber(phone: string | number | undefined | null): string {
  if (!phone) return '';
  const clean = String(phone).trim();
  if (clean.startsWith('+')) return clean;
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return clean;
}

/**
 * Parses an Excel or CSV file in browser using SheetJS
 */
export async function parseLeadsSpreadsheet(
  file: File,
  existingLeads: Lead[]
): Promise<ImportParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Spreadsheet has no sheets.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  // Map of normalized phone numbers from existing leads
  const existingPhoneMap = new Map<string, Lead>();
  for (const lead of existingLeads) {
    const norm = normalizePhoneNumber(lead.contactNumber);
    if (norm) {
      existingPhoneMap.set(norm, lead);
    }
  }

  const seenInFilePhones = new Set<string>();

  const allRows: ImportPreviewRow[] = [];
  const validRows: ImportPreviewRow[] = [];
  const invalidRows: ImportPreviewRow[] = [];
  const duplicateRows: ImportPreviewRow[] = [];

  rawRows.forEach((raw, index) => {
    const rowNumber = index + 2; // considering 1-indexed and header row 1

    // Flexible column headers
    const findValue = (keys: string[]): any => {
      for (const k of Object.keys(raw)) {
        const cleanK = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const target of keys) {
          if (cleanK === target.toLowerCase().replace(/[^a-z0-9]/g, '')) {
            return raw[k];
          }
        }
      }
      return '';
    };

    const srNo = findValue(['SR No', 'SrNo', 'Serial No', 'S No', 'Sr. No.']) || (index + 1);
    const businessName = String(findValue(['Business Name', 'Company Name', 'Customer Name', 'Client Name', 'Business', 'Company', 'Name']) || '').trim();
    const rawContact = String(findValue(['Contact Number', 'Contact', 'Mobile', 'Phone', 'Phone Number', 'Mobile Number']) || '').trim();
    const area = String(findValue(['Area', 'Location', 'City', 'Region']) || 'Local').trim();
    const address = String(findValue(['Address', 'Full Address', 'Site Address']) || '').trim();
    const callingStatusRaw = String(findValue(['Calling Status', 'Call Status', 'Status']) || 'Not Called').trim();
    const requirement = String(findValue(['Requirement', 'Requirement Details', 'Product Requirement', 'Description']) || 'General Signage Requirement').trim();
    const quotationRaw = String(findValue(['Quotation', 'Quotation Status', 'Quote Status']) || 'Not Needed').trim();

    // Map calling status
    let callingStatus: CallingStatus = 'Not Called';
    if (/connect|spoke|talk/i.test(callingStatusRaw)) callingStatus = 'Called - Connected';
    else if (/no answer|unanswered|missed/i.test(callingStatusRaw)) callingStatus = 'Called - No Answer';
    else if (/busy/i.test(callingStatusRaw)) callingStatus = 'Called - Busy';
    else if (/not reachable/i.test(callingStatusRaw)) callingStatus = 'Called - Not Reachable';
    else if (/wrong/i.test(callingStatusRaw)) callingStatus = 'Called - Wrong Number';
    else if (/callback|scheduled/i.test(callingStatusRaw)) callingStatus = 'Callback Scheduled';

    // Map quotation status
    let quotationStatus: QuotationStatus = 'Not Needed';
    if (/required|needed|send quote/i.test(quotationRaw)) quotationStatus = 'Quotation Required';
    else if (/prepared/i.test(quotationRaw)) quotationStatus = 'Prepared';
    else if (/shared|sent/i.test(quotationRaw)) quotationStatus = 'Shared';
    else if (/accepted|approved/i.test(quotationRaw)) quotationStatus = 'Accepted';

    const normalizedPhone = normalizePhoneNumber(rawContact);

    // Validation
    let isValid = true;
    let validationError: string | undefined;

    if (!businessName) {
      isValid = false;
      validationError = 'Business or customer name is missing.';
    } else if (!rawContact || normalizedPhone.length < 7) {
      isValid = false;
      validationError = 'Contact number is invalid or missing.';
    }

    // Duplicate detection
    const existingLead = normalizedPhone ? existingPhoneMap.get(normalizedPhone) : undefined;
    const isDuplicate = Boolean(existingLead) || seenInFilePhones.has(normalizedPhone);
    if (normalizedPhone) {
      seenInFilePhones.add(normalizedPhone);
    }

    const rowObj: ImportPreviewRow = {
      rowNumber,
      srNo,
      businessName,
      contactNumber: formatPhoneNumber(rawContact),
      normalizedPhone,
      area,
      address,
      callingStatus,
      customerResponse: (callingStatus === 'Called - Connected' ? 'Follow-up Required' : 'No Answer'),
      requirement,
      quotationStatus,
      isValid,
      validationError,
      isDuplicate,
      duplicateWithLead: existingLead,
    };

    allRows.push(rowObj);
    if (!isValid) {
      invalidRows.push(rowObj);
    } else if (isDuplicate) {
      duplicateRows.push(rowObj);
      validRows.push(rowObj); // duplicate can still be imported or updated
    } else {
      validRows.push(rowObj);
    }
  });

  return {
    fileName: file.name,
    totalRows: rawRows.length,
    validRows,
    invalidRows,
    duplicateRows,
    allRows,
  };
}

/**
 * Downloads a blank Excel template for lead uploads
 */
export function downloadLeadTemplate(): void {
  const headers = [
    'SR No',
    'Area',
    'Business Name',
    'Contact Number',
    'Address',
    'Calling Status',
    'Requirement',
    'Quotation',
  ];

  const sampleRows = [
    [
      1,
      'Andheri East',
      'Apex Studio & Decor',
      '+91 98200 12345',
      'Shop 12, Prime Plaza, Andheri East, Mumbai',
      'Not Called',
      'Trimcap 3D LED Letters 24x3 ft for storefront',
      'Quotation Required',
    ],
    [
      2,
      'Bandra West',
      'Urban Cafe & Roastery',
      '+91 98199 54321',
      'Plot 45, Waterfield Road, Bandra West',
      'Called - Connected',
      'Liquid Acrylic Signboard with Warm LEDs',
      'Not Needed',
    ],
    [
      3,
      'Bhiwandi',
      'Precision Fabricators',
      '+91 98334 67890',
      'Gala 8, National Industrial Estate, Bhiwandi',
      'Not Called',
      'CNC Automatic Channel Letter Bending Machine',
      'Quotation Required',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

  // Set column widths
  ws['!cols'] = [
    { wch: 8 },  // SR No
    { wch: 16 }, // Area
    { wch: 28 }, // Business Name
    { wch: 18 }, // Contact Number
    { wch: 38 }, // Address
    { wch: 18 }, // Calling Status
    { wch: 42 }, // Requirement
    { wch: 18 }, // Quotation
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');
  XLSX.writeFile(wb, 'Signage_Leads_Import_Template.xlsx');
}

/**
 * Exports comprehensive multi-sheet Daily / Period Report workbook (.xlsx)
 */
export function exportDailyReport(
  leads: Lead[],
  activities: ActivityLog[],
  followups: FollowUp[],
  quotations: Quotation[],
  periodLabel: string = 'Daily_Report'
): void {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Daily Summary Sheet
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l => l.callingStatus !== 'Not Called').length;
  const callsToday = activities.filter(a => a.type === 'call' && a.timestamp.startsWith(dateStr)).length;
  const quotationsCount = quotations.length;
  const wonLeads = leads.filter(l => l.customerResponse === 'Won' || l.quotationStatus === 'Accepted');
  const lostLeads = leads.filter(l => l.customerResponse === 'Lost' || l.quotationStatus === 'Rejected');
  const totalQuoteValue = quotations.reduce((sum, q) => sum + (q.grandTotal || 0), 0);
  const totalWonValue = wonLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const summaryData = [
    ['SIGNAGE SALES CRM — PERFORMANCE REPORT', ''],
    ['Generated On', new Date().toLocaleString()],
    ['Report Period', periodLabel],
    ['', ''],
    ['METRIC', 'VALUE'],
    ['Total Registered Leads', totalLeads],
    ['Leads Contacted', contactedLeads],
    ['Contact Rate', totalLeads > 0 ? `${((contactedLeads / totalLeads) * 100).toFixed(1)}%` : '0%'],
    ['Calls Logged Today', callsToday],
    ['Total Quotations Prepared', quotationsCount],
    ['Total Quotations Pipeline Value (INR)', totalQuoteValue],
    ['Won Deals Count', wonLeads.length],
    ['Won Deals Revenue (INR)', totalWonValue],
    ['Lost Deals Count', lostLeads.length],
    ['Follow-ups Pending', followups.filter(f => f.status === 'pending').length],
    ['Follow-ups Completed', followups.filter(f => f.status === 'completed').length],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 34 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Daily Summary');

  // 2. Lead Details Sheet
  const leadRows = leads.map(l => ({
    'Lead ID': l.id,
    'SR No': l.srNo,
    'Business Name': l.businessName,
    'Contact Number': l.contactNumber,
    'Area': l.area,
    'Address': l.address,
    'Customer Type': l.customerType,
    'Category': l.category,
    'Calling Status': l.callingStatus,
    'Customer Response': l.customerResponse,
    'Requirement': l.requirement,
    'Estimated Value (INR)': l.estimatedValue,
    'Quotation Status': l.quotationStatus,
    'Next Follow-up': l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toLocaleString() : 'None',
    'Last Contacted': l.lastContactedAt ? new Date(l.lastContactedAt).toLocaleString() : 'Never',
    'Notes': l.notes,
  }));
  const wsLeads = XLSX.utils.json_to_sheet(leadRows);
  XLSX.utils.book_append_sheet(wb, wsLeads, 'Lead Details');

  // 3. Call History Sheet
  const callRows = activities
    .filter(a => a.type === 'call' || a.response)
    .map(a => {
      const relatedLead = leads.find(l => l.id === a.leadId);
      return {
        'Activity ID': a.id,
        'Timestamp': new Date(a.timestamp).toLocaleString(),
        'Business Name': relatedLead?.businessName || 'Unknown',
        'Contact Number': relatedLead?.contactNumber || '',
        'Customer Response': a.response || 'N/A',
        'Call Summary': a.summary,
        'Follow-up Scheduled': a.followUpDate ? new Date(a.followUpDate).toLocaleString() : 'No',
        'Specifications': a.discussion?.specifications || '',
        'Dimensions': a.discussion?.dimensions || '',
        'Material Preferences': a.discussion?.materialPreferences || '',
        'Lighting Preferences': a.discussion?.lightingPreferences || '',
        'Budget (INR)': a.discussion?.budget || '',
      };
    });
  const wsCalls = XLSX.utils.json_to_sheet(callRows);
  XLSX.utils.book_append_sheet(wb, wsCalls, 'Call History');

  // 4. Follow-ups Sheet
  const followUpRows = followups.map(f => ({
    'Follow-up ID': f.id,
    'Business Name': f.leadBusinessName,
    'Contact Number': f.leadContactNumber,
    'Scheduled Date & Time': new Date(f.scheduledAt).toLocaleString(),
    'Action': f.action,
    'Status': f.status.toUpperCase(),
    'Notes': f.notes,
    'Completed At': f.completedAt ? new Date(f.completedAt).toLocaleString() : '',
  }));
  const wsFollowups = XLSX.utils.json_to_sheet(followUpRows);
  XLSX.utils.book_append_sheet(wb, wsFollowups, 'Follow-ups');

  // 5. Quotations Sheet
  const quoteRows = quotations.map(q => ({
    'Quotation Number': q.quotationNumber,
    'Version': `v${q.version}`,
    'Date': q.date,
    'Validity Date': q.validityDate,
    'Business Name': q.businessName,
    'Contact Number': q.contactNumber,
    'Project Address': q.projectAddress,
    'Status': q.status,
    'Items Count': q.items.length,
    'Subtotal (INR)': q.subtotal,
    'GST Rate (%)': q.gstRate,
    'GST Amount (INR)': q.gstAmount,
    'Additional Charges': q.additionalCharges,
    'Grand Total (INR)': q.grandTotal,
    'Prepared By': q.preparedBy,
  }));
  const wsQuotes = XLSX.utils.json_to_sheet(quoteRows);
  XLSX.utils.book_append_sheet(wb, wsQuotes, 'Quotations');

  // 6. Won and Lost Deals Sheet
  const dealRows = [
    ...wonLeads.map(l => ({
      'Outcome': 'WON',
      'Business Name': l.businessName,
      'Contact Number': l.contactNumber,
      'Area': l.area,
      'Requirement': l.requirement,
      'Deal Value (INR)': l.estimatedValue,
      'Outcome Date': l.wonAt || l.updatedAt,
      'Details / Feedback': l.notes,
    })),
    ...lostLeads.map(l => ({
      'Outcome': 'LOST',
      'Business Name': l.businessName,
      'Contact Number': l.contactNumber,
      'Area': l.area,
      'Requirement': l.requirement,
      'Deal Value (INR)': l.estimatedValue,
      'Outcome Date': l.lostAt || l.updatedAt,
      'Details / Feedback': l.lostReason || l.notes,
    })),
  ];
  const wsDeals = XLSX.utils.json_to_sheet(dealRows);
  XLSX.utils.book_append_sheet(wb, wsDeals, 'Won and Lost Deals');

  // Download workbook
  XLSX.writeFile(wb, `Signage_CRM_Report_${dateStr}.xlsx`);
}

/**
 * Full JSON CRM Backup & Restore
 */
export interface FullBackupPayload {
  version: string;
  exportedAt: string;
  appName: string;
  leads: Lead[];
  activities: ActivityLog[];
  followups: FollowUp[];
  quotations: Quotation[];
  attachmentsMeta: FileAttachmentMeta[];
  settings: CRMSettings;
}

export function exportFullJSONBackup(
  leads: Lead[],
  activities: ActivityLog[],
  followups: FollowUp[],
  quotations: Quotation[],
  attachmentsMeta: FileAttachmentMeta[],
  settings: CRMSettings
): void {
  const payload: FullBackupPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: 'Signage Sales CRM',
    leads,
    activities,
    followups,
    quotations,
    attachmentsMeta,
    settings,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Signage_CRM_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseAndValidateJSONBackup(file: File): Promise<FullBackupPayload> {
  const text = await file.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON file format.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Backup file does not contain valid data object.');
  }

  if (!Array.isArray(data.leads)) {
    throw new Error('Backup file is missing valid leads collection.');
  }

  return {
    version: data.version || '1.0',
    exportedAt: data.exportedAt || new Date().toISOString(),
    appName: data.appName || 'Signage Sales CRM',
    leads: data.leads || [],
    activities: Array.isArray(data.activities) ? data.activities : [],
    followups: Array.isArray(data.followups) ? data.followups : [],
    quotations: Array.isArray(data.quotations) ? data.quotations : [],
    attachmentsMeta: Array.isArray(data.attachmentsMeta) ? data.attachmentsMeta : [],
    settings: data.settings || {},
  };
}
