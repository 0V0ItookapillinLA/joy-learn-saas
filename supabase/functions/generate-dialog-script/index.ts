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
    const { knowledgeContent, sceneDescription, assessmentDimensions, title } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `你是一个专业的培训对话剧本设计师。根据提供的知识库内容和场景描述，生成结构化的对话练习剧本。

要求：
1. 生成6-10轮对话，交替安排"陪练者说"和"学员说"的轮次
2. 每轮对话包含：角色（companion/trainee）、对话内容、标准回答、关键要点（2-5个）、解析
3. 对话应模拟真实业务场景，循序渐进
4. 关键要点应具体、可评估
5. 解析应说明为什么这样回答是正确的

你必须使用以下JSON格式的tool call来返回结果。`;

    const userPrompt = `请基于以下信息生成对话练习剧本：

**剧本标题**: ${title || '对话练习'}
**场景描述**: ${sceneDescription || '通用业务场景'}
**评估维度**: ${assessmentDimensions ? JSON.stringify(assessmentDimensions) : '专业知识、沟通技巧、应变能力'}

**知识库内容**:
${knowledgeContent || '请根据场景描述自行设计对话内容'}

请生成完整的对话轮次。`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_dialog_turns",
              description: "Generate structured dialog turns for a practice script",
              parameters: {
                type: "object",
                properties: {
                  dialog_turns: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique turn ID like turn_1, turn_2" },
                        speaker: { type: "string", enum: ["companion", "trainee"] },
                        content: { type: "string", description: "What this speaker says" },
                        standard_answer: { type: "string", description: "The ideal/standard response for trainee turns, or empty for companion turns" },
                        key_points: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              content: { type: "string" },
                              required: { type: "boolean" }
                            },
                            required: ["id", "content", "required"]
                          }
                        },
                        analysis: { type: "string", description: "Explanation of why this response is good" },
                        max_attempts: { type: "number", description: "Max attempts for trainee turns, default 3" },
                        sort_order: { type: "number" }
                      },
                      required: ["id", "speaker", "content", "key_points", "analysis", "sort_order"]
                    }
                  },
                  summary: { type: "string", description: "Brief summary of the dialog scenario" }
                },
                required: ["dialog_turns", "summary"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_dialog_turns" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度已用完，请充值后再试" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || "";
      throw new Error("AI未返回结构化数据，请重试");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Normalize dialog_turns
    const normalizedTurns = (result.dialog_turns || []).map((turn: any, idx: number) => ({
      id: turn.id || `turn_${idx + 1}`,
      speaker: turn.speaker || "companion",
      content: turn.content || "",
      standard_answer: turn.standard_answer || "",
      key_points: (turn.key_points || []).map((kp: any, kpIdx: number) => ({
        id: kp.id || `kp_${idx + 1}_${kpIdx + 1}`,
        content: kp.content || "",
        required: kp.required ?? false,
      })),
      analysis: turn.analysis || "",
      flow_condition: { type: "hit_any", min_points: 1 },
      max_attempts: turn.max_attempts || 3,
      sort_order: turn.sort_order ?? idx,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        dialog_turns: normalizedTurns,
        summary: result.summary || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-dialog-script error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "生成失败，请重试" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
