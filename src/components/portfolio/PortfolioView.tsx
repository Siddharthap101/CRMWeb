import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Share2,
  Download,
  Plus,
  FileText,
  Building2,
  CheckCircle,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  Trash2,
  Upload,
  X,
  RotateCcw,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { PortfolioItem, RateCardItem } from '../../types/crm';
import {
  getStoredPortfolio,
  saveStoredPortfolio,
  getStoredRateCard,
  saveStoredRateCard,
  DEFAULT_PORTFOLIO_ITEMS,
  DEFAULT_RATE_CARD,
  generateCompanyProfilePDF,
} from '../../services/portfolioData';

export const PortfolioView: React.FC = () => {
  const { settings, openModal, showToast } = useCRM();

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(getStoredPortfolio());
  const [rateCardItems, setRateCardItems] = useState<RateCardItem[]>(getStoredRateCard());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Add Photo Modal State
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('3D Letters & Boards');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('₹3,500 / Running Ft');
  const [newLeadTime, setNewLeadTime] = useState('5 to 7 Working Days');
  const [newSpecs, setNewSpecs] = useState('Samsung LED Modules, Cast Acrylic Face');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Add Rate Item State
  const [isAddRateOpen, setIsAddRateOpen] = useState(false);
  const [newRateCategory, setNewRateCategory] = useState('3D Letters');
  const [newRateItem, setNewRateItem] = useState('');
  const [newRateSpec, setNewRateSpec] = useState('');
  const [newRateValue, setNewRateValue] = useState('₹3,500');
  const [newRateUnit, setNewRateUnit] = useState('Running Ft');

  const filteredPortfolio = portfolioItems.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const handleDownloadBrochure = () => {
    const doc = generateCompanyProfilePDF(settings, portfolioItems, rateCardItems);
    const fileName = `${settings.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Portfolio_Brochure.pdf`;
    doc.save(fileName);
    showToast('Downloaded Company Portfolio & Rate Card PDF Brochure!', 'success');
  };

  const handleSharePack = () => {
    openModal('share_details');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setNewImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a project title.', 'error');
      return;
    }
    const finalImage = newImageUrl.trim() || imagePreview || '/src/assets/images/portfolio_3d_acrylic_letters_1791876148654.jpg';

    const newItem: PortfolioItem = {
      id: `port_${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Custom architectural signage fabricated with high-grade materials and precision LED illumination.',
      imageUrl: finalImage,
      indicativePrice: newPrice.trim() || '₹3,500 / Unit',
      leadTime: newLeadTime.trim() || '5-7 Working Days',
      specifications: newSpecs.split(',').map((s) => s.trim()).filter(Boolean),
    };

    const updated = [newItem, ...portfolioItems];
    setPortfolioItems(updated);
    saveStoredPortfolio(updated);
    setIsAddPhotoOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewImageUrl('');
    setImagePreview(null);
    showToast('Added project photo to Company Portfolio!', 'success');
  };

  const handleDeletePhoto = (id: string) => {
    const updated = portfolioItems.filter((p) => p.id !== id);
    setPortfolioItems(updated);
    saveStoredPortfolio(updated);
    showToast('Removed project photo from portfolio.', 'info');
  };

  const handleSaveNewRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRateItem.trim()) {
      showToast('Please enter an item name.', 'error');
      return;
    }
    const newRate: RateCardItem = {
      id: `rc_${Date.now()}`,
      category: newRateCategory,
      item: newRateItem.trim(),
      spec: newRateSpec.trim() || 'Standard industry specifications',
      rate: newRateValue.trim() || '₹1,000',
      unit: newRateUnit.trim() || 'Sq.Ft',
    };

    const updated = [...rateCardItems, newRate];
    setRateCardItems(updated);
    saveStoredRateCard(updated);
    setIsAddRateOpen(false);
    setNewRateItem('');
    setNewRateSpec('');
    showToast('Added new item to Rate Card!', 'success');
  };

  const handleResetDefaults = () => {
    setPortfolioItems(DEFAULT_PORTFOLIO_ITEMS);
    saveStoredPortfolio(DEFAULT_PORTFOLIO_ITEMS);
    setRateCardItems(DEFAULT_RATE_CARD);
    saveStoredRateCard(DEFAULT_RATE_CARD);
    showToast('Reset portfolio and rate card to default presets.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Company Portfolio, Project Photos & Rate Card</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Ready-to-share portfolio showcase of executed signage letters, architectural boards, indicative pricing, and machinery specifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Custom Project Photo */}
          <button
            onClick={() => setIsAddPhotoOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project Photo</span>
          </button>

          {/* Download Brochure PDF */}
          <button
            onClick={handleDownloadBrochure}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download PDF Brochure</span>
          </button>

          {/* Quick Share to Customer */}
          <button
            onClick={handleSharePack}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Details to Customer</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: `All Projects (${portfolioItems.length})` },
            { id: '3D', label: '3D Acrylic Letters' },
            { id: 'Stainless', label: 'Stainless Steel Signage' },
            { id: 'Storefront', label: 'Retail Boards & ACP' },
            { id: 'Machinery', label: 'Signage Machinery' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleResetDefaults}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          title="Reset to default signage photos and rates"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Presets</span>
        </button>
      </div>

      {/* Projects Showcase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPortfolio.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              {/* Photo Banner */}
              <div className="aspect-16/10 relative bg-slate-100 overflow-hidden group">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold">
                  {item.category}
                </span>

                <button
                  onClick={() => handleDeletePhoto(item.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white shadow-xs transition-colors"
                  title="Remove this photo from portfolio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>

                {/* Technical Specs Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {item.specifications.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer with Price and Direct Share Trigger */}
            <div className="p-4 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Indicative Rate</span>
                <span className="font-bold text-emerald-700 text-sm font-mono tabular-nums">
                  {item.indicativePrice}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-medium">Lead time: {item.leadTime}</span>
                <button
                  onClick={handleSharePack}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Indicative Rate Card Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Signage Industry Indicative Rate Sheet</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard price references per running ft, sq.ft, piece, and machine setup
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddRateOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Rate Item</span>
            </button>

            <button
              onClick={handleSharePack}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Rate Card on WhatsApp</span>
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Product / Service Item</th>
                <th className="py-2.5 px-3">Specifications</th>
                <th className="py-2.5 px-3">Billing Unit</th>
                <th className="py-2.5 px-3 text-right">Indicative Rate (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rateCardItems.map((rc) => (
                <tr key={rc.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{rc.category}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{rc.item}</td>
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

      {/* Modal: Add Custom Project Photo */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Add Executed Project Photo</span>
              </h3>
              <button
                onClick={() => setIsAddPhotoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPhoto} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Apollo Pharmacy 3D Frontlit LED Signboard"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="3D Letters & Boards">3D Letters & Boards</option>
                    <option value="Stainless Steel Signage">Stainless Steel Signage</option>
                    <option value="Storefront Signboards">Storefront Signboards</option>
                    <option value="Signage Machinery">Signage Machinery</option>
                    <option value="Neon & Acrylic Signs">Neon & Acrylic Signs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Indicative Rate</label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="e.g. ₹3,500 / Running Ft"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Upload Photo from PC / Phone</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-blue-400 p-3 rounded-lg text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-colors">
                    <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                    <span className="text-[11px] font-medium text-slate-600">Select Image (JPG/PNG/WEBP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or Image URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://... or leave blank for sample photo"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain craftsmanship, LED brand, finish quality..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specifications (Comma-separated)</label>
                <input
                  type="text"
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  placeholder="e.g. 3mm Cast Acrylic, Samsung IP67 LEDs, 3-Year Warranty"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Save to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Rate Item */}
      {isAddRateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Item to Rate Sheet</h3>
              <button
                onClick={() => setIsAddRateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newRateCategory}
                  onChange={(e) => setNewRateCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="3D Letters">3D Letters</option>
                  <option value="Stainless Steel">Stainless Steel</option>
                  <option value="Signboards">Signboards</option>
                  <option value="Materials">Materials</option>
                  <option value="Machinery">Machinery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product / Item Name *</label>
                <input
                  type="text"
                  required
                  value={newRateItem}
                  onChange={(e) => setNewRateItem(e.target.value)}
                  placeholder="e.g. Backlit Halo Letter with Brass Trim"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specifications</label>
                <input
                  type="text"
                  value={newRateSpec}
                  onChange={(e) => setNewRateSpec(e.target.value)}
                  placeholder="e.g. Pure brass face, warm white LEDs, acrylic back"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rate (₹)</label>
                  <input
                    type="text"
                    value={newRateValue}
                    onChange={(e) => setNewRateValue(e.target.value)}
                    placeholder="e.g. ₹5,200"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newRateUnit}
                    onChange={(e) => setNewRateUnit(e.target.value)}
                    placeholder="e.g. Running Ft, Piece, Sq.Ft"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRateOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Add to Rate Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
