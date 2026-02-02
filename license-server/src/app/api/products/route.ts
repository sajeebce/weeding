import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productService } from '@/services/product.service';
import { createProductSchema } from '@/lib/validations/product';

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const includeInactive = searchParams.get('includeInactive') === 'true';

  try {
    const products = await productService.list({ includeInactive });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to list products:', error);
    return NextResponse.json(
      { error: 'Failed to list products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only SUPER_ADMIN and ADMIN can create products
  if (session.user.role === 'STAFF') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    const product = await productService.create(validatedData);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error('Failed to create product:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this slug or key prefix already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
