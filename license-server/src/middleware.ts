import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for development
// In production, use Redis or Upstash
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration per endpoint type
const rateLimits: Record<string, { requests: number; windowMs: number }> = {
  'verify': { requests: 60, windowMs: 60000 },      // 60 requests per minute
  'refresh': { requests: 30, windowMs: 60000 },     // 30 requests per minute
  'deactivate': { requests: 20, windowMs: 60000 },  // 20 requests per minute
  'webhooks': { requests: 100, windowMs: 60000 },   // 100 requests per minute
  'default': { requests: 200, windowMs: 60000 },    // 200 requests per minute
};

function getEndpointType(pathname: string): string {
  if (pathname.includes('/verify')) return 'verify';
  if (pathname.includes('/refresh')) return 'refresh';
  if (pathname.includes('/deactivate')) return 'deactivate';
  if (pathname.includes('/webhooks')) return 'webhooks';
  return 'default';
}

function checkRateLimit(identifier: string, endpointType: string): { allowed: boolean; remaining: number; reset: number } {
  const config = rateLimits[endpointType] || rateLimits.default;
  const now = Date.now();
  const key = `${identifier}:${endpointType}`;

  let record = rateLimitMap.get(key);

  // Clean up expired records periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + config.windowMs };
    rateLimitMap.set(key, record);
  }

  record.count++;

  return {
    allowed: record.count <= config.requests,
    remaining: Math.max(0, config.requests - record.count),
    reset: record.resetTime,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting for health check
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  // Get identifier (IP address)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'anonymous';

  const endpointType = getEndpointType(pathname);
  const { allowed, remaining, reset } = checkRateLimit(ip, endpointType);

  const response = allowed
    ? NextResponse.next()
    : NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        { status: 429 }
      );

  // Add rate limit headers
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(reset / 1000).toString());

  if (!allowed) {
    response.headers.set('Retry-After', Math.ceil((reset - Date.now()) / 1000).toString());
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
