// Knowledge Base Categories API
import { NextResponse } from 'next/server';
import { prisma } from '@livesupport-pro/database';

// GET /api/knowledge-base/categories
export async function GET() {
  try {
    // Get distinct categories with counts
    const documents = await (prisma as any).knowledgeDocument.findMany({
      select: {
        category: true,
      },
    });

    // Count documents per category
    const categoryCount: Record<string, number> = {};
    documents.forEach((doc: { category: string | null }) => {
      const cat = doc.category || 'Uncategorized';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    const categories = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
    }));

    // Sort by count descending
    categories.sort((a, b) => b.count - a.count);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
