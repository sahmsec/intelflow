import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function getWorkspaceId(userId: string, userName: string): Promise<string> {
  const member = await db.workspaceMember.findFirst({
    where: { userId },
  });

  if (member) {
    return member.workspaceId;
  }

  // Lazy initialize workspace if it doesn't exist
  const newWorkspace = await db.workspace.create({
    data: {
      name: `${userName}'s Workspace`,
      members: {
        create: {
          userId,
          role: "owner",
        },
      },
    },
  });

  return newWorkspace.id;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(session.user.id, session.user.name);

    const competitors = await db.competitor.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    // Map db riskLevel to frontend risk key
    const mapped = competitors.map((c) => ({
      id: c.id,
      name: c.name,
      url: c.url,
      activity: c.activity,
      trend: c.trend,
      risk: c.riskLevel, // maps db's riskLevel to frontend's risk
      logo: c.logoUrl || c.name.charAt(0).toUpperCase(),
      country: c.country || "global",
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/competitors error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(session.user.id, session.user.name);
    const body = await req.json().catch(() => ({}));
    const { name, url, country } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
    }

    const competitor = await db.competitor.create({
      data: {
        name,
        url,
        country: country || "global",
        logoUrl: name.charAt(0).toUpperCase(),
        riskLevel: "low",
        activity: "low",
        trend: "stable",
        workspaceId,
      },
    });

    const mapped = {
      id: competitor.id,
      name: competitor.name,
      url: competitor.url,
      activity: competitor.activity,
      trend: competitor.trend,
      risk: competitor.riskLevel,
      logo: competitor.logoUrl || competitor.name.charAt(0).toUpperCase(),
      country: competitor.country || "global",
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/competitors error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(session.user.id, session.user.name);
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Competitor ID is required" }, { status: 400 });
    }

    const competitor = await db.competitor.findUnique({
      where: { id },
    });

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    if (competitor.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized to delete this competitor" }, { status: 403 });
    }

    await db.competitor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/competitors error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
