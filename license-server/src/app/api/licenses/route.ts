import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { licenseService } from '@/services/license.service';
import { createLicenseSchema } from '@/lib/validations/license';
import type { LicenseStatus, LicenseTier } from '@prisma/client';

// GET /api/licenses - List licenses with pagination
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const search = searchParams.get('search') ?? undefined;
  const status = searchParams.get('status') as LicenseStatus | undefined;
  const productId = searchParams.get('productId') ?? undefined;
  const tier = searchParams.get('tier') as LicenseTier | undefined;

  try {
    const result = await licenseService.list({
      page,
      limit,
      search,
      status,
      productId,
      tier,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to list licenses:', error);
    return NextResponse.json(
      { error: 'Failed to list licenses' },
      { status: 500 }
    );
  }
}

// POST /api/licenses - Create new license
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = createLicenseSchema.parse(body);

    const license = await licenseService.create(validatedData, session.user.id);

    return NextResponse.json({
      success: true,
      license,
    });
  } catch (error: any) {
    console.error('Failed to create license:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create license' },
      { status: 500 }
    );
  }
}
