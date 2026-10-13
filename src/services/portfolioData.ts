import { PortfolioItem, RateCardItem, CRMSettings } from '../types/crm';
import { jsPDF } from 'jspdf';

export const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port_1',
    title: '3D Frontlit Acrylic Channel Letters',
    category: '3D Letters & Boards',
    description: 'Precision laser-cut cast acrylic letters with seamless return profile, high-lumen 3000K warm white LEDs. Executed for corporate reception & lobby.',
    imageUrl: '/src/assets/images/portfolio_3d_acrylic_letters_1791876148654.jpg',
    indicativePrice: '₹3,200 - ₹4,200 / Running Ft',
    leadTime: '5 to 7 Working Days',
    specifications: [
      'Cast Acrylic 3mm/5mm face',
      'Samsung 2835 IP67 Waterproof LED Modules',
      'Powder-coated aluminum return channel',
      '3-Year LED & Power Supply Warranty',
    ],
  },
  {
    id: 'port_2',
    title: 'Gold Titanium SS 304 Backlit Halo Letters',
    category: 'Stainless Steel Signage',
    description: 'Luxury hairline-finish gold titanium coated grade-304 stainless steel with clear acrylic backing and warm halo backlight glow.',
    imageUrl: '/src/assets/images/portfolio_ss_backlit_letters_1791876149177.jpg',
    indicativePrice: '₹5,500 - ₹7,500 / Piece',
    leadTime: '7 to 10 Working Days',
    specifications: [
      'Grade 304 Stainless Steel (Anti-rust)',
      'Titanium Gold / Rose Gold / Mirror PVD Finish',
      '12mm Cast Acrylic Spacers',
      'High-grade IP68 Halo Backlit Lighting',
    ],
  },
  {
    id: 'port_3',
    title: 'Retail Storefront Liquid Acrylic & ACP Board',
    category: 'Storefront Signboards',
    description: 'High-gloss UV liquid photopolymer resin letters mounted on 3mm exterior matte black ACP cladding tray for retail boutiques.',
    imageUrl: '/src/assets/images/portfolio_retail_glow_signboard_1791876149530.jpg',
    indicativePrice: '₹850 - ₹1,400 / Sq.Ft',
    leadTime: '6 to 8 Working Days',
    specifications: [
      'Solid Liquid Resin Polymer Letters',
      'Alstrong / Aludecor 3mm Exterior ACP Board',
      'Heavy-duty 1" MS Square Pipe Subframe',
      'Uniform edge-to-edge luminescence',
    ],
  },
  {
    id: 'port_4',
    title: 'CNC Automatic Channel Letter Bending Machine',
    category: 'Signage Machinery',
    description: 'Heavy-duty servo-driven bending & slotting system supporting stainless steel (0.6-1.0mm) and aluminum profile coils. Includes complete training & tooling.',
    imageUrl: '/src/assets/images/portfolio_cnc_letter_bending_1791876150737.jpg',
    indicativePrice: '₹3,85,000 / Complete Setup',
    leadTime: 'Ready Stock / 10 Days Dispatch',
    specifications: [
      'Dual slotting: Diamond milling + planer cutter',
      'Automatic coil feeder & high precision servo motor',
      'Supports SS, Aluminum, Copper, Galvanized Iron',
      'Includes software, air compressor & on-site training',
    ],
  },
];

export const DEFAULT_RATE_CARD: RateCardItem[] = [
  { id: 'rc_1', category: '3D Letters', item: 'Trimless 3D Frontlit Acrylic Letters', spec: 'Cast acrylic, aluminum profile, Samsung LEDs', rate: '₹3,800', unit: 'Running Ft' },
  { id: 'rc_2', category: '3D Letters', item: 'Trimcap 3D LED Letters', spec: 'Cast acrylic face, CAB trim, waterproof back', rate: '₹2,600', unit: 'Running Ft' },
  { id: 'rc_3', category: '3D Letters', item: 'Liquid Acrylic Letters on SS Tray', spec: 'UV liquid resin, seamless high gloss face', rate: '₹4,200', unit: 'Piece' },
  { id: 'rc_4', category: 'Stainless Steel', item: 'SS 304 Titanium Gold Backlit Letters', spec: 'Grade 304 laser cut, titanium finish, halo LEDs', rate: '₹6,500', unit: 'Piece' },
  { id: 'rc_5', category: 'Stainless Steel', item: 'SS Frontlit Fabricated Letters', spec: 'SS body with acrylic face, internal LEDs', rate: '₹4,800', unit: 'Piece' },
  { id: 'rc_6', category: 'Signboards', item: 'ACP Cladded Signboard with Acrylic 3D Letters', spec: '3mm exterior ACP, 1" MS frame, 3D acrylic letters', rate: '₹950', unit: 'Sq.Ft' },
  { id: 'rc_7', category: 'Signboards', item: 'Flex Glow Sign Board (Double-Sided)', spec: 'Star flex / Blackout flex, internal LED tubes', rate: '₹380', unit: 'Sq.Ft' },
  { id: 'rc_8', category: 'Materials', item: 'Wholesale Cast Acrylic Sheets 3mm (8x4 ft)', spec: '100% virgin opal white / color sheets', rate: '₹4,800', unit: 'Sheet' },
  { id: 'rc_9', category: 'Materials', item: 'Samsung 2835 1.5W LED Modules (Pack of 100)', spec: 'IP67 waterproof, lens angle 160 deg', rate: '₹2,800', unit: 'Pack' },
  { id: 'rc_10', category: 'Machinery', item: 'CNC Automatic Channel Letter Bender Pro', spec: 'Servo drive, dual slotting, SS & Alu coils', rate: '₹3,85,000', unit: 'Set' },
  { id: 'rc_11', category: 'Machinery', item: '1500W Raycus Fiber Laser Cutting Machine', spec: 'CypCut, dual exhaust, heavy gantry frame', rate: '₹7,50,000', unit: 'Set' },
];

