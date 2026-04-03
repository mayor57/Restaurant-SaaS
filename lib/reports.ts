import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportData {
  revenue: any[];
  orders: any[];
  topItems: any[];
  todayRevenue: number;
}

export function downloadPDFReport(data: ReportData, restaurantName: string = 'Zentro Restaurant') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Custom Dark Theme Colors (Simulation in PDF)
  const colors = {
    primary: [245, 158, 11], // amber-500
    background: [15, 15, 15],
    text: [255, 255, 255],
    secondaryText: [150, 150, 150]
  };

  // Header Background
  doc.setFillColor(15, 15, 15);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(restaurantName.toUpperCase(), 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('PERFORMANCE INSIGHTS REPORT', 14, 32);
  
  const dateStr = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
  doc.text(`Generated: ${dateStr}`, pageWidth - 70, 32);

  // Executive Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 14, 55);

  const totalRevenue = data.revenue.reduce((acc, curr) => acc + curr.total, 0) + data.todayRevenue;
  const avgOrder = data.orders.length > 0 ? (totalRevenue / data.orders.length).toFixed(2) : '0.00';

  autoTable(doc, {
    startY: 60,
    head: [['Metric', 'Value']],
    body: [
      ['Total Gross Revenue', `$${totalRevenue.toLocaleString()}.00`],
      ['Total Orders Processed', data.orders.length.toString()],
      ['Average Order Value', `$${avgOrder}`],
      ['Live Today Revenue', `$${data.todayRevenue.toLocaleString()}.00`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0] },
  });

  // Top Items Table
  doc.text('Top Performing Items', 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Item Name', 'Quantity Sold', 'Contribution']],
    body: data.topItems.map(item => [
      item.name, 
      item.quantity.toString(), 
      'High'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
  });

  // Transaction Log
  doc.text('Recent Transactions Log', 14, (doc as any).lastAutoTable.finalY + 15);
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Order ID', 'Date', 'Status', 'Amount']],
    body: data.orders.slice(0, 15).map(order => [
      order.id.slice(0, 8).toUpperCase(),
      new Date(order.created_at).toLocaleDateString('en-GB'),
      order.status.toUpperCase(),
      `$${order.total_amount}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
  });

  // Footer
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Zentro Intelligence Engine - Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`Zentro_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}