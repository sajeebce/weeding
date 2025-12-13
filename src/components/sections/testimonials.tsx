import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import prisma from "@/lib/db";

// Fallback testimonials if database is empty
const fallbackTestimonials = [
  {
    id: "1",
    name: "Priya Sharma",
    country: "India",
    company: "Amazon FBA Seller",
    content:
      "I was hesitant about starting a US business from India, but LLCPad made it incredibly smooth. Within 10 days, I had my LLC, EIN, and Amazon seller account ready. Now I'm doing $50k/month in sales! Their expertise saved me months of research.",
    rating: 5,
  },
  {
    id: "2",
    name: "Ahmed Al-Farsi",
    country: "UAE",
    company: "E-commerce Business Owner",
    content:
      "Outstanding service! LLCPad handled my Wyoming LLC formation, registered agent service, and US business bank account seamlessly. The team's professionalism and quick response time exceeded all expectations. Highly recommend for serious entrepreneurs.",
    rating: 5,
  },
  {
    id: "3",
    name: "Imran Khan",
    country: "Pakistan",
    company: "Digital Marketing Agency",
    content:
      "After comparing 5+ services, I chose LLCPad for their transparency and expertise. Best decision ever! They guided me through LLC formation, EIN application, and even helped with my first US client contracts. True business partners, not just a service provider.",
    rating: 5,
  },
  {
    id: "4",
    name: "Vijay Patel",
    country: "India",
    company: "SaaS Entrepreneur",
    content:
      "LLCPad's Premium package was worth every penny. Got my Delaware LLC, business banking, and trademark registration done professionally. Their knowledge of international entrepreneur challenges is unmatched. Now my startup looks credible to US investors!",
    rating: 5,
  },
  {
    id: "5",
    name: "Sarah Johnson",
    country: "UK",
    company: "Amazon Brand Owner",
    content:
      "I needed US presence for Amazon Brand Registry. LLCPad delivered everything - LLC, EIN, virtual address - within a week. Their step-by-step guidance made complex processes simple. My brand is now protected and sales have doubled!",
    rating: 5,
  },
  {
    id: "6",
    name: "Omar Hassan",
    country: "UAE",
    company: "Import/Export Business",
    content:
      "Exceptional experience from start to finish! LLCPad helped me establish my US entity for international trade. The registered agent service is reliable, and their compliance support ensures I never miss important deadlines. Trustworthy partner for global business.",
    rating: 5,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });

    if (testimonials.length === 0) {
      return fallbackTestimonials;
    }

    return testimonials;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return fallbackTestimonials;
  }
}

export async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <section className="bg-muted/30 py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by 10,000+ Entrepreneurs Worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers from around the world have to say about their
            experience with LLCPad.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/10" />

                {/* Rating */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-accent text-accent"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="mb-6 text-sm text-muted-foreground">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[testimonial.company, testimonial.country]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 4).map((t, i) => (
                <Avatar key={i} className="border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {getInitials(t.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Join 10,000+ happy customers
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent text-accent" />
              ))}
            </div>
            <span className="ml-2 text-sm font-medium text-foreground">
              4.9/5
            </span>
            <span className="text-sm text-muted-foreground">
              (2,500+ reviews)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
