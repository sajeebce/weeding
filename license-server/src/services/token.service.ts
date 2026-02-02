import { SignJWT, jwtVerify, importPKCS8, importSPKI, type KeyLike } from 'jose';
import type { LicenseTier, DomainLockMode } from '@prisma/client';

interface TokenPayload {
  licenseKey: string;
  productSlug: string;
  tier: LicenseTier;
  features: string[];
  domain: string;
  domainLockMode: DomainLockMode;
  licenseExpiresAt: string | null;
  supportExpiresAt: string | null;
}

interface VerifiedTokenPayload extends TokenPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

class TokenService {
  private privateKey: KeyLike | null = null;
  private publicKey: KeyLike | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    const privateKeyPem = process.env.LICENSE_PRIVATE_KEY;
    const publicKeyPem = process.env.LICENSE_PUBLIC_KEY;

    if (!privateKeyPem || !publicKeyPem) {
      console.warn('RSA keys not configured. Token generation will fail.');
      return;
    }

    try {
      // Handle escaped newlines from .env
      const formattedPrivateKey = privateKeyPem.replace(/\\n/g, '\n');
      const formattedPublicKey = publicKeyPem.replace(/\\n/g, '\n');

      this.privateKey = await importPKCS8(formattedPrivateKey, 'RS256');
      this.publicKey = await importSPKI(formattedPublicKey, 'RS256');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize RSA keys:', error);
    }
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    await this.initialize();

    if (!this.privateKey) {
      throw new Error('Private key not configured');
    }

    const token = await new SignJWT({
      ...payload,
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer('license.llcpad.com')
      .setAudience('llcpad-plugin')
      .setIssuedAt()
      .setExpirationTime('7d') // 7 days
      .sign(this.privateKey);

    return token;
  }

  async verifyToken(token: string): Promise<VerifiedTokenPayload | null> {
    await this.initialize();

    if (!this.publicKey) {
      throw new Error('Public key not configured');
    }

    try {
      const { payload } = await jwtVerify(token, this.publicKey, {
        issuer: 'license.llcpad.com',
        audience: 'llcpad-plugin',
      });

      return payload as unknown as VerifiedTokenPayload;
    } catch {
      return null;
    }
  }

  getTokenExpiry(): Date {
    // Token expires in 7 days
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
  }

  async getPublicKey(): Promise<string | null> {
    const publicKeyPem = process.env.LICENSE_PUBLIC_KEY;
    if (!publicKeyPem) return null;
    return publicKeyPem.replace(/\\n/g, '\n');
  }
}

export const tokenService = new TokenService();
