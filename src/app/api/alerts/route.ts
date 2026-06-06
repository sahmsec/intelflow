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

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
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

    const alerts = await db.alert.findMany({
      where: {
        competitor: {
          workspaceId,
        },
      },
      include: {
        competitor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = alerts.map((a) => ({
      id: a.id,
      name: a.competitor.name, // maps to competitor name
      date: formatRelativeTime(a.createdAt),
      status: a.status,
      type: a.type as 'pending' | 'done',
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/alerts error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = await getWorkspaceId(session.user.id, session.user.name);
    const body = await req.json().catch(() => ({}));
    const { id, status, type } = body;

    if (!id || !status || !type) {
      return NextResponse.json({ error: "id, status, and type are required" }, { status: 400 });
    }

    const alert = await db.alert.findUnique({
      where: { id },
      include: { competitor: true },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    if (alert.competitor.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Unauthorized to update this alert" }, { status: 403 });
    }

    const updated = await db.alert.update({
      where: { id },
      data: {
        status,
        type,
      },
      include: {
        competitor: true,
      },
    });

    const mapped = {
      id: updated.id,
      name: updated.competitor.name,
      date: formatRelativeTime(updated.createdAt),
      status: updated.status,
      type: updated.type as 'pending' | 'done',
    };

    return NextResponse.json(mapped, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/alerts error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
