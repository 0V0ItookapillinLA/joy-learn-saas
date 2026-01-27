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
你需要根据用户的输入，生成一个包含"学、练、考"三个维度的完整培训计划。

请按照以下JSON格式返回培训计划：
{
  "title": "培训计划标题",
  "description": "培训计划简介",
  "targetAudience": "目标学员群体",
  "objectives": "培训目标详细描述",
  "duration": "预计总时长(如：3天 / 5小时)",
  "chapters": [
    {
      "title": "第1章：章节标题",
      "items": [
        {
          "title": "课程内容标题",
          "type": "lesson",
          "contentType": "video",
          "duration": "30分钟",
          "description": "课程内容描述"
        },
        {
          "title": "AI对练场景标题",
          "type": "practice",
          "contentType": "ai_dialogue",
          "duration": "20分钟",
          "description": "练习场景描述"
        },
        {
          "title": "考核标题",
          "type": "assessment",
          "contentType": "quiz",
          "duration": "15分钟",
          "description": "考核内容描述"
        }
      ]
    }
  ],
  "skillsTargeted": ["目标技能1", "目标技能2"],
  "successCriteria": "成功标准描述"
}

章节内容类型说明：
- type值: "lesson"(学习), "practice"(练习), "assessment"(考核)
- contentType值: 
  - lesson时: "video"(视频), "pdf"(PDF文档), "article"(图文)
  - practice时: "ai_dialogue"(AI对练), "scenario"(情景模拟)
  - assessment时: "quiz"(理论问卷), "scenario"(情景模拟)

设计原则：
1. 每个章节应包含2-5个内容项，体现"学-练-考"的闭环设计
2. 课程内容要循序渐进，从基础到进阶
3. 每个知识点后配套相应的练习场景
4. 练习场景要贴近实际工作场景，具有实操性
5. 考核覆盖关键知识点，难度适中
6. 时长安排合理，考虑学员注意力

请确保返回有效的JSON格式，不要包含任何其他说明文字。`;

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

    // Safely read response body
    const responseText = await response.text();
    console.log('AI response received, length:', responseText.length);
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from AI gateway');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI gateway response:', parseError);
      console.error('Response text preview:', responseText.substring(0, 500));
      throw new Error('Invalid JSON response from AI gateway');
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('No content in AI response. Full response:', JSON.stringify(data).substring(0, 500));
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
      console.error('Failed to parse AI content as JSON:', parseError);
      console.error('Content preview:', content.substring(0, 500));
      
      // Attempt to repair truncated JSON
      const lastBrace = content.lastIndexOf("}");
      if (lastBrace > 0) {
        try {
          const repairedContent = content.substring(0, lastBrace + 1);
          trainingPlan = JSON.parse(repairedContent);
          console.log('Successfully repaired truncated JSON');
        } catch {
          trainingPlan = { rawContent: content, parseError: true };
        }
      } else {
        trainingPlan = { rawContent: content, parseError: true };
      }
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
