import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

interface PlannerSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
}

export async function getPlannerSession(): Promise<PlannerSession | NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
  };
}

export function isPlannerSession(
  result: PlannerSession | NextResponse
): result is PlannerSession {
  return "user" in result;
}
