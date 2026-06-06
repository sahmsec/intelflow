import { NextResponse } from "next/server";
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

    const insights = await db.insight.findMany({
      where: {
        competitor: {
          workspaceId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = insights.map((i) => ({
      id: i.id,
      category: i.category as 'threat' | 'opportunity' | 'neutral',
      title: i.title,
      content: i.content,
      recommendation: i.recommendation || "",
      time: formatRelativeTime(i.createdAt),
      competitorId: i.competitorId,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/insights error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
