"use client";

import { useState } from "react";
import { Download, FileText, File, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportTicketAsText,
  exportTicketAsCSV,
  exportTicketAsJSON,
} from "@/lib/export-ticket";
import { toast } from "sonner";

interface ExportTicketButtonProps {
  ticket: {
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
    messages: Array<{
      id: string;
      content: string;
      senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
      senderName: string;
      createdAt: string;
      attachments?: Array<{
        fileName: string;
        fileUrl: string;
      }>;
    }>;
    createdAt: string;
    resolvedAt?: string | null;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportTicketButton({
  ticket,
  variant = "outline",
  size = "default",
}: ExportTicketButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "text" | "csv" | "json") => {
    try {
      setIsExporting(true);

      switch (format) {
        case "text":
          exportTicketAsText(ticket);
          toast.success("Exported as text file");
          break;
        case "csv":
          exportTicketAsCSV(ticket);
          toast.success("Exported as CSV file");
          break;
        case "json":
          exportTicketAsJSON(ticket);
          toast.success("Exported as JSON file");
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export ticket");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("text")}>
          <FileText className="mr-2 h-4 w-4" />
          Export as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <File className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
