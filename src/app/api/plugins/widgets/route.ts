import { NextRequest, NextResponse } from "next/server";
import { getActivePluginWidgets } from "@/lib/plugins";

// GET /api/plugins/widgets - Get widgets from active plugins
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get("position") || undefined;

    const widgets = await getActivePluginWidgets(position);

    return NextResponse.json(
      { widgets },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching plugin widgets:", error);
    return NextResponse.json({ widgets: [] });
  }
}