const KEYS = {
  PORTFOLIO: 'signage_crm_portfolio_items',
  RATECARD: 'signage_crm_rate_card',
};

export function getStoredPortfolio(): PortfolioItem[] {
  if (typeof window === 'undefined') return DEFAULT_PORTFOLIO_ITEMS;
  try {
    const raw = localStorage.getItem(KEYS.PORTFOLIO);
    if (!raw) return DEFAULT_PORTFOLIO_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PORTFOLIO_ITEMS;
  } catch {
    return DEFAULT_PORTFOLIO_ITEMS;
  }
}

export function saveStoredPortfolio(items: PortfolioItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.PORTFOLIO, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving portfolio items', err);
  }
}

export function getStoredRateCard(): RateCardItem[] {
  if (typeof window === 'undefined') return DEFAULT_RATE_CARD;
  try {
    const raw = localStorage.getItem(KEYS.RATECARD);
    if (!raw) return DEFAULT_RATE_CARD;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RATE_CARD;
  } catch {
    return DEFAULT_RATE_CARD;
  }
}

export function saveStoredRateCard(items: RateCardItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.RATECARD, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving rate card', err);
  }
}

/**
 * Client-side PDF Company Profile & Indicative Rate Card Brochure
 */
export function generateCompanyProfilePDF(
  settings: CRMSettings,
  portfolioItems: PortfolioItem[],
  rateCardItems: RateCardItem[]
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  let y = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, pageWidth - margin * 2, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName || 'Apex Signage Solutions & Machinery', margin + 6, y + 9);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('MANUFACTURER & SUPPLIER OF SIGNAGE LETTERS, MATERIALS & MACHINERY', margin + 6, y + 16);
  doc.text(`${settings.companyAddress} | Ph: ${settings.companyContactNumber}`, margin + 6, y + 21);

  y += 32;

  // Section: About Us & Capabilities
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPANY PROFILE & CAPABILITIES', margin + 5, y + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'We specialize in precision architectural signage manufacturing for architects, builders, corporate brands, and retail chains.\nOur state-of-the-art facility is equipped with automated CNC letter benders, fiber laser cutters, vacuum acrylic forming, and cleanroom resin liquid letter dispensing. We deliver pan-India with certified installation teams.',
    margin + 5,
    y + 13,
    { maxWidth: pageWidth - margin * 2 - 10, lineHeightFactor: 1.4 }
  );

  y += 34;

  // Section: Indicative Rate Card Table
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCT / SERVICE CATEGORY', margin + 4, y + 4.8);
  doc.text('SPECIFICATIONS', margin + 65, y + 4.8);
  doc.text('INDICATIVE RATE', pageWidth - margin - 35, y + 4.8);
  doc.text('UNIT', pageWidth - margin - 6, y + 4.8, { align: 'right' });

  y += 7;

  rateCardItems.slice(0, 8).forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 8, pageWidth - margin, y + 8);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(item.item.slice(0, 36), margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.spec.slice(0, 45), margin + 65, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(item.rate, pageWidth - margin - 35, y + 5);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(item.unit, pageWidth - margin - 6, y + 5, { align: 'right' });

    y += 8;
  });

  y += 8;

  // Section: Executed Portfolio Project Highlights
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTED PROJECT SHOWCASE & FABRICATION HIGHLIGHTS', margin, y);
  y += 4;

  const boxWidth = (pageWidth - margin * 2 - 4) / 2;
  const boxHeight = 34;

  portfolioItems.slice(0, 4).forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = margin + col * (boxWidth + 4);
    const boxY = y + row * (boxHeight + 4);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setTextColor(37, 99, 235);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(item.category.toUpperCase(), boxX + 4, boxY + 5.5);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(item.title.slice(0, 34), boxX + 4, boxY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.description.slice(0, 110), boxX + 4, boxY + 15.5, { maxWidth: boxWidth - 8, lineHeightFactor: 1.3 });

    doc.setTextColor(16, 185, 129); // emerald-600
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(`Indicative: ${item.indicativePrice}`, boxX + 4, boxY + boxHeight - 4);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`Lead time: ${item.leadTime}`, boxX + boxWidth - 4, boxY + boxHeight - 4, { align: 'right' });
  });

  y += 2 * (boxHeight + 4) + 6;

  // Contact Footer Box
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('HAVE A CUSTOM REQUIREMENT? CONTACT OUR SIGNAGE ADVISOR', margin + 6, y + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Sales Head: ${settings.salesAgentName} (${settings.salesContactNumber}) | Email: ${settings.email} | GSTIN: ${settings.gstin}`,
    margin + 6,
    y + 13
  );

  return doc;
}
