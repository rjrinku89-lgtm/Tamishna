import React, { useEffect, useState } from 'react';
import { Certificate } from '../types';
import { generateQRCode } from '../utils/exportUtils';
import { Award, Printer, X, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && certificate) {
      const verifyUrl = `CERT-VERIFY:${certificate.certificateNumber}|EMP:${certificate.employeeEid}|MODULE:${certificate.moduleName}|STATUS:VERIFIED`;
      generateQRCode(verifyUrl).then(setQrDataUrl);

      // Fire subtle celebratory confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#123b5d', '#0284c7', '#fbbf24'],
      });
    }
  }, [isOpen, certificate]);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden my-auto print:border-0 print:shadow-none print:max-w-none">
        
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="bg-[#123b5d] text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base">Employee Training Certificate</h3>
            <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-mono">
              {certificate.certificateNumber}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable Area) */}
        <div className="p-8 md:p-12 bg-gradient-to-b from-amber-50/20 via-white to-sky-50/20 relative font-serif text-slate-800 border-[10px] border-double border-[#123b5d]/90 m-4 rounded-lg shadow-inner print:m-0 print:border-[12px] print:shadow-none">
          
          {/* Watermark / Background Crest */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-[#123b5d]" />
          </div>

          {/* Header */}
          <div className="text-center relative z-10 space-y-1 pb-4 border-b-2 border-amber-500/40">
            <div className="text-xs font-sans tracking-[0.25em] text-[#123b5d] font-bold uppercase">
              APEX DYEING & FINISHING MILLS LTD.
            </div>
            <div className="text-[11px] font-sans text-slate-500">
              Department of Environment (DoE) &bull; ZDHC Level 3 MRSL Compliant &bull; ISO 45001 & 14001
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#123b5d] tracking-wide pt-2">
              CERTIFICATE OF TRAINING COMPLETION
            </h1>
            <p className="text-xs font-sans text-slate-500 italic">
              This is to certify that the employee named below has successfully undergone mandatory training and demonstrated required competency
            </p>
          </div>

          {/* Recipient Details */}
          <div className="text-center my-6 space-y-3 relative z-10">
            <div className="text-xs font-sans uppercase tracking-widest text-slate-500 font-semibold">
              Proudly Awarded To
            </div>
            <div className="text-2xl md:text-3xl font-serif font-bold text-[#123b5d] underline decoration-amber-500/70 underline-offset-8">
              {certificate.employeeName}
            </div>
            <div className="flex justify-center items-center gap-4 text-xs font-sans text-slate-600">
              <span>Employee ID: <strong className="text-slate-800">{certificate.employeeEid}</strong></span>
              <span>&bull;</span>
              <span>Department: <strong className="text-slate-800">{certificate.department}</strong></span>
              <span>&bull;</span>
              <span>Designation: <strong className="text-slate-800">{certificate.designation}</strong></span>
            </div>
          </div>

          {/* Module & Performance */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-4 my-6 text-center relative z-10 font-sans">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              For Successful Completion of
            </div>
            <div className="text-base md:text-lg font-bold text-[#123b5d] mt-1">
              {certificate.moduleName}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-600 mt-2">
              <span className="bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full font-medium">
                Category: {certificate.category}
              </span>
              <span>Evaluation Score: <strong className="text-emerald-700 font-bold">{certificate.score}%</strong></span>
              <span>Status: <strong className="text-emerald-700 font-bold">Passed & Certified</strong></span>
            </div>
          </div>

          {/* Date & Validity */}
          <div className="flex justify-between items-center text-xs font-sans text-slate-600 px-2 py-2 border-t border-slate-200 relative z-10">
            <div>
              <span className="text-slate-400">Completion Date:</span>{' '}
              <strong className="text-slate-800">{certificate.completionDate}</strong>
            </div>
            <div>
              <span className="text-slate-400">Valid Until:</span>{' '}
              <strong className="text-slate-800">{certificate.validUntil}</strong>
            </div>
            <div>
              <span className="text-slate-400">Certificate No:</span>{' '}
              <strong className="font-mono text-slate-800">{certificate.certificateNumber}</strong>
            </div>
          </div>

          {/* Signatures & Security QR Code */}
          <div className="grid grid-cols-3 gap-6 items-end pt-8 mt-4 relative z-10 font-sans">
            {/* Trainer Signature */}
            <div className="text-center">
              <div className="font-cursive italic text-base text-[#123b5d] font-semibold mb-1">
                {certificate.trainerName}
              </div>
              <div className="w-full border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-700">
                Authorized Lead Trainer
              </div>
              <div className="text-[10px] text-slate-500">EHS & Safety Department</div>
            </div>

            {/* QR Code Verification */}
            <div className="flex flex-col items-center justify-center">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Certificate Verification QR Code"
                  className="w-18 h-18 border border-slate-200 rounded p-0.5 bg-white shadow-xs"
                />
              )}
              <div className="text-[9px] text-slate-500 font-mono mt-1 text-center">
                Scan for Audit Verification
              </div>
            </div>

            {/* Plant GM / Head of Compliance */}
            <div className="text-center">
              <div className="font-cursive italic text-base text-[#123b5d] font-semibold mb-1">
                Engr. M. A. Rashid
              </div>
              <div className="w-full border-t border-slate-400 pt-1 text-[11px] font-semibold text-slate-700">
                General Manager / Compliance Head
              </div>
              <div className="text-[10px] text-slate-500">Apex Dyeing & Finishing Mills</div>
            </div>
          </div>

        </div>

        {/* Footer actions for modal */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 print:hidden">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Audit-ready compliance certificate registered under factory log</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#123b5d] hover:bg-[#0d2a42] text-white font-medium rounded-lg transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
