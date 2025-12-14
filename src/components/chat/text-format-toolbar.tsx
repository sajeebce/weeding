"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";

interface TextFormatToolbarProps {
  onFormat: (format: TextFormat) => void;
  disabled?: boolean;
}

export type TextFormat =
  | "bold"
  | "italic"
  | "code"
  | "link"
  | "list"
  | "orderedList"
  | "quote";

const formatButtons = [
  { format: "bold" as TextFormat, icon: Bold, label: "Bold", shortcut: "Ctrl+B" },
  {
    format: "italic" as TextFormat,
    icon: Italic,
    label: "Italic",
    shortcut: "Ctrl+I",
  },
  { format: "code" as TextFormat, icon: Code, label: "Code", shortcut: "Ctrl+`" },
  {
    format: "link" as TextFormat,
    icon: Link,
    label: "Insert Link",
    shortcut: "Ctrl+K",
  },
  {
    format: "list" as TextFormat,
    icon: List,
    label: "Bullet List",
    shortcut: "",
  },
  {
    format: "orderedList" as TextFormat,
    icon: ListOrdered,
    label: "Numbered List",
    shortcut: "",
  },
  {
    format: "quote" as TextFormat,
    icon: Quote,
    label: "Quote",
    shortcut: "",
  },
];

export function TextFormatToolbar({
  onFormat,
  disabled = false,
}: TextFormatToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        {formatButtons.map(({ format, icon: Icon, label, shortcut }) => (
          <Tooltip key={format}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onFormat(format)}
                disabled={disabled}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {label}
                {shortcut && (
                  <span className="ml-2 text-muted-foreground">{shortcut}</span>
                )}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

export function applyFormat(
  format: TextFormat,
  text: string,
  selectionStart: number,
  selectionEnd: number
): { newText: string; newCursorPos: number } {
  const selectedText = text.substring(selectionStart, selectionEnd);
  const before = text.substring(0, selectionStart);
  const after = text.substring(selectionEnd);

  let newText = text;
  let newCursorPos = selectionEnd;

  switch (format) {
    case "bold":
      if (selectedText) {
        newText = `${before}**${selectedText}**${after}`;
        newCursorPos = selectionEnd + 4;
      } else {
        newText = `${before}****${after}`;
        newCursorPos = selectionStart + 2;
      }
      break;

    case "italic":
      if (selectedText) {
        newText = `${before}_${selectedText}_${after}`;
        newCursorPos = selectionEnd + 2;
      } else {
        newText = `${before}__${after}`;
        newCursorPos = selectionStart + 1;
      }
      break;

    case "code":
      if (selectedText) {
        newText = `${before}\`${selectedText}\`${after}`;
        newCursorPos = selectionEnd + 2;
      } else {
        newText = `${before}\`\`${after}`;
        newCursorPos = selectionStart + 1;
      }
      break;

    case "link":
      if (selectedText) {
        newText = `${before}[${selectedText}](url)${after}`;
        newCursorPos = before.length + selectedText.length + 3;
      } else {
        newText = `${before}[text](url)${after}`;
        newCursorPos = selectionStart + 1;
      }
      break;

    case "list":
      if (selectedText) {
        const lines = selectedText.split("\n");
        const formattedLines = lines.map((line) => `- ${line}`).join("\n");
        newText = `${before}${formattedLines}${after}`;
        newCursorPos = before.length + formattedLines.length;
      } else {
        newText = `${before}- ${after}`;
        newCursorPos = selectionStart + 2;
      }
      break;

    case "orderedList":
      if (selectedText) {
        const lines = selectedText.split("\n");
        const formattedLines = lines
          .map((line, idx) => `${idx + 1}. ${line}`)
          .join("\n");
        newText = `${before}${formattedLines}${after}`;
        newCursorPos = before.length + formattedLines.length;
      } else {
        newText = `${before}1. ${after}`;
        newCursorPos = selectionStart + 3;
      }
      break;

    case "quote":
      if (selectedText) {
        const lines = selectedText.split("\n");
        const formattedLines = lines.map((line) => `> ${line}`).join("\n");
        newText = `${before}${formattedLines}${after}`;
        newCursorPos = before.length + formattedLines.length;
      } else {
        newText = `${before}> ${after}`;
        newCursorPos = selectionStart + 2;
      }
      break;
  }

  return { newText, newCursorPos };
}
