import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCountryLocale } from "@/lib/countries";

// Reusable LLM caller
async function callLLM({
  provider,
  model,
  apiKey,
  prompt,
}: {
  provider: string;
  model: string;
  apiKey: string;
  prompt: string;
}): Promise<string> {
  if (!apiKey || apiKey.trim() === "") return "";
  try {
    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      }
    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.choices?.[0]?.message?.content || "";
      }
    }
  } catch (err) {
    console.error("Cron LLM request failed:", err);
  }
  return "";
}

// Fetch Google News RSS headlines (free, regional, keyless)
async function fetchCompetitorNews(name: string, country: string): Promise<string[]> {
  const geo = getCountryLocale(country || "global");
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(name)}&hl=${geo.hl}&gl=${geo.gl}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const xml = await res.text();
    
    // Extract titles using regex
    const titles: string[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    
    let match;
    let limit = 0;
    while ((match = itemRegex.exec(xml)) !== null && limit < 5) {
      const itemXml = match[1];
      const titleMatch = titleRegex.exec(itemXml);
      if (titleMatch && titleMatch[1]) {
        titles.push(titleMatch[1].trim());
      }
      limit++;
    }
    return titles;
  } catch (err) {
    console.error(`Failed to fetch regional news for ${name}:`, err);
    return [];
  }
}

// Helper to scrape clean text from competitor URL
async function crawlCompetitorSite(url: string): Promise<string> {
  const targetUrl = url.startsWith("http") ? url : `https://${url}`;
  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return "";
    const html = await res.text();
    // Strip scripts and styles
    const clean = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return clean.slice(0, 3000); // Send first 3000 characters to LLM
  } catch (err) {
    console.error(`Failed to crawl url ${targetUrl}:`, err);
    return "";
  }
}

export async function GET(req: Request) {
  try {
    // 1. Verify Vercel Cron Security Guard
    const authHeader = req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (process.env.NODE_ENV === "production" && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return new Response(JSON.stringify({ error: "Unauthorized cron trigger" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 2. Fetch all competitors from database
    const competitors = await db.competitor.findMany({
      include: { workspace: true }
    });

    if (competitors.length === 0) {
      return NextResponse.json({ message: "No tracked competitors found." }, { status: 200 });
    }

    const processed = [];

    // 3. Loop and evaluate competitor signals
    for (const comp of competitors) {
      // Fetch news headlines and website crawled text
      const headlines = await fetchCompetitorNews(comp.name, comp.country || "global");
      const crawledText = await crawlCompetitorSite(comp.url);

      const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
      const provider = process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "";
      const model = provider === "gemini" ? "gemini-3.5-flash-high" : "gpt-4o-mini";

      if (apiKey && provider) {
        // Construct analysis prompt
        const prompt = `You are a background crawler agent.
Analyze the crawled signals for competitor "${comp.name}" (Country: ${comp.country || "global"}):
Website crawled content snippet:
---
${crawledText || "Unavailable"}
---
Regional news headlines detected:
${headlines.length > 0 ? headlines.map(h => `- ${h}`).join("\n") : "None found"}
---

Did they make any major strategic changes? (e.g. pricing edits, funding, acquisition, leadership hires, product feature release).
If YES, you must output exactly one JSON object with the fields:
"hasChange": true,
"alertTitle": "Brief notification title",
"insightTitle": "Brief insight title",
"insightContent": "Detailed strategic explanation of the change",
"insightCategory": "threat" or "opportunity",
"recommendation": "Actionable counter-strategy recommendations for our team"

If NO changes or updates were detected, return exactly:
{"hasChange": false}`;

        const output = await callLLM({ provider, model, apiKey, prompt });
        try {
          // Parse JSON from output
          const cleanOutput = output.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanOutput);

          if (parsed.hasChange) {
            // Save Alert to Supabase
            const newAlert = await db.alert.create({
              data: {
                competitorId: comp.id,
                type: "pending",
                status: "Pending",
                title: parsed.alertTitle,
                message: parsed.insightContent
              }
            });

            // Save Insight to Supabase
            await db.insight.create({
              data: {
                competitorId: comp.id,
                category: parsed.insightCategory,
                title: parsed.insightTitle,
                content: parsed.insightContent,
                recommendation: parsed.recommendation
              }
            });

            processed.push({ competitor: comp.name, alert: parsed.alertTitle });
          }
        } catch (jsonErr) {
          console.error(`JSON Parse error evaluating LLM results for ${comp.name}:`, output, jsonErr);
        }
      }
    }

    return NextResponse.json({ message: "Background check complete.", processed }, { status: 200 });
  } catch (err: any) {
    console.error("Cron route general exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
