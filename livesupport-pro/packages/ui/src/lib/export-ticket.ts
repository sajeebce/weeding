export interface ExportMessage {
  id: string;
  content: string;
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM';
  senderName: string;
  createdAt: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
  }>;
}

export interface ExportTicket {
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  customer: {
    name: string | null;
    email: string;
  } | null;
  guestName: string | null;
  guestEmail: string | null;
  messages: ExportMessage[];
  createdAt: string;
  resolvedAt?: string | null;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Export ticket conversation as plain text
 */
export function exportAsText(ticket: ExportTicket): string {
  const customerName = ticket.customer?.name || ticket.guestName || 'Guest';
  const customerEmail = ticket.customer?.email || ticket.guestEmail || 'N/A';

  let text = `==============================================\n`;
  text += `SUPPORT TICKET: ${ticket.ticketNumber}\n`;
  text += `==============================================\n\n`;

  text += `Subject: ${ticket.subject}\n`;
  text += `Status: ${ticket.status}\n`;
  text += `Priority: ${ticket.priority}\n`;
  text += `Category: ${ticket.category || 'N/A'}\n`;
  text += `Customer: ${customerName} (${customerEmail})\n`;
  text += `Created: ${formatDate(ticket.createdAt)}\n`;

  if (ticket.resolvedAt) {
    text += `Resolved: ${formatDate(ticket.resolvedAt)}\n`;
  }

  text += `\n==============================================\n`;
  text += `CONVERSATION\n`;
  text += `==============================================\n\n`;

  ticket.messages.forEach((message, index) => {
    const timestamp = formatDate(message.createdAt);
    const prefix = message.senderType === 'CUSTOMER' ? 'CUSTOMER' : message.senderType === 'AGENT' ? 'AGENT' : 'SYSTEM';

    text += `[${timestamp}] ${prefix}: ${message.senderName}\n`;
    text += `${message.content}\n`;

    if (message.attachments && message.attachments.length > 0) {
      text += `\nAttachments:\n`;
      message.attachments.forEach((att) => {
        text += `  - ${att.fileName}: ${att.fileUrl}\n`;
      });
    }

    text += `\n`;

    if (index < ticket.messages.length - 1) {
      text += `----------------------------------------------\n\n`;
    }
  });

  text += `\n==============================================\n`;
  text += `END OF CONVERSATION\n`;
  text += `==============================================\n`;

  return text;
}

/**
 * Export ticket conversation as CSV
 */
export function exportAsCSV(ticket: ExportTicket): string {
  const customerName = ticket.customer?.name || ticket.guestName || 'Guest';
  const customerEmail = ticket.customer?.email || ticket.guestEmail || 'N/A';

  let csv = `"Ticket Number","Subject","Status","Priority","Category","Customer","Email","Created","Resolved"\n`;
  csv += `"${ticket.ticketNumber}","${ticket.subject}","${ticket.status}","${ticket.priority}","${ticket.category || 'N/A'}","${customerName}","${customerEmail}","${ticket.createdAt}","${ticket.resolvedAt || 'N/A'}"\n\n`;

  csv += `"Timestamp","Sender Type","Sender Name","Message","Attachments"\n`;

  ticket.messages.forEach((message) => {
    const content = message.content.replace(/"/g, '""'); // Escape quotes
    const attachments = message.attachments
      ? message.attachments.map((a) => a.fileName).join('; ')
      : '';

    csv += `"${message.createdAt}","${message.senderType}","${message.senderName}","${content}","${attachments}"\n`;
  });

  return csv;
}

/**
 * Export ticket conversation as JSON
 */
export function exportAsJSON(ticket: ExportTicket): string {
  return JSON.stringify(ticket, null, 2);
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get formatted date for filename
 */
function getDateForFilename(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Export ticket as text file
 */
export function exportTicketAsText(ticket: ExportTicket) {
  const content = exportAsText(ticket);
  const filename = `ticket-${ticket.ticketNumber}-${getDateForFilename()}.txt`;
  downloadFile(content, filename, 'text/plain');
}

/**
 * Export ticket as CSV file
 */
export function exportTicketAsCSV(ticket: ExportTicket) {
  const content = exportAsCSV(ticket);
  const filename = `ticket-${ticket.ticketNumber}-${getDateForFilename()}.csv`;
  downloadFile(content, filename, 'text/csv');
}

/**
 * Export ticket as JSON file
 */
export function exportTicketAsJSON(ticket: ExportTicket) {
  const content = exportAsJSON(ticket);
  const filename = `ticket-${ticket.ticketNumber}-${getDateForFilename()}.json`;
  downloadFile(content, filename, 'application/json');
}
