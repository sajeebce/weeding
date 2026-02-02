import { NextRequest, NextResponse } from 'next/server';
import { licenseService } from '@/services/license.service';
import { verifyLicenseSchema } from '@/lib/validations/license';
import { headers } from 'next/headers';

// POST /api/licenses/verify - Verify license and get token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyLicenseSchema.parse(body);

    // Get IP address from headers
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0].trim() ??
                      headersList.get('x-real-ip') ??
                      'unknown';

    const result = await licenseService.verify(
      validatedData.licenseKey,
      validatedData.domain,
      validatedData.pluginSlug,
      validatedData.pluginVersion,
      validatedData.cmsVersion,
      validatedData.serverInfo,
      ipAddress
    );

    if (!result.valid) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('License verification failed:', error);

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
        error: 'VERIFICATION_FAILED',
        message: 'An error occurred during verification',
      },
      { status: 500 }
    );
  }
}
