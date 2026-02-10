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
    const { documentId, fileUrl, fileName } = await req.json();

    if (!documentId || !fileUrl) {
      return new Response(JSON.stringify({ error: "Missing documentId or fileUrl" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Fetch file content (for text-based files) or use URL for AI
    let fileContent = "";
    try {
      const fileResp = await fetch(fileUrl);
      if (fileResp.ok) {
        const contentType = fileResp.headers.get("content-type") || "";
        if (contentType.includes("text") || fileName?.endsWith(".txt") || fileName?.endsWith(".md")) {
          fileContent = await fileResp.text();
        } else {
          // For binary files, we'll pass the URL to AI and ask it to analyze based on filename
          fileContent = `[文件名: ${fileName}, 文件类型: ${contentType}, 文件URL: ${fileUrl}]`;
        }
      }
    } catch {
      fileContent = `[无法读取文件内容, 文件名: ${fileName}]`;
    }

    const prompt = `你是一个专业的企业培训知识提取助手。请分析以下培训资料，提取关键信息。

文件名：${fileName || "未知"}
内容：
${fileContent.slice(0, 15000)}

请用以下JSON格式返回结果（不要包含markdown代码块标记）：
{
  "summary": "200字以内的文档摘要",
  "keyPoints": [
    {
      "title": "知识点标题",
      "content": "知识点详细内容",
      "category": "分类(话术/流程/产品/方法论)"
    }
  ]
}

要求：
1. 摘要简明扼要，突出核心主题
2. 知识点提取3-10个最重要的要点
3. 每个知识点的content应该包含足够的细节，可以独立使用
4. 如果文件内容不可读，请基于文件名推测可能的内容并给出通用知识点`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "你是企业培训领域的知识提取专家。始终返回有效的JSON格式。" },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      
      await supabaseAdmin
        .from("knowledge_documents")
        .update({ status: "error" })
        .eq("id", documentId);

      return new Response(JSON.stringify({ error: "AI parsing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse AI response
    let parsed: { summary: string; keyPoints: any[] };
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { summary: rawContent.slice(0, 500), keyPoints: [] };
    }

    // Update document
    await supabaseAdmin
      .from("knowledge_documents")
      .update({
        ai_summary: parsed.summary,
        ai_key_points: parsed.keyPoints,
        status: "ready",
      })
      .eq("id", documentId);

    return new Response(JSON.stringify({ success: true, summary: parsed.summary, keyPoints: parsed.keyPoints }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-parse-document error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
