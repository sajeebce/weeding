"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, ChevronRight, Store, Camera, MapPin,
  User, Mail, Lock, Phone, Building2,
} from "lucide-react";

type VendorCategory =
  | "VENUE" | "PHOTOGRAPHY" | "VIDEOGRAPHY" | "CATERING" | "MUSIC_DJ"
  | "FLOWERS" | "DRESS_ATTIRE" | "RINGS" | "DECORATIONS" | "TRANSPORTATION"
  | "HAIR_MAKEUP" | "WEDDING_PLANNER" | "OTHER";

const CATEGORY_OPTIONS: { value: VendorCategory; label: string; icon: string }[] = [
  { value: "VENUE", label: "Venue", icon: "🏛️" },
  { value: "PHOTOGRAPHY", label: "Photography", icon: "📸" },
  { value: "VIDEOGRAPHY", label: "Videography", icon: "🎬" },
  { value: "CATERING", label: "Catering", icon: "🍽️" },
  { value: "MUSIC_DJ", label: "Music & DJ", icon: "🎵" },
  { value: "FLOWERS", label: "Flowers", icon: "💐" },
  { value: "DRESS_ATTIRE", label: "Dress & Attire", icon: "👗" },
  { value: "RINGS", label: "Rings & Jewelry", icon: "💍" },
  { value: "DECORATIONS", label: "Decorations", icon: "✨" },
  { value: "TRANSPORTATION", label: "Transportation", icon: "🚗" },
  { value: "HAIR_MAKEUP", label: "Hair & Makeup", icon: "💄" },
  { value: "WEDDING_PLANNER", label: "Wedding Planner", icon: "📋" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

interface FormData {
  // Step 1 — Account
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  // Step 2 — Business
  businessName: string;
  category: VendorCategory | "";
  tagline: string;
  description: string;
  city: string;
  country: string;
}

const STEPS = [
  { label: "Account", icon: <User className="w-4 h-4" /> },
  { label: "Business", icon: <Building2 className="w-4 h-4" /> },
  { label: "Done", icon: <Check className="w-4 h-4" /> },
];

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
    businessName: "", category: "", tagline: "", description: "", city: "", country: "SE",
  });

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep1(): string {
    if (!form.name.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email address";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return "";
  }

  function validateStep2(): string {
    if (!form.businessName.trim()) return "Business name is required";
    if (!form.category) return "Please select a category";
    return "";
  }

  function handleNext() {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    }
  }

  async function handleSubmit() {
    const err = validateStep2();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/vendor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || null,
          businessName: form.businessName,
          category: form.category,
          tagline: form.tagline || null,
          description: form.description || null,
          city: form.city || null,
          country: form.country,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }
      setStep(3);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-purple-700">
          <Store className="w-5 h-5" />
          <span>Vendor Portal</span>
        </Link>
        <Link href="/login?callbackUrl=/vendor/dashboard" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
          Already have an account? Sign in
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div key={s.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      done ? "bg-purple-600 text-white" : active ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {done ? <Check className="w-4 h-4" /> : s.icon}
                    </div>
                    <span className={`text-xs mt-1 ${active ? "text-purple-600 font-medium" : "text-gray-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 mb-5 mx-1 ${step > num ? "bg-purple-600" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm mb-6">Start your 30-day free trial — no credit card required</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="you@business.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="+46 70 123 4567" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Min 8 characters" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Repeat password" />
                  </div>
                </div>
              </div>

              <button onClick={handleNext}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Business Info */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Your business details</h1>
              <p className="text-gray-500 text-sm mb-6">This will be shown on your public vendor profile</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Business Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={form.businessName} onChange={(e) => update("businessName", e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="e.g. Stockholm Photography Studio" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Category *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button"
                        onClick={() => update("category", opt.value)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                          form.category === opt.value
                            ? "border-purple-500 bg-purple-50 text-purple-700 font-medium"
                            : "border-gray-200 hover:border-purple-300 text-gray-600"
                        }`}>
                        <span className="text-lg">{opt.icon}</span>
                        <span className="leading-tight text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tagline</label>
                  <input type="text" value={form.tagline} onChange={(e) => update("tagline", e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="A short, catchy description" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">About your business</label>
                  <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    placeholder="Tell couples what makes you special..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder="Stockholm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                    <select value={form.country} onChange={(e) => update("country", e.target.value)}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                      <option value="SE">Sweden</option>
                      <option value="NO">Norway</option>
                      <option value="DK">Denmark</option>
                      <option value="FI">Finland</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="AE">UAE</option>
                      <option value="BD">Bangladesh</option>
                      <option value="IN">India</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setStep(1); setError(""); }}
                  className="px-4 py-2.5 border rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors">
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : <Check className="w-4 h-4" />}
                  {submitting ? "Registering…" : "Complete Registration"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re registered!</h1>
              <p className="text-gray-600 mb-2">
                Your business listing is <strong>pending admin review</strong>.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                We&apos;ll notify you when your profile is approved and visible in the directory.
                This usually takes 1–2 business days.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/login?callbackUrl=/vendor/dashboard">
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
                    Sign in to your account
                  </button>
                </Link>
                <Link href="/vendors">
                  <button className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" />
                    Browse the vendor directory
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
