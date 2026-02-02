import { NextRequest, NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { refreshTokenSchema } from '@/lib/validations/license';

// POST /api/licenses/refresh - Refresh token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = refreshTokenSchema.parse(body);

    const result = await licenseService.refreshToken(
      validatedData.token,
      validatedData.domain
    );

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Token refresh failed:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          valid: false,
          error: 'INVALID_REQUEST',
          message: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        valid: false,
        error: 'REFRESH_FAILED',
        message: 'An error occurred during token refresh',
      },
      { status: 500 }
    );
  }
}
