import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { licenseService } from '@/services/license.service';
import { updateLicenseSchema } from '@/lib/validations/license';

// GET /api/licenses/[id] - Get single license
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const license = await licenseService.getById(id);

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    return NextResponse.json(license);
  } catch (error) {
    console.error('Failed to get license:', error);
    return NextResponse.json(
      { error: 'Failed to get license' },
      { status: 500 }
    );
  }
}

// PUT /api/licenses/[id] - Update license
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const validatedData = updateLicenseSchema.parse(body);

    const license = await licenseService.update(id, validatedData);

    return NextResponse.json({
      success: true,
      license,
    });
  } catch (error: any) {
    console.error('Failed to update license:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update license' },
      { status: 500 }
    );
  }
}

// DELETE /api/licenses/[id] - Delete license
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only SUPER_ADMIN can delete licenses
  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    await licenseService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete license:', error);
    return NextResponse.json(
      { error: 'Failed to delete license' },
      { status: 500 }
    );
  }
}
