import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  senderName: string;
  createdAt: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
  }>;
}

interface Ticket {
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
  messages: Message[];
  createdAt: string;
  resolvedAt?: string | null;
}

/**
 * Export ticket conversation as plain text
 */
export function exportAsText(ticket: Ticket): string {
  const customerName =
    ticket.customer?.name || ticket.guestName || "Guest";
  const customerEmail =
    ticket.customer?.email || ticket.guestEmail || "N/A";

  let text = `==============================================\n`;
  text += `SUPPORT TICKET: ${ticket.ticketNumber}\n`;
  text += `==============================================\n\n`;

  text += `Subject: ${ticket.subject}\n`;
  text += `Status: ${ticket.status}\n`;
  text += `Priority: ${ticket.priority}\n`;
  text += `Category: ${ticket.category || "N/A"}\n`;
  text += `Customer: ${customerName} (${customerEmail})\n`;
  text += `Created: ${format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}\n`;

  if (ticket.resolvedAt) {
    text += `Resolved: ${format(new Date(ticket.resolvedAt), "MMM d, yyyy 'at' h:mm a")}\n`;
  }

  text += `\n==============================================\n`;
  text += `CONVERSATION\n`;
  text += `==============================================\n\n`;

  ticket.messages.forEach((message, index) => {
    const timestamp = format(
      new Date(message.createdAt),
      "MMM d, yyyy 'at' h:mm a"
    );
    const prefix =
      message.senderType === "CUSTOMER" ? "👤 CUSTOMER" : "👨‍💼 AGENT";

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
export function exportAsCSV(ticket: Ticket): string {
  const customerName =
    ticket.customer?.name || ticket.guestName || "Guest";
  const customerEmail =
    ticket.customer?.email || ticket.guestEmail || "N/A";

  let csv = `"Ticket Number","Subject","Status","Priority","Category","Customer","Email","Created","Resolved"\n`;
  csv += `"${ticket.ticketNumber}","${ticket.subject}","${ticket.status}","${ticket.priority}","${ticket.category || "N/A"}","${customerName}","${customerEmail}","${format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm:ss")}","${ticket.resolvedAt ? format(new Date(ticket.resolvedAt), "yyyy-MM-dd HH:mm:ss") : "N/A"}"\n\n`;

  csv += `"Timestamp","Sender Type","Sender Name","Message","Attachments"\n`;

  ticket.messages.forEach((message) => {
    const timestamp = format(
      new Date(message.createdAt),
      "yyyy-MM-dd HH:mm:ss"
    );
    const content = message.content.replace(/"/g, '""'); // Escape quotes
    const attachments = message.attachments
      ? message.attachments.map((a) => a.fileName).join("; ")
      : "";

    csv += `"${timestamp}","${message.senderType}","${message.senderName}","${content}","${attachments}"\n`;
  });

  return csv;
}

/**
 * Export ticket conversation as JSON
 */
export function exportAsJSON(ticket: Ticket): string {
  return JSON.stringify(ticket, null, 2);
}

/**
 * Download file helper
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export ticket as text file
 */
export function exportTicketAsText(ticket: Ticket) {
  const content = exportAsText(ticket);
  const filename = `ticket-${ticket.ticketNumber}-${format(new Date(), "yyyy-MM-dd")}.txt`;
  downloadFile(content, filename, "text/plain");
}

/**
 * Export ticket as CSV file
 */
export function exportTicketAsCSV(ticket: Ticket) {
  const content = exportAsCSV(ticket);
  const filename = `ticket-${ticket.ticketNumber}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  downloadFile(content, filename, "text/csv");
}

/**
 * Export ticket as JSON file
 */
export function exportTicketAsJSON(ticket: Ticket) {
  const content = exportAsJSON(ticket);
  const filename = `ticket-${ticket.ticketNumber}-${format(new Date(), "yyyy-MM-dd")}.json`;
  downloadFile(content, filename, "application/json");
}
