import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonsProps {
  data: any;
  userGrowth: { label: string; value: number }[];
  revenueTrend: { label: string; value: number }[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ data, userGrowth, revenueTrend }) => {
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    if (data) {
      const ws = XLSX.utils.json_to_sheet([
        { Metric: 'Total Users', Value: data.totals.users.total },
        { Metric: 'Total Workshops', Value: data.totals.workshops },
        { Metric: 'Total Competitions', Value: data.totals.competitions },
        { Metric: 'Total Revenue', Value: data.totals.revenue },
      ]);
      XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    }
    if (userGrowth?.length) {
      const ws = XLSX.utils.json_to_sheet(userGrowth.map(d => ({ Date: d.label, Users: d.value })));
      XLSX.utils.book_append_sheet(wb, ws, 'User Growth');
    }
    if (revenueTrend?.length) {
      const ws = XLSX.utils.json_to_sheet(revenueTrend.map(d => ({ Date: d.label, Revenue: d.value })));
      XLSX.utils.book_append_sheet(wb, ws, 'Revenue Trend');
    }
    XLSX.writeFile(wb, 'dashboard.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Groovia Platform - Dashboard Report', 14, 16);
    doc.setFontSize(12);
    doc.text('Generated on: ' + new Date().toLocaleDateString(), 14, 24);
    let y = 30;
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value']],
      body: [
        ['Total Users', data?.totals?.users?.total ?? 0],
        ['Total Workshops', data?.totals?.workshops ?? 0],
        ['Total Competitions', data?.totals?.competitions ?? 0],
        ['Total Revenue', data?.totals?.revenue ?? 0],
      ],
    });
    y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y + 40;

    if (userGrowth?.length) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('User Growth Chart', 14, 16);
      autoTable(doc, {
        startY: 24,
        head: [['Date', 'Users']],
        body: userGrowth.map(d => [d.label, d.value]),
      });
    }
    if (revenueTrend?.length) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Revenue Trend Chart', 14, 16);
      autoTable(doc, {
        startY: 24,
        head: [['Date', 'Revenue']],
        body: revenueTrend.map(d => [d.label, d.value]),
      });
    }
    doc.save('dashboard.pdf');
  };

  return (
    <>
      <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1 rounded mr-2">Export Excel</button>
      <button onClick={exportPDF} className="bg-red-600 text-white px-3 py-1 rounded">Export PDF</button>
    </>
  );
};
