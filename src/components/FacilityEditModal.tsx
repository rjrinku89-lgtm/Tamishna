import React, { useState } from 'react';
import { FactoryFacilityIdentity, ComplianceStandardItem } from '../types';
import { INITIAL_FACTORY_IDENTITY } from '../data/initialData';
import { 
  Building, 
  ShieldCheck, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  RotateCcw, 
  Award, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Zap,
  MapPin,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';

interface FacilityEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryIdentity: FactoryFacilityIdentity;
  onSave: (updated: FactoryFacilityIdentity) => void;
}

const STANDARD_CATEGORIES: ComplianceStandardItem['category'][] = [
  'Chemical & ZDHC',
  'Environmental & ETP',
  'Occupational Health & Safety',
  'Social & Labor',
  'Energy & Boiler',
];

const STANDARD_STATUSES: ComplianceStandardItem['status'][] = [
  'Certified',
  'Compliant',
  'Active Renewal',
  'Under Audit',
];

export const FacilityEditModal: React.FC<FacilityEditModalProps> = ({
  isOpen,
  onClose,
  factoryIdentity,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'registrations' | 'standards'>('identity');
  const [formData, setFormData] = useState<FactoryFacilityIdentity>(() => JSON.parse(JSON.stringify(factoryIdentity)));
  
  // State for adding or editing a standard item
  const [isEditingStandard, setIsEditingStandard] = useState(false);
  const [standardEditId, setStandardEditId] = useState<string | null>(null);
  const [standardForm, setStandardForm] = useState<ComplianceStandardItem>({
    id: '',
    name: '',
    standardCode: '',
    authority: '',
    certificateNumber: '',
    status: 'Certified',
    validUntil: '2027-12-31',
    category: 'Chemical & ZDHC',
    scopeNotes: '',
  });

  // Sync with prop when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(JSON.parse(JSON.stringify(factoryIdentity)));
      setIsEditingStandard(false);
      setStandardEditId(null);
    }
  }, [isOpen, factoryIdentity]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof FactoryFacilityIdentity, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'apex') {
      setFormData(JSON.parse(JSON.stringify(INITIAL_FACTORY_IDENTITY)));
    } else if (presetName === 'greentextile') {
      setFormData((prev) => ({
        ...prev,
        facilityName: 'GreenTextile Eco-Dyeing & CETP Ltd.',
        facilityShortName: 'GreenTextile Mills',
        facilityCode: 'FAC-ECO-NRG-108',
        facilityType: 'Sustainable Yarn & Knit Dyeing, Bio-ETP & Zero Liquid Discharge (ZLD)',
        groupOrParentCompany: 'GreenTextile Global Industries Ltd.',
        address: 'Plot 88-92, BSCIC Eco-Park, Narayanganj-1400, Bangladesh',
        locationZone: 'Shitalakshya Riverfront Eco-Industrial Zone',
        factoryHead: 'Dr. K. M. Hasan (Managing Director & Textile Engineer)',
        ehsOfficer: 'Sabrina Rahman (Lead Sustainability & ZDHC Auditor)',
        contactEmail: 'sustainability@greentextile.com.bd',
        contactPhone: '+880 2-7639100 / +880 1713-999111',
        licenseNumber: 'REG-DYE-MOI-2018/11452',
        totalFloorArea: '410,000 sq. ft.',
        dailyCapacity: '60 Tons / Day (Organic Cotton & Recycled Polyester)',
        cetpCapacity: '4,800 m³/day (Advanced MBR & Reverse Osmosis ZLD)',
        zdhcGatewayAid: 'AID-BD-DYE-88120',
        zdhcLevel: 'Level 3 (Leader / Zero Liquid Discharge)',
        doeClearanceCert: 'DoE/Narayanganj/ETP-RED/2026/194',
        fireSafetyLicense: 'FSCD/NRG/2026/F-3382',
        bercLicenseNo: 'BERC/STEAM/BLR-5520',
        isoCertifications: 'ISO 14001:2015, ISO 50001:2018, ISO 45001:2018',
        higgFacilityId: 'Higg ID: 178220 (Verified Score: 92.6%)',
        oekoTexCert: 'OEKO-TEX STeP Level 3 & Standard 100 Class I',
      }));
    } else if (presetName === 'pacific') {
      setFormData((prev) => ({
        ...prev,
        facilityName: 'Pacific Knit Composite & Dyeing Mills Ltd.',
        facilityShortName: 'Pacific Composite Mills',
        facilityCode: 'FAC-PAC-CTG-077',
        facilityType: 'Continuous Woven Finishing, Denim Dyeing & High-Rate CETP',
        groupOrParentCompany: 'Pacific Garments & Textile Group',
        address: 'Sector 5, Chittagong Export Processing Zone (CEPZ), Chittagong-4223',
        locationZone: 'Chittagong Port Coastal Industrial Corridor',
        factoryHead: 'Engr. J. U. Chowdhury (General Manager - Operations)',
        ehsOfficer: 'Mahbubur Rahman (Senior Manager - EHS & Buyer Compliance)',
        contactEmail: 'compliance@pacifictextiles-bd.com',
        contactPhone: '+880 31-740500 / +880 1819-223344',
        licenseNumber: 'BEPZA-IND-REG-2015/0931',
        totalFloorArea: '280,000 sq. ft.',
        dailyCapacity: '35 Tons / Day (Denim & Twill Dyeing)',
        cetpCapacity: '3,000 m³/day (Combined Biological Extended Aeration)',
        zdhcGatewayAid: 'AID-BD-DYE-44109',
        zdhcLevel: 'Level 3 (Supplier to Zero / InCheck 100%)',
        doeClearanceCert: 'DoE/Chittagong/ETP-RED/2026/044',
        fireSafetyLicense: 'FSCD/CTG/2026/F-6091',
        bercLicenseNo: 'BERC/STEAM/BLR-3108',
        isoCertifications: 'ISO 14001:2015, ISO 9001:2015',
        higgFacilityId: 'Higg ID: 119804 (Verified Score: 86.2%)',
        oekoTexCert: 'OEKO-TEX Standard 100 Annex 6',
      }));
    }
  };

  // Standard Management
  const handleOpenAddStandard = () => {
    setStandardForm({
      id: `std-${Date.now()}`,
      name: '',
      standardCode: '',
      authority: '',
      certificateNumber: '',
      status: 'Certified',
      validUntil: '2027-12-31',
      category: 'Chemical & ZDHC',
      scopeNotes: '',
    });
    setStandardEditId(null);
    setIsEditingStandard(true);
  };

  const handleOpenEditStandard = (std: ComplianceStandardItem) => {
    setStandardForm({ ...std });
    setStandardEditId(std.id);
    setIsEditingStandard(true);
  };

  const handleSaveStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!standardForm.name.trim()) return;

    if (standardEditId) {
      setFormData((prev) => ({
        ...prev,
        complianceStandards: prev.complianceStandards.map((item) =>
          item.id === standardEditId ? standardForm : item
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        complianceStandards: [...prev.complianceStandards, standardForm],
      }));
    }
    setIsEditingStandard(false);
    setStandardEditId(null);
  };

  const handleDeleteStandard = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      complianceStandards: prev.complianceStandards.filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#123b5d] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Building className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Configure Factory Identity & Compliance Standards</span>
                <span className="text-[10px] bg-sky-400/20 text-sky-200 px-2 py-0.5 rounded-full font-semibold border border-sky-400/30">
                  Full Edit Access
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Update factory credentials, regulatory certificates, plant parameters, and buyer compliance standards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Factory Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('apex')}
              className="text-[11px] px-2.5 py-1 bg-white border border-slate-300 hover:border-[#123b5d] hover:text-[#123b5d] text-slate-700 rounded-md font-medium transition shadow-2xs"
            >
              Apex Dyeing Mills (Default)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('greentextile')}
              className="text-[11px] px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 rounded-md font-medium transition shadow-2xs"
            >
              GreenTextile Eco-Dyeing (Narayanganj)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('pacific')}
              className="text-[11px] px-2.5 py-1 bg-white border border-slate-300 hover:border-sky-600 hover:text-sky-700 text-slate-700 rounded-md font-medium transition shadow-2xs"
            >
              Pacific Knit & Denim (CEPZ)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 flex space-x-4 shrink-0 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'identity'
                ? 'border-[#123b5d] text-[#123b5d]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>1. Factory Identity & Plant Operations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('registrations')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'registrations'
                ? 'border-[#123b5d] text-[#123b5d]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Key Regulatory & Environmental IDs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('standards')}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'standards'
                ? 'border-[#123b5d] text-[#123b5d]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Compliance Standards List ({formData.complianceStandards.length})</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: Core Facility Identity */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">Global Facility Identity Synchronization</div>
                  <div className="text-sky-800 text-[11px] mt-0.5">
                    Modifying the facility name and profile here automatically updates top headers, training certificates, employee passports, and Excel audit export workbooks.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Facility Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.facilityName}
                    onChange={(e) => handleInputChange('facilityName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Apex Dyeing & Finishing Mills Ltd."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Facility Brand / Short Name
                  </label>
                  <input
                    type="text"
                    value={formData.facilityShortName}
                    onChange={(e) => handleInputChange('facilityShortName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Apex Dyeing Mills"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Facility Code / Plant ID
                  </label>
                  <input
                    type="text"
                    value={formData.facilityCode}
                    onChange={(e) => handleInputChange('facilityCode', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. FAC-DYE-BD-042"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Parent Corporate Group / Division
                  </label>
                  <input
                    type="text"
                    value={formData.groupOrParentCompany}
                    onChange={(e) => handleInputChange('groupOrParentCompany', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Apex Holdings Textile Division"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Facility Type & Operational Scope <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.facilityType}
                    onChange={(e) => handleInputChange('facilityType', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Woven & Knit Fabric Dyeing, Printing & CETP Facility"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Physical Factory Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Plot 14-18, Block B, Gazipur Industrial Area, Dhaka-1704, Bangladesh"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Industrial Zone / Cluster
                  </label>
                  <input
                    type="text"
                    value={formData.locationZone}
                    onChange={(e) => handleInputChange('locationZone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Gazipur Green Industrial Belt - Zone 2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Factory License / Registration No.
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. REG-DYE-MOI-2012/8890"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Factory Head / Director Operations
                  </label>
                  <input
                    type="text"
                    value={formData.factoryHead}
                    onChange={(e) => handleInputChange('factoryHead', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Engr. M. A. Rashid (Director Operations)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead EHS & Compliance In-Charge
                  </label>
                  <input
                    type="text"
                    value={formData.ehsOfficer}
                    onChange={(e) => handleInputChange('ehsOfficer', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Tanvir Hossain (Lead EHS & Compliance Manager)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Compliance Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. compliance@apexdyeing.com"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plant Contact Phone / Emergency Hotline
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. +880 2-9834101 / +880 1711-000222"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Daily Fabric Dyeing Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.dailyCapacity}
                    onChange={(e) => handleInputChange('dailyCapacity', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. 45 Tons / Day (Continuous & Exhaust Dyeing)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    CETP / ETP Daily Treatment Capacity
                  </label>
                  <input
                    type="text"
                    value={formData.cetpCapacity}
                    onChange={(e) => handleInputChange('cetpCapacity', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. 3,500 m³/day (Biological Extended Aeration & RO)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Industrial Floor Area
                  </label>
                  <input
                    type="text"
                    value={formData.totalFloorArea}
                    onChange={(e) => handleInputChange('totalFloorArea', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. 320,000 sq. ft."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Key Regulatory & Environmental IDs */}
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">Environmental & Regulatory Registries</div>
                  <div className="text-emerald-800 text-[11px] mt-0.5">
                    These registration identifiers are queried by international brand auditors (Inditex, H&M, Marks & Spencer, Primark) during social & environmental compliance inspections.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ZDHC Gateway Account ID (AID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zdhcGatewayAid}
                    onChange={(e) => handleInputChange('zdhcGatewayAid', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. AID-BD-DYE-99201"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ZDHC Implementation Level
                  </label>
                  <input
                    type="text"
                    value={formData.zdhcLevel}
                    onChange={(e) => handleInputChange('zdhcLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Level 3 (Supplier to Zero / InCheck 100%)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    DoE Environmental Clearance Certificate <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.doeClearanceCert}
                    onChange={(e) => handleInputChange('doeClearanceCert', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. DoE/Gazipur/ETP-RED/2026/089"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fire Safety & Civil Defence License
                  </label>
                  <input
                    type="text"
                    value={formData.fireSafetyLicense}
                    onChange={(e) => handleInputChange('fireSafetyLicense', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. FSCD/DH/2026/F-7741"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    BERC Steam Boiler & High Pressure Clearance
                  </label>
                  <input
                    type="text"
                    value={formData.bercLicenseNo}
                    onChange={(e) => handleInputChange('bercLicenseNo', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. BERC/STEAM/BLR-4019"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    OEKO-TEX Standard 100 / Annex 6 Class I
                  </label>
                  <input
                    type="text"
                    value={formData.oekoTexCert}
                    onChange={(e) => handleInputChange('oekoTexCert', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. OEKO-TEX Standard 100 Annex 6 (21.HBD.88412)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Higg Facility Environmental Module (FEM) ID & Score
                  </label>
                  <input
                    type="text"
                    value={formData.higgFacilityId}
                    onChange={(e) => handleInputChange('higgFacilityId', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. Higg ID: 142088 (Verified Score: 88.4%)"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ISO Management Certifications
                  </label>
                  <input
                    type="text"
                    value={formData.isoCertifications}
                    onChange={(e) => handleInputChange('isoCertifications', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                    placeholder="e.g. ISO 14001:2015, ISO 45001:2018, ISO 9001:2015"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Last Comprehensive Audit Date
                  </label>
                  <input
                    type="date"
                    value={formData.lastAuditDate || ''}
                    onChange={(e) => handleInputChange('lastAuditDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Next Scheduled Buyer / Statutory Audit
                  </label>
                  <input
                    type="date"
                    value={formData.nextAuditDate || ''}
                    onChange={(e) => handleInputChange('nextAuditDate', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Compliance Standards List (CRUD) */}
          {activeTab === 'standards' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-[#123b5d] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-sky-600" />
                    <span>Accredited Standards & Certifications Registry</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add custom sustainability accreditations, buyer protocols, and statutory clearances.
                  </p>
                </div>

                {!isEditingStandard && (
                  <button
                    type="button"
                    onClick={handleOpenAddStandard}
                    className="px-3 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center space-x-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Standard</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Sub-form */}
              {isEditingStandard && (
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#123b5d] uppercase tracking-wider">
                      {standardEditId ? 'Edit Compliance Standard' : 'Add New Compliance Standard'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsEditingStandard(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Standard Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={standardForm.name}
                        onChange={(e) => setStandardForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#123b5d]"
                        placeholder="e.g. GOTS (Global Organic Textile Standard) v6.0"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Standard Code</label>
                      <input
                        type="text"
                        value={standardForm.standardCode}
                        onChange={(e) => setStandardForm((p) => ({ ...p, standardCode: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-800"
                        placeholder="e.g. GOTS-TEX-01"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Auditing Authority / Body</label>
                      <input
                        type="text"
                        value={standardForm.authority}
                        onChange={(e) => setStandardForm((p) => ({ ...p, authority: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                        placeholder="e.g. Control Union / Hohenstein"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Certificate / License No.</label>
                      <input
                        type="text"
                        value={standardForm.certificateNumber}
                        onChange={(e) => setStandardForm((p) => ({ ...p, certificateNumber: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-slate-800"
                        placeholder="e.g. CU-884910-GOTS"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Compliance Category</label>
                      <select
                        value={standardForm.category}
                        onChange={(e) => setStandardForm((p) => ({ ...p, category: e.target.value as any }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
                      >
                        {STANDARD_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Certification Status</label>
                      <select
                        value={standardForm.status}
                        onChange={(e) => setStandardForm((p) => ({ ...p, status: e.target.value as any }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800"
                      >
                        {STANDARD_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Valid Until</label>
                      <input
                        type="date"
                        value={standardForm.validUntil}
                        onChange={(e) => setStandardForm((p) => ({ ...p, validUntil: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">Scope & Audit Notes</label>
                      <input
                        type="text"
                        value={standardForm.scopeNotes || ''}
                        onChange={(e) => setStandardForm((p) => ({ ...p, scopeNotes: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800"
                        placeholder="e.g. Certified for 100% organic cotton yarn and knit fabric wet processing."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingStandard(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStandard}
                      className="px-3 py-1.5 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-semibold rounded-lg transition flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{standardEditId ? 'Update Standard' : 'Add to List'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Standard Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formData.complianceStandards.map((std) => (
                  <div
                    key={std.id}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-[#123b5d]">{std.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                              {std.standardCode}
                            </span>
                            <span>&bull;</span>
                            <span>{std.authority}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            std.status === 'Certified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : std.status === 'Compliant'
                              ? 'bg-sky-100 text-sky-800'
                              : std.status === 'Active Renewal'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {std.status}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
                        Cert / ID: <strong>{std.certificateNumber}</strong>
                      </div>

                      {std.scopeNotes && (
                        <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">
                          {std.scopeNotes}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Valid until: <strong>{std.validUntil}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStandard(std)}
                          className="p-1 hover:bg-slate-100 text-slate-600 hover:text-[#123b5d] rounded transition"
                          title="Edit Standard"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStandard(std.id)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete Standard"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.complianceStandards.length === 0 && (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">No compliance standards added</div>
                  <div className="text-[11px] text-slate-500 mt-1">Click "Add New Standard" above to register accreditations.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Changes will immediately update across headers, export logs & reports.</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-[#123b5d] hover:bg-[#0e2f4a] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save & Apply Facility Identity</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
