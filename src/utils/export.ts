export const exportUtils = {
  // BOM of a single section → TXT
  exportSectionBOMToTXT: (sectionName: string, parts: any[]) => {
    let content = `BOM - ${sectionName}\n`;
    content += `Generated on: ${new Date().toLocaleString('en-IN')}\n\n`;
    content += 'Part Number\tDescription\tQty\tUnit Price\tDiscount %\tTotal\n';
    content += '----------------------------------------------------------------------------\n';

    parts.forEach((p: any) => {
      const unitPrice = p.unit_price || 0;
      const quantity = p.quantity || 0;
      const discount = p.discount_percent || 0;
      const total = unitPrice * quantity * (1 - discount / 100);
      content += `${p.part_number || '-'}\t${p.description || '-'}\t${quantity}\t₹${unitPrice}\t${discount}%\t₹${total.toFixed(2)}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sectionName}_BOM.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Full Project BOM → TXT
  exportProjectBOMToTXT: (projectName: string, sections: any[]) => {
    let content = `Full BOM - ${projectName}\n`;
    content += `Generated on: ${new Date().toLocaleString('en-IN')}\n\n`;

    sections.forEach((section: any) => {
      content += `=== SECTION: ${section.section_name} ===\n`;
      const parts = section.project_parts || [];
      parts.forEach((p: any) => {
        const unitPrice = p.unit_price || 0;
        const quantity = p.quantity || 0;
        const discount = p.discount_percent || 0;
        const total = unitPrice * quantity * (1 - discount / 100);
        content += `${p.part_number || '-'}\t${p.description || '-'}\t${quantity}\t₹${unitPrice}\t${discount}%\t₹${total.toFixed(2)}\n`;
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_Full_BOM.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // PO Export → CSV
  exportPOToCSV: (po: any) => {
    let csv = `Purchase Order Details\n`;
    csv += `PO Number,${po.po_number}\n`;
    csv += `Supplier,"${po.suppliers?.name || '-'}"\n`;
    csv += `Project,"${po.project?.project_name || '-'}"\n`;
    csv += `Date,${new Date(po.created_date).toLocaleDateString('en-IN')}\n`;
    csv += `Status,${po.status}\n\n`;
    
    // Header for items
    csv += 'Part Number,Description,Qty,Unit Price,Discount %,Total\n';

    (po.purchase_order_items || []).forEach((item: any) => {
      const unitPrice = item.unit_price || 0;
      const quantity = item.quantity || 0;
      const discount = item.discount_percent || 0;
      const total = unitPrice * quantity * (1 - discount / 100);
      
      // Escape descriptions that might contain commas
      const escapedDesc = (item.description || '-').replace(/"/g, '""');
      
      csv += `"${item.part_number}","${escapedDesc}",${quantity},${unitPrice},${discount},${total.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PO_${po.po_number}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  },

  // Simple PDF export using browser print (no extra library)
  exportToPDF: (filename: string) => {
    const originalTitle = document.title;
    document.title = filename;
    window.print();
    document.title = originalTitle;
  }
};

export default exportUtils;
