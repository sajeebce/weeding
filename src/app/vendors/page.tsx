"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Camera,
  Music,
  Flower2,
  Car,
  Scissors,
  CalendarHeart,
  Building2,
  Gem,
  UtensilsCrossed,
  Video,
  Shirt,
  Sparkles,
  Package,
} from "lucide-react";

type VendorCategory =
  | "VENUE"
  | "PHOTOGRAPHY"
  | "VIDEOGRAPHY"
  | "CATERING"
  | "MUSIC_DJ"
  | "FLOWERS"
  | "DRESS_ATTIRE"
  | "RINGS"
  | "DECORATIONS"
  | "TRANSPORTATION"
  | "HAIR_MAKEUP"
  | "WEDDING_PLANNER"
  | "OTHER";

const CATEGORY_META: Record<
  VendorCategory,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  VENUE: {
    label: "Venues",
    icon: <Building2 className="w-6 h-6" />,
    color: "text-purple-700",
    bg: "bg-purple-50",
  },
  PHOTOGRAPHY: {
    label: "Photography",
    icon: <Camera className="w-6 h-6" />,
    color: "text-pink-700",
    bg: "bg-pink-50",
  },
  VIDEOGRAPHY: {
    label: "Videography",
    icon: <Video className="w-6 h-6" />,
    color: "text-red-700",
    bg: "bg-red-50",
  },
  CATERING: {
    label: "Catering",
    icon: <UtensilsCrossed className="w-6 h-6" />,
    color: "text-orange-700",
    bg: "bg-orange-50",
  },
  MUSIC_DJ: {
    label: "Music & DJ",
    icon: <Music className="w-6 h-6" />,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  FLOWERS: {
    label: "Flowers",
    icon: <Flower2 className="w-6 h-6" />,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  DRESS_ATTIRE: {
    label: "Dress & Attire",
    icon: <Shirt className="w-6 h-6" />,
    color: "text-teal-700",
    bg: "bg-teal-50",
  },
  RINGS: {
    label: "Rings & Jewelry",
    icon: <Gem className="w-6 h-6" />,
    color: "text-cyan-700",
    bg: "bg-cyan-50",
  },
  DECORATIONS: {
    label: "Decorations",
    icon: <Sparkles className="w-6 h-6" />,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  TRANSPORTATION: {
    label: "Transportation",
    icon: <Car className="w-6 h-6" />,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  HAIR_MAKEUP: {
    label: "Hair & Makeup",
    icon: <Scissors className="w-6 h-6" />,
    color: "text-rose-700",
    bg: "bg-rose-50",
  },
  WEDDING_PLANNER: {
    label: "Wedding Planner",
    icon: <CalendarHeart className="w-6 h-6" />,
    color: "text-violet-700",
    bg: "bg-violet-50",
  },
  OTHER: {
    label: "Other",
    icon: <Package className="w-6 h-6" />,
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
};

interface VendorCard {
  id: string;
  slug: string;
  businessName: string;
  category: VendorCategory;
  tagline: string | null;
  city: string | null;
  country: string;
  coverPhoto: string | null;
  startingPrice: number | null;
  currency: string;
  isFeatured: boolean;
  reviewCount: number;
  avgRating: number | null;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorCard[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [cityInput, setCityInput] = useState("");

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (cityFilter) params.set("city", cityFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/vendors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setVendors(data.vendors);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, cityFilter, categoryFilter, page]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setCityFilter(cityInput);
    setPage(1);
  }

  function handleCategoryClick(cat: VendorCategory | "") {
    setCategoryFilter(cat);
    setPage(1);
  }

  function formatPrice(price: number | null, currency: string) {
    if (!price) return null;
    return `${currency} ${price.toLocaleString()}+`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Find Your Perfect Wedding Vendors</h1>
          <p className="text-purple-200 text-lg mb-8">
            Discover trusted vendors for every part of your special day
          </p>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-xl"
          >
            <div className="flex items-center flex-1 px-3 gap-2">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search vendors, services..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 outline-none text-gray-800 text-sm py-2"
              />
            </div>
            <div className="flex items-center px-3 gap-2 border-t sm:border-t-0 sm:border-l border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="City or region"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="outline-none text-gray-800 text-sm py-2 w-36"
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryClick("")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoryFilter === ""
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300"
            }`}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORY_META) as VendorCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const active = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "bg-purple-600 text-white"
                    : `bg-white ${meta.color} border border-gray-200 hover:border-purple-300`
                }`}
              >
                {meta.icon}
                {meta.label}
              </button>
            );
          })}
        </div>

        {/* Active filter display */}
        {(search || cityFilter || categoryFilter) && (
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
            <span>Filters:</span>
            {categoryFilter && (
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {CATEGORY_META[categoryFilter].label}
              </span>
            )}
            {cityFilter && (
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {cityFilter}
              </span>
            )}
            {search && (
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                &ldquo;{search}&rdquo;
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setCityFilter("");
                setCityInput("");
                setCategoryFilter("");
                setPage(1);
              }}
              className="text-purple-600 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 text-sm">
            {isLoading ? "Loading..." : `${total} vendor${total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Vendor grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map((v) => {
              const meta = CATEGORY_META[v.category];
              return (
                <Link
                  key={v.id}
                  href={`/vendors/${v.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100"
                >
                  {/* Cover photo */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                    {v.coverPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.coverPhoto}
                        alt={v.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className={`${meta.color}`}>{meta.icon}</span>
                      </div>
                    )}
                    {v.isFeatured && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    <span
                      className={`absolute top-2 right-2 ${meta.bg} ${meta.color} text-xs font-medium px-2 py-0.5 rounded-full`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 group-hover:text-purple-700 transition-colors">
                      {v.businessName}
                    </h3>
                    {v.tagline && (
                      <p className="text-gray-500 text-sm line-clamp-1 mb-2">{v.tagline}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {v.city || v.country}
                      </div>
                      {v.avgRating !== null && (
                        <div className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-gray-700">
                            {v.avgRating.toFixed(1)}
                          </span>
                          <span className="text-gray-400">({v.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    {v.startingPrice && (
                      <p className="mt-2 text-sm font-medium text-purple-700">
                        From {formatPrice(v.startingPrice, v.currency)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-1 text-gray-400">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-purple-600 text-white"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* CTA for vendors */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Are You a Wedding Vendor?</h2>
          <p className="text-purple-200 mb-6">
            List your business and reach thousands of couples planning their perfect wedding
          </p>
          <Link
            href="/vendor/register"
            className="inline-block bg-white text-purple-700 font-semibold px-8 py-3 rounded-xl hover:bg-purple-50 transition-colors"
          >
            Get Listed — Free 30-Day Trial
          </Link>
        </div>
      </div>
    </div>
  );
}
