"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, ChevronDown, Check, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCIES } from "@/lib/currencies";
import type { Currency } from "@/lib/currencies";

interface CurrencySelectorProps {
  value?: string;
  onChange: (currencyCode: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ITEM_HEIGHT = 40;
const LIST_HEIGHT = 240;

export function CurrencySelector({
  value,
  onChange,
  placeholder = "Select currency...",
  className,
  disabled = false,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = useMemo(
    () => CURRENCIES.find((c) => c.code === value),
    [value]
  );

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return CURRENCIES;

    const searchLower = search.toLowerCase().trim();
    return CURRENCIES.filter(
      (currency) =>
        currency.name.toLowerCase().includes(searchLower) ||
        currency.code.toLowerCase().includes(searchLower) ||
        currency.symbol.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const virtualizer = useVirtualizer({
    count: filteredCurrencies.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && value && filteredCurrencies.length > 0) {
      const index = filteredCurrencies.findIndex((c) => c.code === value);
      if (index > -1) {
        requestAnimationFrame(() => {
          virtualizer.scrollToIndex(index, { align: "center" });
        });
      }
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = useCallback((currencyCode: string) => {
    onChange(currencyCode);
    setIsOpen(false);
    setSearch("");
  }, [onChange]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {selectedCurrency ? (
          <span className="flex items-center gap-2">
            <span className="text-base">{selectedCurrency.flag}</span>
            <span className="font-medium">{selectedCurrency.code}</span>
            <span className="text-muted-foreground">
              ({selectedCurrency.symbol}) {selectedCurrency.name}
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{placeholder}</span>
          </span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100"
          )}
        >
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
                className={cn(
                  "w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
            </div>
          </div>

          {filteredCurrencies.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No currencies found
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight: LIST_HEIGHT }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const currency = filteredCurrencies[virtualItem.index];
                  return (
                    <button
                      key={currency.code}
                      type="button"
                      onClick={() => handleSelect(currency.code)}
                      className={cn(
                        "absolute left-0 top-0 flex w-full items-center justify-between px-3 text-sm transition-colors",
                        "hover:bg-accent",
                        value === currency.code && "bg-accent"
                      )}
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base">{currency.flag}</span>
                        <span className="font-medium">{currency.code}</span>
                        <span className="text-xs text-muted-foreground">
                          ({currency.symbol})
                        </span>
                        <span className="text-muted-foreground">{currency.name}</span>
                      </span>
                      {value === currency.code && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {filteredCurrencies.length} currencies available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { CURRENCIES, getCurrencySymbol } from "@/lib/currencies";
export type { Currency } from "@/lib/currencies";
