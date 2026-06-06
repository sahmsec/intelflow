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

    const reports = await db.report.findMany({
      where: {
        competitor: {
          workspaceId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = reports.map((r) => ({
      id: r.id,
      title: r.title,
      competitorName: r.competitorName,
      type: r.type,
      date: r.date,
      status: r.status as 'generating' | 'ready',
      content: r.content || undefined,
      competitorId: r.competitorId,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/reports error:", err);
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
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const report = await db.report.findUnique({
      where: { id },
      include: { competitor: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.competitor.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized to delete this report" }, { status: 403 });
    }

    await db.report.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/reports error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
