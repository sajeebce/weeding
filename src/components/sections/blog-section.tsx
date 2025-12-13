import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import prisma from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

// Fallback blog posts if database is empty
const fallbackPosts = [
  {
    id: "1",
    title: "Complete Guide to Forming a Wyoming LLC for Non-US Residents",
    slug: "wyoming-llc-guide-non-us-residents",
    excerpt:
      "Learn everything you need to know about forming a Wyoming LLC as a non-US resident, including benefits, requirements, and step-by-step process.",
    coverImage: "/images/blog/wyoming-llc.jpg",
    tags: ["LLC", "Wyoming", "Guide"],
    publishedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "How to Get an EIN for Your LLC Without a Social Security Number",
    slug: "ein-without-ssn",
    excerpt:
      "A comprehensive guide on obtaining an EIN (Employer Identification Number) for your US LLC when you don't have an SSN or ITIN.",
    coverImage: "/images/blog/ein-guide.jpg",
    tags: ["EIN", "Tax", "International"],
    publishedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    title: "Starting Your Amazon FBA Business with a US LLC",
    slug: "amazon-fba-us-llc",
    excerpt:
      "Discover how to set up your Amazon FBA business using a US LLC, including bank account setup and seller verification tips.",
    coverImage: "/images/blog/amazon-fba.jpg",
    tags: ["Amazon", "E-commerce", "FBA"],
    publishedAt: new Date("2024-01-05"),
  },
];

async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        tags: true,
        publishedAt: true,
      },
    });

    if (posts.length === 0) {
      return fallbackPosts;
    }

    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return fallbackPosts;
  }
}

export async function BlogSection() {
  const posts = await getBlogPosts();

  // Don't render if no posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <Badge variant="secondary" className="mb-4">
              Blog
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Latest Insights & Guides
            </h2>
            <p className="mt-2 text-muted-foreground">
              Expert tips and comprehensive guides for international entrepreneurs
            </p>
          </div>
          <Button className="group" variant="outline" asChild>
            <Link href="/blog">
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Blog Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
                {/* Cover Image */}
                <div className="aspect-video overflow-hidden bg-muted">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-4xl font-bold text-primary/30">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-5">
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Date */}
                  {post.publishedAt && (
                    <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(post.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
