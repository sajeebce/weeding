import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Share2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  blogPosts,
  blogCategories,
  getBlogPostBySlug,
  getRecentBlogPosts,
} from "@/lib/data/blog";
import { MultiJsonLd } from "@/components/seo/json-ld";
import { generateBreadcrumbSchema } from "@/lib/seo";

// Force dynamic rendering to avoid SSG issues with client components
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | LLCPad Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 3);

  const categoryName =
    blogCategories.find((c) => c.id === post.category)?.name || post.category;

  const schemaData: Record<string, unknown>[] = [
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: `https://llcpad.com${post.coverImage}`,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      author: {
        "@type": "Person",
        name: post.author.name,
      },
      publisher: {
        "@type": "Organization",
        name: "LLCPad",
        logo: {
          "@type": "ImageObject",
          url: "https://llcpad.com/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://llcpad.com/blog/${slug}`,
      },
    },
  ];

  return (
    <div className="py-16 lg:py-24">
      <MultiJsonLd data={schemaData} />

      <div className="container mx-auto px-4">
        {/* Back Link */}
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="mx-auto mt-8 max-w-3xl">
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {categoryName}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-xl text-muted-foreground">{post.excerpt}</p>

            {/* Author and Meta */}
            <div className="mt-8 flex flex-wrap items-center gap-6 border-b pb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime} min read
                </span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Render markdown content as simple HTML */}
            <div
              className="space-y-4 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_p]:leading-relaxed [&_ul]:ml-6 [&_ul]:list-disc [&_ol]:ml-6 [&_ol]:list-decimal [&_li]:mb-2 [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:bg-muted [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:px-4 [&_td]:py-2"
              dangerouslySetInnerHTML={{
                __html: post.content
                  .replace(/^## (.*$)/gim, "<h2>$1</h2>")
                  .replace(/^### (.*$)/gim, "<h3>$1</h3>")
                  .replace(/^\*\*([^*]+)\*\*/gim, "<strong>$1</strong>")
                  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
                  .replace(/^\* (.*$)/gim, "<li>$1</li>")
                  .replace(/^(\d+)\. (.*$)/gim, "<li>$2</li>")
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                  .replace(/\n\n/g, "</p><p>")
                  .replace(/^\| (.+) \|$/gim, (match) => {
                    const cells = match
                      .slice(1, -1)
                      .split("|")
                      .map((cell) => cell.trim());
                    return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`;
                  }),
              }}
            />
          </div>

          {/* Tags */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t pt-8">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Share */}
          <div className="mt-8 flex items-center justify-between border-t pt-8">
            <p className="font-medium">Share this article</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://llcpad.com/blog/${slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://llcpad.com/blog/${slug}`)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </Button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full transition-all hover:border-primary">
                    <CardHeader className="pb-4">
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                        <div className="flex h-full items-center justify-center">
                          <span className="text-4xl font-bold text-primary/20">
                            {relatedPost.title.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="line-clamp-2 font-semibold">
                        {relatedPost.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(relatedPost.publishedAt)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mx-auto mt-16 max-w-2xl">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold">Ready to Start Your LLC?</h2>
              <p className="mt-2 text-muted-foreground">
                Get your US LLC formed quickly and easily. Our team handles
                everything for you.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/services">
                    Browse Our Services
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Ask a Question</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
