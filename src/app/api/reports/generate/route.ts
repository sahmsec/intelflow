import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { getCountryLocale } from "@/lib/countries";

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
      } else {
        console.error(`Gemini API error (${model}):`, res.status, await res.text());
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
      } else {
        console.error(`OpenAI API error (${model}):`, res.status, await res.text());
      }
    } else if (provider === "anthropic") {
      const apiModel = model === "claude-3-5-sonnet" ? "claude-3-5-sonnet-20241022" 
                     : model === "claude-3-opus" ? "claude-3-opus-20240229" 
                     : model === "claude-4.6-sonnet" ? "claude-3-5-sonnet-20241022"
                     : model === "claude-4.8-opus" ? "claude-3-opus-20240229"
                     : model;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: apiModel,
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.content?.[0]?.text || "";
      } else {
        console.error(`Anthropic API error (${model}):`, res.status, await res.text());
      }
    } else if (provider === "groq") {
      const apiModel = model === "llama-3.1-70b" ? "llama-3.1-70b-versatile"
                     : model === "mixtral-8x7b" ? "mixtral-8x7b-32768"
                     : model === "llama-4-maverick" ? "llama-3.1-70b-versatile"
                     : model;
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: apiModel,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data?.choices?.[0]?.message?.content || "";
      } else {
        console.error(`Groq API error (${model}):`, res.status, await res.text());
      }
    }
  } catch (err) {
    console.error(`LLM Call failed for ${provider} (${model}):`, err);
  }
  return "";
}

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
    const { competitorId, reportType, apiKey: clientApiKey, provider: clientProvider, model: clientModel, mode: clientMode, apiKeys } = body;

    const mode = clientMode || "single";

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

    // Resolve keys
    const geminiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
    const openaiKey = apiKeys?.openai || process.env.OPENAI_API_KEY;
    const anthropicKey = apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY;
    const groqKey = apiKeys?.groq || process.env.GROQ_API_KEY;

    let content = "";
    let generatedByAI = false;
    let actualProviderUsed = "mock";

    // Fetch live crawler signals and news headlines
    const headlines = await fetchCompetitorNews(competitorName, competitor.country || "global");
    const crawledText = await crawlCompetitorSite(competitorUrl);

    if (mode === "consensus") {
      // Consensus Pipeline
      // Determine what keys are active for fallback
      const activeKeys = {
        gemini: geminiKey && geminiKey.trim() !== "",
        openai: openaiKey && openaiKey.trim() !== "",
        anthropic: anthropicKey && anthropicKey.trim() !== "",
        groq: groqKey && groqKey.trim() !== "",
      };

      if (activeKeys.gemini || activeKeys.openai || activeKeys.anthropic || activeKeys.groq) {
        // Resolve agents configuration based on key availability using real production models
        const explorer = activeKeys.gemini ? { provider: "gemini", model: "gemini-3.5-flash-high", key: geminiKey }
                        : activeKeys.openai ? { provider: "openai", model: "gpt-4o-mini", key: openaiKey }
                        : activeKeys.anthropic ? { provider: "anthropic", model: "claude-3-5-sonnet", key: anthropicKey }
                        : { provider: "groq", model: "llama-3.1-70b", key: groqKey };

        const critic = activeKeys.anthropic ? { provider: "anthropic", model: "claude-3-5-sonnet", key: anthropicKey }
                      : activeKeys.openai ? { provider: "openai", model: "gpt-4o", key: openaiKey }
                      : activeKeys.gemini ? { provider: "gemini", model: "gemini-3.1-pro-high", key: geminiKey }
                      : { provider: "groq", model: "llama-3.1-70b", key: groqKey };

        const director = activeKeys.openai ? { provider: "openai", model: "gpt-4o", key: openaiKey }
                        : activeKeys.gemini ? { provider: "gemini", model: "gemini-3.1-pro-high", key: geminiKey }
                        : activeKeys.anthropic ? { provider: "anthropic", model: "claude-3-5-sonnet", key: anthropicKey }
                        : { provider: "groq", model: "llama-3.1-70b", key: groqKey };

        try {
          // Stage 1: Explorer performs raw characteristics scrape and draft
          const explorerPrompt = `You are Agent Explorer, an expert competitor landing page scanner.
Analyze the competitor "${competitorName}" (website: ${competitorUrl}) in the "${competitorIndustry}" industry.

Here is the live data we crawled from their website:
---
${crawledText || "No content scraped from site."}
---

Here are the recent regional news headlines we detected for them:
${headlines.length > 0 ? headlines.map(h => `- ${h}`).join("\n") : "No recent news detected."}
---

Extract and summarize their core value proposition, key target demographics, and primary digital signals based on these live inputs. Keep it factual and brief.`;

          const explorerOutput = await callLLM({
            provider: explorer.provider,
            model: explorer.model,
            apiKey: explorer.key,
            prompt: explorerPrompt,
          });

          if (explorerOutput && explorerOutput.trim() !== "") {
            // Stage 2: Critic reviews, challenges positioning assumptions, and estimates threat level
            const criticPrompt = `You are Agent Critic, a senior strategic analyst.
Review the following Explorer signals draft for competitor "${competitorName}":
---
${explorerOutput}
---
Perform a critical threat analysis. Challenge any weak assumptions. Identify hidden opportunities or aggressive tactics they might use to win market share from us.`;

            const criticOutput = await callLLM({
              provider: critic.provider,
              model: critic.model,
              apiKey: critic.key,
              prompt: criticPrompt,
            });

            // Stage 3: Director synthesizes inputs into the final Markdown Brief
            const directorPrompt = `You are Agent Director, a corporate strategy editor.
Review the original Explorer facts and the Critic's strategic assessment for competitor "${competitorName}":
Explorer Facts:
---
${explorerOutput}
---
Critic Strategic Assessment:
---
${criticOutput || "No critical critiques found."}
---

Generate a detailed "${reportType}" brief in clean markdown format. Do NOT wrap output in markdown code blocks.
The final brief MUST contain exactly these three sections:
### Executive Summary
...
### Strategic Threat Assessment
...
### Recommended Counter-Strategy
...`;

            const finalReport = await callLLM({
              provider: director.provider,
              model: director.model,
              apiKey: director.key,
              prompt: directorPrompt,
            });

            if (finalReport && finalReport.trim() !== "") {
              content = finalReport;
              generatedByAI = true;
              actualProviderUsed = "consensus";
            }
          }
        } catch (consensusErr) {
          console.error("Failed executing AI consensus mode pipeline:", consensusErr);
        }
      }
    } else {
      // Single Model Mode
      const provider = clientProvider || (geminiKey ? "gemini" : openaiKey ? "openai" : undefined);
      const apiKey = clientApiKey || (provider === "gemini" ? geminiKey : provider === "openai" ? openaiKey : provider === "anthropic" ? anthropicKey : provider === "groq" ? groqKey : undefined);
      const model = clientModel || (provider === "gemini" ? "gemini-3.5-flash-high" : provider === "openai" ? "gpt-4o-mini" : provider === "anthropic" ? "claude-3-5-sonnet" : provider === "groq" ? "llama-3.1-70b" : undefined);

      if (apiKey && apiKey.trim() !== "" && provider && model) {
        const prompt = `You are a professional competitive intelligence analyst.
Analyze the competitor "${competitorName}" (website: ${competitorUrl}) in the "${competitorIndustry}" industry.

Here is the live data we crawled from their website:
---
${crawledText || "No content scraped from site."}
---

Here are the recent regional news headlines we detected for them:
${headlines.length > 0 ? headlines.map(h => `- ${h}`).join("\n") : "No recent news detected."}
---

Generate a detailed "${reportType}" report for them based on these live signals.
Write it in markdown format. DO NOT wrap the output in markdown code blocks (e.g. \`\`\`markdown). Just start writing the content.
The report MUST contain these three sections with exactly these headings:
### Executive Summary
...
### Strategic Threat Assessment
...
### Recommended Counter-Strategy
...

Keep the tone professional, insightful, and detailed. Provide clear actionable counter-strategies.`;

        const singleOutput = await callLLM({
          provider,
          model,
          apiKey,
          prompt,
        });

        if (singleOutput && singleOutput.trim() !== "") {
          content = singleOutput;
          generatedByAI = true;
          actualProviderUsed = provider;
        }
      }
    }


    // 4. Fallback high-quality template strategy generation
    if (!generatedByAI || !content) {
      content = `No API key found. Please configure your API key under Settings > AI Providers.`;
    }


    // 5. Save report to database
    const dbReport = await db.report.create({
      data: {
        title: `${reportType} - ${competitorName}`,
        competitorName,
        type: reportType,
        status: "ready",
        content,
        competitorId,
      },
    });

    return new Response(JSON.stringify({ 
      id: dbReport.id,
      content: dbReport.content, 
      date: "Just now",
      provider: actualProviderUsed 
    }), {
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

