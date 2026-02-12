import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

// Helper to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }
  const allowedRoles = ["ADMIN", "SALES_AGENT", "SUPPORT_AGENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "Forbidden", status: 403 };
  }
  return { session };
}

// Convert value to CSV-safe string
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET - Export leads as CSV
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if ("error" in accessCheck) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.status }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");
    const assignedToId = searchParams.get("assignedToId");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) where.status = status;
    if (source) where.source = source;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch all leads matching criteria
    const leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: {
          select: { name: true, email: true },
        },
        formTemplate: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Define CSV columns
    const columns = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Country",
      "City",
      "Status",
      "Source",
      "Source Detail",
      "Priority",
      "Score",
      "Interested In",
      "Budget",
      "Timeline",
      "Notes",
      "Assigned To",
      "Form",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Created At",
      "Updated At",
      "Last Activity At",
    ];

    // Build CSV rows
    const rows = leads.map((lead) => [
      lead.id,
      lead.firstName,
      lead.lastName || "",
      lead.email,
      lead.phone || "",
      lead.company || "",
      lead.country || "",
      lead.city || "",
      lead.status,
      lead.source,
      lead.sourceDetail || "",
      lead.priority,
      lead.score,
      lead.interestedIn.join(", "),
      lead.budget || "",
      lead.timeline || "",
      lead.notes || "",
      lead.assignedTo?.name || lead.assignedTo?.email || "",
      lead.formTemplate?.name || lead.formTemplateName || "",
      lead.utmSource || "",
      lead.utmMedium || "",
      lead.utmCampaign || "",
      format(lead.createdAt, "yyyy-MM-dd HH:mm:ss"),
      format(lead.updatedAt, "yyyy-MM-dd HH:mm:ss"),
      lead.lastActivityAt ? format(lead.lastActivityAt, "yyyy-MM-dd HH:mm:ss") : "",
    ]);

    // Create CSV content
    const csvContent = [
      columns.join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Return as CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-export-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting leads:", error);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}
