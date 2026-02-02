import { NextResponse } from 'next/server';
import { tokenService } from '@/services/token.service';

// GET /api/public-key - Get public key for token verification
export async function GET() {
  const publicKey = await tokenService.getPublicKey();

  if (!publicKey) {
    return NextResponse.json(
      { error: 'Public key not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    publicKey,
    algorithm: 'RS256',
    issuer: 'license.llcpad.com',
    audience: 'llcpad-plugin',
  });
}
