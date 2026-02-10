import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, radarData, practiceHistory, currentSummary } = await req.json();

    const prompt = `你是一位资深企业培训专家和AI教学分析师。请根据以下学员的练习数据，生成一份结构化的能力诊断报告。

学员：${studentName}

能力雷达数据：
${radarData.map((r: any) => `- ${r.skill}：当前${r.current}分，标准${r.standard}分，差距${r.current - r.standard}分`).join('\n')}

练习历史：
${practiceHistory.map((p: any) => `- ${p.title}（${p.date}）：${p.score}分 | 亮点：${p.highlights.join('、')} | 不足：${p.lowlights.join('、')} | AI点评：${p.aiComment}`).join('\n')}

请以JSON格式输出诊断报告，包含以下字段：
{
  "overallAssessment": "一段50字以内的总体评价",
  "gradeReason": "AI评级依据说明（30字以内）",
  "strengthAnalysis": [
    { "skill": "能力名称", "detail": "具体分析（30字以内）", "evidence": "基于哪次练习的证据" }
  ],
  "weaknessAnalysis": [
    { "skill": "能力名称", "detail": "具体分析（30字以内）", "priority": "high/medium/low", "improvementPlan": "改进建议（40字以内）" }
  ],
  "learningPath": [
    { "step": 1, "title": "学习内容标题", "type": "knowledge/practice/scenario", "reason": "推荐理由（20字以内）", "estimatedHours": 2 }
  ],
  "behaviorTags": [
    { "tag": "标签名", "sentiment": "positive/negative/neutral" }
  ],
  "riskLevel": "low/medium/high",
  "riskReason": "风险说明（30字以内）",
  "nextMilestone": "下一个成长里程碑建议（30字以内）"
}

只输出JSON，不要输出其他内容。`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const diagnosis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ success: true, diagnosis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI diagnosis error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
