import { jsPDF } from 'jspdf';
import { Quotation, CRMSettings } from '../types/crm';

// Convert number to Indian currency words
export function numberToIndianWords(num: number): string {
  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    let str = '';
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    } else {
      str += a[n];
    }
    return str;
  }

  let output = '';
  let crore = Math.floor(rounded / 10000000);
  let remainder = rounded % 10000000;
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  let hundred = Math.floor(remainder / 100);
  remainder = remainder % 100;

  if (crore > 0) output += inWords(crore) + 'Crore ';
  if (lakh > 0) output += inWords(lakh) + 'Lakh ';
  if (thousand > 0) output += inWords(thousand) + 'Thousand ';
  if (hundred > 0) output += inWords(hundred) + 'Hundred ';
  if (remainder > 0) {
    if (output !== '') output += 'and ';
    output += inWords(remainder);
  }

  return (output.trim() + ' Rupees Only').replace(/\s+/g, ' ');
}

export function generateQuotationPDF(quotation: Quotation, settings: CRMSettings): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  let y = margin;

  // Header Background Bar (Navy / Slate Blue)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, pageWidth - margin * 2, 24, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'Apex Signage Solutions', margin + 6, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${settings.companyAddress} | Ph: ${settings.companyContactNumber}`, margin + 6, y + 14);
  doc.text(`GSTIN: ${settings.gstin} | Email: ${settings.email}`, margin + 6, y + 19);

  // Right side of Header Banner
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION', pageWidth - margin - 6, y + 10, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`# ${quotation.quotationNumber} (v${quotation.version})`, pageWidth - margin - 6, y + 17, { align: 'right' });

  y += 28;

  // Metadata Grid: Customer Info & Quotation Meta (2 boxes)
  const boxWidth = (pageWidth - margin * 2 - 4) / 2;
  const boxHeight = 36;

  // Customer Box (Left)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT / BILL TO', margin + 4, y + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.businessName || 'Valued Client', margin + 4, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Phone: ${quotation.contactNumber || 'N/A'}`, margin + 4, y + 18);
  
  const billingLines = doc.splitTextToSize(`Address: ${quotation.billingAddress || 'N/A'}`, boxWidth - 8);
  doc.text(billingLines.slice(0, 2), margin + 4, y + 23);

  if (quotation.projectAddress) {
    const projLine = doc.splitTextToSize(`Site: ${quotation.projectAddress}`, boxWidth - 8);
    doc.text(projLine.slice(0, 1), margin + 4, y + 32);
  }

  // Quote Details Box (Right)
  const rightX = margin + boxWidth + 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('QUOTATION DETAILS', rightX + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Date of Issue:', rightX + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.date, rightX + 36, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.text('Validity Period:', rightX + 4, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(`${quotation.validityDays} Days (Until ${quotation.validityDate})`, rightX + 36, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.text('Prepared By:', rightX + 4, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.preparedBy || settings.salesAgentName || 'Sales Representative', rightX + 36, y + 25);

  doc.setFont('helvetica', 'normal');
  doc.text('Status:', rightX + 4, y + 31);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(quotation.status.toUpperCase(), rightX + 36, y + 31);

  y += boxHeight + 6;

  // Requirement Banner
  if (quotation.requirement) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1.5, 1.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('REQUIREMENT:', margin + 4, y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(quotation.requirement.slice(0, 100), margin + 34, y + 6.5);
    y += 14;
  }

  // Items Table Header
  const colX = {
    sr: margin,
    desc: margin + 8,
    unit: margin + 84,
    qty: margin + 104,
    rate: margin + 118,
    disc: margin + 138,
    tax: margin + 152,
    total: pageWidth - margin,
  };

  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('#', colX.sr + 2, y + 5);
  doc.text('PRODUCT / SPECIFICATIONS', colX.desc + 2, y + 5);
  doc.text('UNIT', colX.unit + 2, y + 5);
  doc.text('QTY', colX.qty + 2, y + 5);
  doc.text('RATE (INR)', colX.rate + 2, y + 5);
  doc.text('DISC', colX.disc + 2, y + 5);
  doc.text('TAX', colX.tax + 2, y + 5);
  doc.text('TOTAL (INR)', colX.total - 2, y + 5, { align: 'right' });

  y += 7.5;

  // Table Rows
  quotation.items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    const rowHeight = 16;

    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(String(idx + 1), colX.sr + 2, y + 5);

    // Product title
    doc.text(item.productName.slice(0, 48), colX.desc + 2, y + 5);

    // Sub-specifications
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    const specDetails = [
      item.dimensions ? `Dim: ${item.dimensions}` : null,
      item.material ? `Mat: ${item.material}` : null,
      item.lightingType ? `LED: ${item.lightingType}` : null,
      item.installationCharges ? `Installation: +₹${item.installationCharges}` : null,
    ].filter(Boolean).join(' | ');

    doc.text(specDetails.slice(0, 75), colX.desc + 2, y + 9.5);
    if (item.description) {
      doc.text(item.description.slice(0, 80), colX.desc + 2, y + 13.5);
    }

    // Numbers
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.unit || 'Nos', colX.unit + 2, y + 7);
    doc.text(String(item.quantity), colX.qty + 2, y + 7);
    doc.text(Number(item.unitPrice).toLocaleString('en-IN'), colX.rate + 2, y + 7);
    doc.text(item.discountPercent > 0 ? `${item.discountPercent}%` : '-', colX.disc + 2, y + 7);
    doc.text(`${item.taxRate || 18}%`, colX.tax + 2, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text(Number(item.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 }), colX.total - 2, y + 7, { align: 'right' });

    y += rowHeight;
  });

  y += 4;

  // Calculation Breakdown (Right Aligned Box)
  const calcBoxWidth = 84;
  const calcBoxX = pageWidth - margin - calcBoxWidth;
  const calcYStart = y;

  const rows = [
    { label: 'Subtotal Amount:', value: `₹ ${Number(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    ...(quotation.discountAmount > 0
      ? [{ label: `Discount (${quotation.discountPercent}%):`, value: `- ₹ ${Number(quotation.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }]
      : []),
    { label: `GST (${quotation.gstRate}%):`, value: `₹ ${Number(quotation.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
    ...(quotation.additionalCharges > 0
      ? [{ label: `Additional (${quotation.additionalChargesDescription || 'Charges'}):`, value: `₹ ${Number(quotation.additionalCharges).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }]
      : []),
  ];

  rows.forEach((r, idx) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(r.label, calcBoxX, calcYStart + idx * 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(r.value, pageWidth - margin, calcYStart + idx * 5.5, { align: 'right' });
  });

  const totalRowY = calcYStart + rows.length * 5.5 + 2;

  // Grand Total Highlight
  doc.setFillColor(15, 23, 42);
  doc.rect(calcBoxX - 2, totalRowY - 3.5, calcBoxWidth + 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL (INR):', calcBoxX + 2, totalRowY + 1.5);
  doc.text(`₹ ${Number(quotation.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 2, totalRowY + 1.5, { align: 'right' });

  // Amount in Words
  y = totalRowY + 10;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AMOUNT IN WORDS:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(numberToIndianWords(quotation.grandTotal), margin + 32, y);

  y += 6;

  // Payment Terms & T&C
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  const halfWidth = (pageWidth - margin * 2 - 8) / 2;

  // Terms & Conditions
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TERMS & CONDITIONS', margin, y + 2);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const tcLines = doc.splitTextToSize(quotation.termsAndConditions || settings.termsAndConditions || 'Standard signage industry terms apply.', halfWidth);
  doc.text(tcLines.slice(0, 6), margin, y + 6);

  // Payment Terms & Signatory
  const rightTermsX = margin + halfWidth + 8;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT TERMS & SIGN-OFF', rightTermsX, y + 2);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const ptLines = doc.splitTextToSize(quotation.paymentTerms || settings.paymentTerms || 'Payment as agreed.', halfWidth);
  doc.text(ptLines.slice(0, 4), rightTermsX, y + 6);

  // Signature Block
  const sigY = pageHeight - margin - 16;
  doc.setDrawColor(203, 213, 225);
  doc.line(rightTermsX + 20, sigY, pageWidth - margin - 6, sigY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${settings.companyName}`, rightTermsX + 24, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory', rightTermsX + 24, sigY + 8);

  // Footer text
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated quotation generated by Signage Sales CRM.', margin, pageHeight - margin - 4);

  return doc;
}

export function downloadQuotationPDF(quotation: Quotation, settings: CRMSettings): void {
  const doc = generateQuotationPDF(quotation, settings);
  const fileName = `${quotation.quotationNumber}_${quotation.businessName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}
