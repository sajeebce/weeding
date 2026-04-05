import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import type { WeddingBlock } from "@/lib/planner-storage";
import GuestbookSection from "@/components/wedding/GuestbookSection";
import GuestPhotoUpload from "@/components/wedding/GuestPhotoUpload";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const THEMES = {
  modern:  { primary: "#7c3aed", accent: "#ede9fe", font: "Inter" },
  floral:  { primary: "#be185d", accent: "#fce7f3", font: "Georgia" },
  rustic:  { primary: "#92400e", accent: "#fef3c7", font: "Georgia" },
  minimal: { primary: "#1f2937", accent: "#f9fafb", font: "Inter" },
} as const;

function fmtDate(d: string) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  } catch { return d; }
}

function daysLeft(target: string) {
  try { return Math.max(0, Math.ceil((new Date(target).getTime() - Date.now()) / 86400000)); }
  catch { return null; }
}

export default async function PublicWeddingSite({ params }: PageProps) {
  const { slug } = await params;

  const site = await prisma.weddingWebsite.findUnique({
    where: { slug },
    include: {
      guestbookEntries: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, authorName: true, message: true, createdAt: true },
      },
      guestPhotos: {
        orderBy: { createdAt: "desc" },
        take: 100,
        select: { id: true, uploaderName: true, caption: true, photoData: true, createdAt: true },
      },
    },
  });
  if (!site || !site.published) notFound();

  const themeKey = (site.theme as keyof typeof THEMES) in THEMES ? (site.theme as keyof typeof THEMES) : "modern";
  const theme = THEMES[themeKey];
  const primaryHex = (site.primaryColor as string) || theme.primary;
  const accentHex  = (site.accentColor  as string) || theme.accent;
  const fontFamily = (site.fontFamily   as string) || theme.font;

  const rawBlocks = Array.isArray(site.blocks) ? (site.blocks as unknown as WeddingBlock[]) : [];
  const blocks = rawBlocks
    .filter(b => b.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div style={{ fontFamily }} className="min-h-screen bg-white text-gray-800">
      {blocks.map(block => {
        const s = block.settings;
        switch (block.type) {
          case "cover": {
            const rawLinks = (s.navLinks as unknown[]) ?? [];
            const navLinks: { label: string; href: string }[] = rawLinks.map(l =>
              typeof l === "string" ? { label: l, href: "" } : (l as { label: string; href: string })
            );
            const bgImg = s.backgroundImage as string | null;
            const brideName = (s.brideName as string) || "Bride Name";
            const groomName = (s.groomName as string) || "Groom Name";
            return (
              <section key={block.id} id="cover" className="relative min-h-screen flex flex-col overflow-hidden">
                {bgImg
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={bgImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${primaryHex}44, ${accentHex})` }} />
                }
                {bgImg && <div className="absolute inset-0 bg-black/40" />}
                {navLinks.length > 0 && (
                  <nav className="relative z-10 flex items-center justify-center gap-6 px-6 py-5 flex-wrap">
                    {navLinks.map((link, i) => (
                      <a key={i} href={link.href || undefined}
                        className={`text-sm font-medium tracking-wide ${bgImg ? "text-white/90 hover:text-white" : "hover:opacity-70"}`}
                        style={!bgImg ? { color: primaryHex } : undefined}>
                        {link.label}
                      </a>
                    ))}
                  </nav>
                )}
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 py-16">
                  {(s.date as string) && (
                    <div className={`border px-5 py-1.5 mb-5 text-base font-light tracking-wide ${bgImg ? "border-white/50 text-white/90" : ""}`}
                      style={!bgImg ? { borderColor: primaryHex + "66", color: primaryHex } : undefined}>
                      {s.date as string}
                    </div>
                  )}
                  {(s.quote as string) && (
                    <p className={`text-base mb-4 ${bgImg ? "text-white/80" : "text-gray-500"}`}>{s.quote as string}</p>
                  )}
                  <h1 className={`text-4xl sm:text-5xl font-bold leading-tight ${bgImg ? "text-white" : ""}`}
                    style={!bgImg ? { color: primaryHex } : undefined}>
                    {brideName} &amp; {groomName}
                  </h1>
                </div>
              </section>
            );
          }
          case "hero":
            return (
              <section key={block.id} id="hero" style={{ background: `linear-gradient(135deg, ${primaryHex}22, ${accentHex})` }}
                className="py-24 px-6 text-center">
                <p className="text-sm uppercase tracking-widest mb-4" style={{ color: primaryHex }}>
                  You&apos;re invited
                </p>
                <h1 className="text-5xl font-light mb-4" style={{ color: primaryHex }}>
                  {(s.title as string) || "Our Wedding"}
                </h1>
                {(s.subtitle as string) && (
                  <p className="text-lg text-gray-600 mb-6">{s.subtitle as string}</p>
                )}
                {(s.date as string) && (
                  <p className="text-base font-medium" style={{ color: primaryHex }}>
                    {fmtDate(s.date as string)}
                  </p>
                )}
                {(s.location as string) && (
                  <p className="text-sm text-gray-500 mt-2">📍 {s.location as string}</p>
                )}
              </section>
            );

          case "our-story":
            return (
              <section key={block.id} id="our-story" className="max-w-2xl mx-auto py-16 px-6 text-center">
                <h2 className="text-3xl font-light mb-6" style={{ color: primaryHex }}>
                  {(s.title as string) || "Our Story"}
                </h2>
                <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: primaryHex }} />
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{s.content as string}</p>
              </section>
            );

          case "venue":
            return (
              <section key={block.id} id="venue" style={{ background: accentHex }} className="py-16 px-6">
                <div className="max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl font-light mb-8" style={{ color: primaryHex }}>
                    {(s.title as string) || "When & Where"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {(s.ceremonyName as string) && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Ceremony</p>
                        <p className="font-medium" style={{ color: primaryHex }}>{s.ceremonyName as string}</p>
                        {(s.ceremonyAddress as string) && <p className="text-sm text-gray-500 mt-1">{s.ceremonyAddress as string}</p>}
                        {(s.ceremonyTime as string) && <p className="text-sm font-medium mt-2">{s.ceremonyTime as string}</p>}
                      </div>
                    )}
                    {(s.receptionName as string) && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Reception</p>
                        <p className="font-medium" style={{ color: primaryHex }}>{s.receptionName as string}</p>
                        {(s.receptionAddress as string) && <p className="text-sm text-gray-500 mt-1">{s.receptionAddress as string}</p>}
                        {(s.receptionTime as string) && <p className="text-sm font-medium mt-2">{s.receptionTime as string}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );

          case "schedule": {
            const items = (s.items as { time: string; title: string }[]) ?? [];
            return (
              <section key={block.id} id="schedule" className="max-w-xl mx-auto py-16 px-6">
                <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                  {(s.title as string) || "Schedule"}
                </h2>
                <div className="relative">
                  <div className="absolute left-[76px] top-0 bottom-0 w-px" style={{ background: accentHex }} />
                  {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-6 mb-6">
                      <span className="w-[76px] text-right text-sm font-medium" style={{ color: primaryHex }}>{item.time}</span>
                      <div className="h-3 w-3 rounded-full mt-0.5 flex-shrink-0 z-10" style={{ background: primaryHex }} />
                      <span className="text-gray-700">{item.title}</span>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case "gallery": {
            const images = ((s.images as string[]) ?? []).filter(Boolean);
            if (!images.length) return null;
            return (
              <section key={block.id} id="gallery" className="py-16 px-6">
                <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                  {(s.title as string) || "Our Photos"}
                </h2>
                <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="" className="w-full h-48 object-cover rounded-xl" />
                  ))}
                </div>
              </section>
            );
          }

          case "rsvp":
            return (
              <section key={block.id} id="rsvp" style={{ background: `${primaryHex}11` }} className="py-16 px-6 text-center">
                <h2 className="text-3xl font-light mb-4" style={{ color: primaryHex }}>
                  {(s.title as string) || "RSVP"}
                </h2>
                <p className="text-gray-600 mb-2">{s.message as string}</p>
                {(s.deadline as string) && (
                  <p className="text-sm text-gray-400 mb-6">RSVP by {s.deadline as string}</p>
                )}
                <a href="#guestbook"
                  style={{ background: primaryHex }}
                  className="inline-block px-8 py-3 rounded-full text-white font-medium hover:opacity-90 transition">
                  RSVP Now
                </a>
              </section>
            );

          case "registry": {
            const items = ((s.items as { name: string; url: string }[]) ?? []).filter(i => i.name);
            return (
              <section key={block.id} id="registry" className="py-16 px-6">
                <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                  {(s.title as string) || "Registry"}
                </h2>
                <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                  {items.map((item, i) => (
                    <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                      style={{ borderColor: primaryHex, color: primaryHex }}
                      className="border-2 rounded-full px-6 py-2 font-medium hover:opacity-80 transition text-sm">
                      {item.name}
                    </a>
                  ))}
                </div>
              </section>
            );
          }

          case "people": {
            const people = ((s.people as { name: string; role: string }[]) ?? []).filter(p => p.name);
            return (
              <section key={block.id} id="people" style={{ background: accentHex }} className="py-16 px-6">
                <h2 className="text-3xl font-light text-center mb-8" style={{ color: primaryHex }}>
                  {(s.title as string) || "Wedding Party"}
                </h2>
                <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
                  {people.map((p, i) => (
                    <div key={i} className="text-center">
                      <div className="h-16 w-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl"
                        style={{ background: primaryHex + "22" }}>👤</div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          case "countdown": {
            const days = daysLeft(s.targetDate as string);
            return (
              <section key={block.id} id="countdown" className="py-16 px-6 text-center">
                <h2 className="text-2xl font-light mb-6 text-gray-600">{s.title as string}</h2>
                {days !== null ? (
                  <div className="inline-flex flex-col items-center">
                    <span className="text-7xl font-light" style={{ color: primaryHex }}>{days}</span>
                    <span className="text-sm uppercase tracking-widest text-gray-400 mt-2">Days to go</span>
                  </div>
                ) : null}
              </section>
            );
          }

          case "guestbook":
            return (
              <GuestbookSection
                key={block.id}
                websiteId={site.id}
                title={(s.title as string) || "Guestbook"}
                message={s.message as string}
                primaryColor={primaryHex}
                accentColor={accentHex}
                initialEntries={site.guestbookEntries.map(e => ({
                  ...e,
                  createdAt: e.createdAt.toISOString(),
                }))}
              />
            );

          default:
            return null;
        }
      })}

      {/* Guest Photo Upload */}
      <GuestPhotoUpload
        websiteId={site.id}
        primaryColor={primaryHex}
        accentColor={accentHex}
        initialPhotos={site.guestPhotos.map(p => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
      />

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-400"
        style={{ borderTop: `1px solid ${accentHex}` }}>
        Made with ♥ using Ceremoney
      </footer>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const site = await prisma.weddingWebsite.findUnique({ where: { slug } });
  if (!site) return { title: "Wedding Website" };
  const heroBlock = (Array.isArray(site.blocks) ? (site.blocks as unknown as WeddingBlock[]) : []).find(b => b.type === "hero");
  const title = (heroBlock?.settings?.title as string) || "Our Wedding";
  return { title, description: `Join us to celebrate our wedding!` };
}
