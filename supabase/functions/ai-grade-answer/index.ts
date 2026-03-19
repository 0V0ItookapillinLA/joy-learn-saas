import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, standardAnswer, studentAnswer, maxScore } = await req.json();

    if (!question || !studentAnswer) {
      throw new Error("缺少必填字段: question, studentAnswer");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `你是一个严格但公正的考试批改老师。

题目：${question}
${standardAnswer ? `参考答案：${standardAnswer}` : ""}
学员回答：${studentAnswer}
满分：${maxScore || 10}

请评分并给出反馈。返回JSON格式：
{
  "score": 数字(0-${maxScore || 10}),
  "feedback": "评语(50字以内)",
  "keyPointsHit": ["命中的要点"],
  "keyPointsMissed": ["遗漏的要点"],
  "grade": "优秀/良好/及格/不及格"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "你是考试批改助手，返回严格的JSON格式结果。" },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "评分服务繁忙，请稍后重试" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度不足" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let grading = { score: 0, feedback: "评分失败", keyPointsHit: [], keyPointsMissed: [], grade: "不及格" };

    if (jsonMatch) {
      try {
        grading = JSON.parse(jsonMatch[0]);
      } catch {
        console.error("Failed to parse grading JSON:", content);
      }
    }

    return new Response(
      JSON.stringify({ success: true, grading }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI grading error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
