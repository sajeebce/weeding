"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  {
    keys: ["G", "then", "T"],
    description: "Go to Tickets list",
    category: "Navigation",
  },
  {
    keys: ["G", "then", "S"],
    description: "Go to Settings",
    category: "Navigation",
  },
  { keys: ["Esc"], description: "Close dialog/modal", category: "Navigation" },

  // Ticket Actions
  { keys: ["R"], description: "Reply to ticket", category: "Ticket Actions" },
  {
    keys: ["E"],
    description: "Export conversation",
    category: "Ticket Actions",
  },
  {
    keys: ["Ctrl", "Enter"],
    description: "Send message",
    category: "Ticket Actions",
  },
  {
    keys: ["Ctrl", "E"],
    description: "Open emoji picker",
    category: "Ticket Actions",
  },
  {
    keys: ["Ctrl", "U"],
    description: "Upload file",
    category: "Ticket Actions",
  },

  // Search
  { keys: ["Ctrl", "K"], description: "Focus search", category: "Search" },
  { keys: ["/"], description: "Quick search", category: "Search" },

  // Status Changes
  {
    keys: ["Shift", "O"],
    description: "Mark as Open",
    category: "Status",
  },
  {
    keys: ["Shift", "P"],
    description: "Mark as In Progress",
    category: "Status",
  },
  {
    keys: ["Shift", "R"],
    description: "Mark as Resolved",
    category: "Status",
  },

  // Other
  { keys: ["?"], description: "Show shortcuts", category: "Help" },
  {
    keys: ["Ctrl", "Z"],
    description: "Undo last action",
    category: "Editing",
  },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts on "?" key
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          setOpen(true);
        }
      }

      // Close on Escape
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const categories = Array.from(
    new Set(shortcuts.map((s) => s.category))
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster and be more productive
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            {key === "then" ? (
                              <span className="text-xs text-muted-foreground mx-1">
                                then
                              </span>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="font-mono text-xs px-2 py-0.5"
                              >
                                {key}
                              </Badge>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Press <Badge variant="secondary" className="mx-1 font-mono">?</Badge> to
            toggle this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = modifiers.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
      const matchesShift = modifiers.shift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = modifiers.alt ? e.altKey : !e.altKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input (unless it's Ctrl+Key)
        if (
          modifiers.ctrl ||
          (target.tagName !== "INPUT" &&
            target.tagName !== "TEXTAREA" &&
            !target.isContentEditable)
        ) {
          e.preventDefault();
          callback();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, modifiers]);
}
