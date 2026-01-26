import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingPlanRequest {
  prompt: string;
  targetAudience?: string;
  trainingGoals?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, targetAudience, trainingGoals }: TrainingPlanRequest = await req.json();
    
    console.log('Received request:', { prompt, targetAudience, trainingGoals });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `你是一位专业的企业培训课程设计专家，专注于为企业创建完整的培训计划。
你需要根据用户的输入，生成一个包含"教、练、考"三个维度的完整培训计划。

请按照以下JSON格式返回培训计划：
{
  "title": "培训计划标题",
  "description": "培训计划简介",
  "targetAudience": "目标学员群体",
  "objectives": "培训目标",
  "duration": "预计总时长",
  "chapters": [
    {
      "title": "章节标题",
      "type": "lesson|practice|assessment",
      "description": "章节描述",
      "duration": "预计时长(分钟)",
      "content": {
        // 根据类型不同，内容结构不同
        // lesson: { outline: ["知识点1", "知识点2"], resources: ["资源1"] }
        // practice: { scenario: "场景描述", objectives: ["练习目标"], aiRole: "AI扮演角色", traineeRole: "学员扮演角色" }
        // assessment: { questions: [{ question: "题目", options: ["A", "B", "C", "D"], answer: "A", explanation: "解析" }] }
      }
    }
  ],
  "skillsTargeted": ["目标技能1", "目标技能2"],
  "prerequisites": ["前置要求"],
  "successCriteria": "成功标准"
}

设计原则：
1. 课程内容要循序渐进，从基础到进阶
2. 每个知识点后配套相应的练习场景
3. 练习场景要贴近实际工作场景，具有实操性
4. 考核题目要覆盖关键知识点，难度适中
5. 整体结构要体现"学-练-考"的闭环设计
6. 时长安排要合理，考虑学员的注意力和学习效率

请确保返回有效的JSON格式。`;

    const userMessage = targetAudience || trainingGoals 
      ? `培训对象：${targetAudience || '未指定'}\n培训目标：${trainingGoals || '未指定'}\n\n用户需求：${prompt}`
      : prompt;

    console.log('Sending request to AI gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: '请求过于频繁，请稍后再试' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI服务配额已用尽，请联系管理员' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Try to parse the JSON from the response
    let trainingPlan;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      trainingPlan = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return raw content if parsing fails
      trainingPlan = { rawContent: content, parseError: true };
    }

    return new Response(
      JSON.stringify({ success: true, plan: trainingPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating training plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
