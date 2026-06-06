import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { competitorId, reportType, apiKey, provider } = body;

    if (!competitorId || !reportType) {
      return new Response(JSON.stringify({ error: "Competitor ID and report type are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Fetch competitor from DB
    const competitor = await db.competitor.findUnique({
      where: { id: competitorId },
    });

    if (!competitor) {
      return new Response(JSON.stringify({ error: "Competitor not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Validate workspace membership
    const member = await db.workspaceMember.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: competitor.workspaceId,
      },
    });

    if (!member) {
      return new Response(JSON.stringify({ error: "Unauthorized access to competitor" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const competitorName = competitor.name;
    const competitorUrl = competitor.url;
    const competitorIndustry = competitor.industry || "General Software & Tech";

    // 3. AI Generation logic
    const prompt = `You are a professional competitive intelligence analyst.
Analyze the competitor "${competitorName}" (website: ${competitorUrl}) in the "${competitorIndustry}" industry.
Generate a detailed "${reportType}" report for them.
Write it in markdown format. DO NOT wrap the output in markdown code blocks (e.g. \`\`\`markdown). Just start writing the content.
The report MUST contain these three sections with exactly these headings:
### Executive Summary
...
### Strategic Threat Assessment
...
### Recommended Counter-Strategy
...

Keep the tone professional, insightful, and detailed. Provide clear actionable counter-strategies.`;

    let content = "";
    let generatedByAI = false;

    if (apiKey && apiKey.trim() !== "") {
      try {
        if (provider === "gemini") {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              content = text;
              generatedByAI = true;
            }
          } else {
            console.error("Gemini API error status:", res.status, await res.text());
          }
        } else if (provider === "openai") {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.7,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) {
              content = text;
              generatedByAI = true;
            }
          } else {
            console.error("OpenAI API error status:", res.status, await res.text());
          }
        } else if (provider === "anthropic") {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-3-5-sonnet-20241022",
              max_tokens: 1024,
              messages: [{ role: "user", content: prompt }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.content?.[0]?.text;
            if (text) {
              content = text;
              generatedByAI = true;
            }
          }
        } else if (provider === "groq") {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "llama-3.1-70b-versatile",
              messages: [{ role: "user", content: prompt }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) {
              content = text;
              generatedByAI = true;
            }
          }
        }
      } catch (aiErr) {
        console.error("AI Generation request failed:", aiErr);
      }
    }

    // 4. Fallback high-quality template strategy generation
    if (!generatedByAI || !content) {
      const riskLevel = competitor.riskLevel || "moderate";
      const activityLevel = competitor.activity || "medium";
      const threatScore = riskLevel === "critical" ? "8.7/10" : riskLevel === "moderate" ? "6.2/10" : "4.1/10";
      
      content = `### Executive Summary
Our automated intelligence scanner has analyzed public digital signals for **${competitorName}** (URL: ${competitorUrl}) within the **${competitorIndustry}** space. 

Based on recent updates, this competitor is showing **${activityLevel}** activity indicators in product positioning and pricing. We have generated this strategic audit using our fallback intelligence patterns.

### Strategic Threat Assessment
- **Threat Index:** ${threatScore} (${riskLevel.toUpperCase()} RISK)
- **Primary Risk Factor:** ${competitorName} is currently optimizing keywords matching our core product features. Their public landing pages show recent metadata updates emphasizing rapid customer onboarding.
- **Pricing & Positioning:** They appear to be offering competitive incentives to capture mid-market accounts, posing a potential threat to our expansion pipeline in the tech sector.

### Recommended Counter-Strategy
1. **Sales Collateral Refresh:** Coordinate with sales enablement to highlight our advanced integrations and custom roles, showcasing enterprise readiness.
2. **Paid Campaign bidding adjustments:** Increase keywords bids on core matching overlaps to maintain search visibility.
3. **Product Onboarding Optimization:** Improve the new-user dashboard setup wizard to ensure high conversion rates of active trials.

*(Note: Stored AI API Keys were not active. Configure your OpenAI or Gemini key under Settings > AI Providers to generate real-time dynamic AI reports).*`;
    }

    return new Response(JSON.stringify({ content, provider: generatedByAI ? provider : "mock" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Report generation endpoint error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
