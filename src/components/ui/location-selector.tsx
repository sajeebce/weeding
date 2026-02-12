"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Search, ChevronDown, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LocationItem {
  code: string;
  name: string;
  country: string;
  type: string;
  isPopular: boolean;
  fee: number;
}

interface LocationSelectorProps {
  value?: LocationItem | null;
  onChange: (location: LocationItem) => void;
  serviceId?: string;
  placeholder?: string;
  feeLabel?: string;
  className?: string;
  currencySymbol?: string;
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_MS = 300;

export function LocationSelector({
  value,
  onChange,
  serviceId,
  placeholder = "Search locations...",
  feeLabel = "fee",
  className,
  currencySymbol = "$",
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset when search changes
  useEffect(() => {
    setLocations([]);
    setCursor(0);
    setHasMore(true);
  }, [debouncedSearch]);

  // Fetch locations from API
  const fetchLocations = useCallback(
    async (searchQuery: string, cursorValue: number, append = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          cursor: cursorValue.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (searchQuery) params.set("search", searchQuery);
        if (serviceId) params.set("serviceId", serviceId);

        const res = await fetch(`/api/locations?${params}`);
        const data = await res.json();

        const items: LocationItem[] = data.locations.map(
          (loc: { code: string; name: string; country: string; type: string; isPopular: boolean; fee?: number }) => ({
            code: loc.code,
            name: loc.name,
            country: loc.country,
            type: loc.type,
            isPopular: loc.isPopular,
            fee: loc.fee ?? 0,
          })
        );

        setLocations((prev) => {
          if (append) {
            const existingCodes = new Set(prev.map((l) => l.code));
            const newItems = items.filter((l) => !existingCodes.has(l.code));
            return [...prev, ...newItems];
          }
          return items;
        });
        setHasMore(data.hasMore);
        setCursor(data.nextCursor ?? cursorValue + ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    },
    [serviceId]
  );

  // Initial fetch and search fetch
  useEffect(() => {
    if (isOpen) {
      fetchLocations(debouncedSearch, 0, false);
    }
  }, [isOpen, debouncedSearch, fetchLocations]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchLocations(debouncedSearch, cursor, true);
        }
      },
      { threshold: 0.1, root: listRef.current }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, cursor, debouncedSearch, fetchLocations, isOpen]);

  // Close on outside click
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

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (location: LocationItem) => {
    onChange(location);
    setIsOpen(false);
    setSearch("");
  };

  // Popular locations for quick selection
  const popularLocations = useMemo(
    () => locations.filter((l) => l.isPopular),
    [locations]
  );

  // Extract short display code (e.g., "US-WY" -> "WY")
  const getShortCode = (code: string) => {
    const parts = code.split("-");
    return parts.length > 1 ? parts[parts.length - 1] : code;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {value ? (
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">{value.name}</span>
            {value.fee > 0 && (
              <span className="text-muted-foreground">
                (${value.fee} {feeLabel})
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100"
          )}
        >
          {/* Search Input */}
          <div className="border-b p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className={cn(
                  "w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              />
            </div>
          </div>

          {/* Popular Locations (only when no search) */}
          {!search && popularLocations.length > 0 && (
            <div className="border-b px-2 py-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Popular
              </p>
              <div className="flex flex-wrap gap-1">
                {popularLocations.map((loc) => (
                  <button
                    key={`popular-${loc.code}`}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                      "hover:bg-primary hover:text-primary-foreground",
                      value?.code === loc.code &&
                        "bg-primary text-primary-foreground"
                    )}
                  >
                    {getShortCode(loc.code)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location List */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto overscroll-contain"
          >
            {locations.length === 0 && !isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No locations found
              </div>
            )}

            {locations.map((loc) => (
              <button
                key={`list-${loc.code}`}
                type="button"
                onClick={() => handleSelect(loc)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors",
                  "hover:bg-accent",
                  value?.code === loc.code && "bg-accent"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-8 items-center justify-center rounded text-xs font-semibold",
                      value?.code === loc.code
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {getShortCode(loc.code)}
                  </span>
                  <span className="font-medium">{loc.name}</span>
                </span>
                {loc.fee > 0 && (
                  <span className="text-muted-foreground">{currencySymbol}{loc.fee}</span>
                )}
              </button>
            ))}

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}
          </div>

          {/* Footer Info */}
          {locations.length > 0 && (
            <div className="border-t px-3 py-2">
              <p className="text-xs text-muted-foreground">
                {hasMore
                  ? "Scroll for more"
                  : `${locations.length} locations`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
