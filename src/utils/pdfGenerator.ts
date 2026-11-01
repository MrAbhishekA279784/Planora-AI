import { EventItem } from '../types';
import { formatINR } from './calculations';

export async function generateEventSchedulePdf(event: EventItem) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Colors based on Planora warm editorial palette
  const brandBrown = [122, 61, 25]; // #7A3D19
  const brandCopper = [184, 107, 42]; // #B86B2A
  const textDark = [23, 20, 18]; // #171412
  const textMuted = [109, 106, 102]; // #6D6A66
  const bgLight = [251, 247, 239]; // #FBF7EF
  const borderLight = [237, 226, 211]; // #EDE2D3
  const greenColor = [22, 166, 106]; // #16A66A
  const blueColor = [38, 116, 245]; // #2674F5
  const orangeColor = [240, 138, 18]; // #F08A12

  let y = margin;

  // Top Accent Bar
  doc.setFillColor(brandBrown[0], brandBrown[1], brandBrown[2]);
  doc.rect(margin, y, contentWidth, 5, 'F');
  y += 24;

  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(brandBrown[0], brandBrown[1], brandBrown[2]);
  doc.text('Planora AI', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Plan Smarter. Celebrate Better.', margin + 105, y - 2);

  const printDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Generated on ${printDate}`, pageWidth - margin, y, { align: 'right' });

  y += 18;
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  // Event Hero Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, y, contentWidth, 76, 8, 8, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(margin, y, contentWidth, 76, 8, 8, 'S');

  // Event Name & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(event.name, margin + 16, y + 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(brandCopper[0], brandCopper[1], brandCopper[2]);
  doc.text(event.subtitle || 'Event Master Schedule', margin + 16, y + 42);

  // Metadata Grid
  const metaY = y + 60;
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);

  doc.text(`Date: ${event.date}`, margin + 16, metaY);
  doc.text(`Location: ${event.location}`, margin + 140, metaY);
  doc.text(`Guests: ${event.guestCount}`, margin + 280, metaY);
  doc.text(`Progress: ${event.completionPercent}%`, margin + 380, metaY);

  y += 98;

  // Section Heading: Event Execution Schedule
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Milestone & Task Execution Schedule', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Total Tasks: ${event.tasks?.length || 0}`, pageWidth - margin, y, { align: 'right' });

  y += 12;

  // Table Header
  const colX = {
    idx: margin + 8,
    title: margin + 30,
    vendor: margin + 220,
    dueDate: margin + 360,
    status: margin + 440,
  };

  doc.setFillColor(245, 237, 225); // subtle cream table header
  doc.rect(margin, y, contentWidth, 22, 'F');
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.rect(margin, y, contentWidth, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(brandBrown[0], brandBrown[1], brandBrown[2]);
  doc.text('#', colX.idx, y + 15);
  doc.text('Task / Milestone', colX.title, y + 15);
  doc.text('Assigned Vendor / Partner', colX.vendor, y + 15);
  doc.text('Target Date', colX.dueDate, y + 15);
  doc.text('Status', colX.status, y + 15);

  y += 22;

  // Table Rows
  const tasks = event.tasks || [];
  tasks.forEach((task, index) => {
    // Check if new page is needed
    if (y > pageHeight - 90) {
      doc.addPage();
      y = margin + 20;

      // Repeat Table Header
      doc.setFillColor(245, 237, 225);
      doc.rect(margin, y, contentWidth, 22, 'F');
      doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
      doc.rect(margin, y, contentWidth, 22, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(brandBrown[0], brandBrown[1], brandBrown[2]);
      doc.text('#', colX.idx, y + 15);
      doc.text('Task / Milestone', colX.title, y + 15);
      doc.text('Assigned Vendor / Partner', colX.vendor, y + 15);
      doc.text('Target Date', colX.dueDate, y + 15);
      doc.text('Status', colX.status, y + 15);
      y += 22;
    }

    const rowHeight = 24;
    if (index % 2 === 1) {
      doc.setFillColor(253, 251, 247);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    // Row contents
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    doc.text(`${index + 1}`, colX.idx, y + 16);
    doc.text(task.title.length > 32 ? `${task.title.slice(0, 30)}...` : task.title, colX.title, y + 16);

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(task.vendorName || '—', colX.vendor, y + 16);
    doc.text(task.dueDate || '—', colX.dueDate, y + 16);

    // Status Pill
    let statusText = 'Pending';
    let sColor = orangeColor;
    if (task.status === 'completed') {
      statusText = 'Completed';
      sColor = greenColor;
    } else if (task.status === 'in-progress') {
      statusText = 'In Progress';
      sColor = blueColor;
    } else if (task.status === 'upcoming') {
      statusText = 'Upcoming';
      sColor = brandBrown;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(sColor[0], sColor[1], sColor[2]);
    doc.text(statusText, colX.status, y + 16);

    y += rowHeight;
  });

  y += 24;

  // Optional: Budget Summary Bar if space permits
  if (event.budgetCategories && event.budgetCategories.length > 0 && y < pageHeight - 120) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('Budget Allocation Overview', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(brandBrown[0], brandBrown[1], brandBrown[2]);
    doc.text(`Total Budget: ${formatINR(event.totalBudget)}`, pageWidth - margin, y, { align: 'right' });

    y += 12;

    const catWidth = contentWidth / Math.min(event.budgetCategories.length, 5);
    event.budgetCategories.slice(0, 5).forEach((cat, i) => {
      const bx = margin + i * catWidth;
      doc.setFillColor(251, 247, 239);
      doc.roundedRect(bx, y, catWidth - 6, 36, 4, 4, 'F');
      doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
      doc.roundedRect(bx, y, catWidth - 6, 36, 4, 4, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(brandBrown[0], brandBrown[1], brandBrown[2]);
      doc.text(cat.name, bx + 6, y + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`${formatINR(cat.amount)} (${cat.percentage}%)`, bx + 6, y + 27);
    });

    y += 50;
  }

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Planora AI • Confidential Event Schedule', margin, pageHeight - 22);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  }

  return doc;
}

export async function downloadEventSchedulePdf(event: EventItem): Promise<void> {
  const doc = await generateEventSchedulePdf(event);
  const cleanName = event.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${cleanName}_Schedule.pdf`);
}
