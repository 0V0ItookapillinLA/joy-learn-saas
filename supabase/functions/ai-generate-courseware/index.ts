import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { coursewareId, documents, title, extraPrompt } = await req.json();

    if (!coursewareId || !documents || documents.length === 0) {
      return new Response(JSON.stringify({ error: "Missing coursewareId or documents" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Build knowledge context
    const knowledgeContext = documents
      .map((doc: any, i: number) => {
        const points = Array.isArray(doc.keyPoints)
          ? doc.keyPoints.map((kp: any) => `  - ${kp.title}: ${kp.content}`).join("\n")
          : "";
        return `文档${i + 1}: ${doc.title}\n摘要: ${doc.summary || "无"}\n知识点:\n${points}`;
      })
      .join("\n\n---\n\n");

    const prompt = `你是一个专业的企业培训课程设计专家。请根据以下知识库资料，为课件「${title}」生成详细的课程大纲和讲稿。

${extraPrompt ? `用户额外要求: ${extraPrompt}\n` : ""}

知识库资料:
${knowledgeContext}

请用以下JSON格式返回结果（不要包含markdown代码块标记）:
{
  "outline": [
    {
      "id": "ch_1",
      "title": "章节标题",
      "duration": 10,
      "keyPoints": ["要点1", "要点2"]
    }
  ],
  "scripts": {
    "ch_1": "这是第一章的完整讲稿内容，应该包含详细的讲解文字，可以直接用于数字人录课..."
  }
}

要求:
1. 大纲分3-8个章节，每章5-15分钟
2. 章节间有清晰的逻辑递进关系
3. 每章包含2-5个核心知识要点
4. 讲稿要口语化、生动、适合录制
5. 讲稿中自然融入知识点，不要生硬罗列
6. 开头有导入，结尾有总结`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "你是企业培训课程设计专家。始终返回有效的JSON格式。" },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后重试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度不足，请充值" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabaseAdmin
        .from("ai_courseware")
        .update({ status: "draft" })
        .eq("id", coursewareId);

      return new Response(JSON.stringify({ error: "AI 生成失败" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    let parsed: { outline: any[]; scripts: Record<string, string> };
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { outline: [], scripts: {} };
    }

    // Update courseware record
    await supabaseAdmin
      .from("ai_courseware")
      .update({
        outline: parsed.outline,
        scripts: parsed.scripts,
        status: "ready",
      })
      .eq("id", coursewareId);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-generate-courseware error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
