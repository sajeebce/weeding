"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, profileRes] = await Promise.all([
          fetch("/api/vendor/stats"),
          fetch("/api/vendor/profile"),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setAvgRating(data.avgRating);
        }
        if (profileRes.ok) {
          const data = await profileRes.json();
          if (data.profile?.slug) {
            const r = await fetch(`/api/vendors/${data.profile.slug}`);
            if (r.ok) {
              const vd = await r.json();
              setReviews(vd.vendor?.reviews ?? []);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">{reviews.length} customer reviews</p>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5 flex items-center gap-5">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900">
              {avgRating ? avgRating.toFixed(1) : "—"}
            </p>
            <Stars rating={Math.round(avgRating ?? 0)} />
            <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">{star}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-yellow-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-4">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-14 text-center">
          <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Reviews from customers will appear here after they&apos;re approved
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-purple-600">
                      {r.reviewerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.reviewerName}</p>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
