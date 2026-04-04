import React from 'react';
import { FileText, File } from 'lucide-react';
import exportUtils from '../../utils/export';
import { useToast } from '../../context/ToastContext';

interface SectionExportButtonProps {
  sectionName: string;
  parts: any[];           // project_parts rows for this section
  projectName?: string;
}

export default function SectionExportButton({ sectionName, parts }: SectionExportButtonProps) {
  const { showToast } = useToast();

  const handleExportTXT = () => {
    try {
      exportUtils.exportSectionBOMToTXT(sectionName, parts);
      showToast('success', `${sectionName} BOM exported as TXT`);
    } catch (err) {
      showToast('error', 'Failed to export BOM');
    }
  };

  const handleExportPDF = () => {
    try {
      // Simple browser print for PDF (user can save as PDF)
      exportUtils.exportToPDF(`${sectionName}_BOM`);
      showToast('success', `Opening Print Dialog for ${sectionName} BOM...`);
    } catch (err) {
      showToast('error', 'Failed to generate PDF');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportTXT}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-2xl transition-colors"
      >
        <FileText className="w-4 h-4" />
        TXT
      </button>

      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-2xl transition-colors"
      >
        <File className="w-4 h-4" />
        PDF
      </button>
    </div>
  );
}
