import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const isHealthy = checks.database;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
