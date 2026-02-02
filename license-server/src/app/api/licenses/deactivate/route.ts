import { NextRequest, NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { deactivateDomainSchema } from '@/lib/validations/license';

// POST /api/licenses/deactivate - Deactivate domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = deactivateDomainSchema.parse(body);

    const result = await licenseService.deactivateDomain(
      validatedData.licenseKey,
      validatedData.domain
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Domain deactivation failed:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during deactivation',
      },
      { status: 500 }
    );
  }
}
