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
    const { title, knowledgeBaseId, questionCount, questionTypes, description } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const typeMap: Record<string, string> = {
      single_choice: "单选题（4个选项，1个正确答案）",
      multiple_choice: "多选题（4个选项，2-3个正确答案）",
      true_false: "判断题（正确/错误）",
      fill_blank: "填空题（1个正确答案）",
      short_answer: "问答题（需要详细回答）",
    };

    const typesDescription = (questionTypes || ["single_choice"]).map((t: string) => typeMap[t] || t).join("、");

    const systemPrompt = `你是一个专业的考试出题专家。根据提供的信息生成高质量的考试题目。
要求：
1. 题目数量：${questionCount || 20}
2. 题目类型包含：${typesDescription}
3. 题目难度分布：简单30%、中等50%、困难20%
4. 每题分值合理分配，总分100分
5. 题目内容专业、表述清晰
请使用tool call返回结构化数据。`;

    const userPrompt = `请为以下考试生成题目：
**试卷名称**: ${title || "考试"}
**描述**: ${description || "综合能力考核"}
**知识库**: ${knowledgeBaseId || "通用知识"}

请生成 ${questionCount || 20} 道题目。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_questions",
            description: "Generate exam questions",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      type: { type: "string", enum: ["single_choice", "multiple_choice", "true_false", "fill_blank", "short_answer"] },
                      title: { type: "string" },
                      options: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            text: { type: "string" },
                            isCorrect: { type: "boolean" },
                          },
                          required: ["id", "text", "isCorrect"],
                        },
                      },
                      correctAnswer: { type: "string" },
                      score: { type: "number" },
                      explanation: { type: "string" },
                    },
                    required: ["id", "type", "title", "score"],
                  },
                },
              },
              required: ["questions"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "请求过于频繁" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI额度已用完" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI未返回结构化数据");

    const result = JSON.parse(toolCall.function.arguments);
    const questions = (result.questions || []).map((q: any, idx: number) => ({
      id: q.id || String(idx + 1),
      type: q.type || "single_choice",
      title: q.title || "",
      options: q.options || [],
      correctAnswer: q.correctAnswer || "",
      score: q.score || 5,
      explanation: q.explanation || "",
    }));

    return new Response(JSON.stringify({ success: true, questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-exam-questions error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "生成失败" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
