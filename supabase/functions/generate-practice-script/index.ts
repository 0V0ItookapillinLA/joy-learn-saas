import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PracticeScriptRequest {
  prompt: string;
  practiceMode?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, practiceMode }: PracticeScriptRequest = await req.json();
    
    console.log('Received practice script request:', { prompt, practiceMode });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `你是一位专业的企业培训场景设计专家，专注于为企业设计AI对话练习场景。
你需要根据用户的输入，生成一个完整的AI对话练习剧本。

请严格按照以下JSON格式返回练习剧本（不要包含任何其他文字说明）：
{
  "title": "练习标题（简洁明了，不超过20字）",
  "description": "练习描述（简短说明培训目的和适用场景，50字以内）",
  "scenarioDescription": "练习场景目标（描述学员在这个场景中需要达成的目标，如：学会倾听客户诉求，提供解决方案，维护客户关系，提升客户满意度）",
  "aiRoleName": "AI角色名称（如：愤怒的客户王先生）",
  "aiRoleInfo": "AI角色详细信息（包括姓名、职位、性格特点、背景故事、情绪状态等，100字以内）",
  "traineeRole": "学员角色设置（描述学员扮演的角色及其职责，如：客服专员，负责处理客户投诉）",
  "dialogueGoal": "对话训练目标（包含练习目标和评估要点，如：练习目标：基于客户需求设定 评估要点：-沟通技巧运用-专业知识掌握-问题解决能力）",
  "assessmentItems": [
    { "name": "考察项名称1", "weight": 25 },
    { "name": "考察项名称2", "weight": 25 },
    { "name": "考察项名称3", "weight": 25 },
    { "name": "考察项名称4", "weight": 25 }
  ]
}

设计原则：
1. 场景要贴近真实工作环境，具有实操性
2. AI角色要有明确的性格特点和行为模式
3. 学员角色要有清晰的职责定位
4. 对话目标要可量化、可评估
5. 考察项要覆盖沟通、专业、应变等多个维度
6. 考察项权重总和必须为100

请确保返回有效的JSON格式，不要包含任何其他说明文字。`;

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
          { role: 'user', content: `请为以下场景生成一个完整的AI对话练习剧本：\n\n${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    let practiceScript;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      practiceScript = JSON.parse(jsonStr);
      
      // Validate and normalize assessment items
      if (practiceScript.assessmentItems && Array.isArray(practiceScript.assessmentItems)) {
        practiceScript.assessmentItems = practiceScript.assessmentItems.map((item: any, index: number) => ({
          id: String(index + 1),
          name: item.name || `考察项${index + 1}`,
          weight: Number(item.weight) || 25,
        }));
      } else {
        practiceScript.assessmentItems = [
          { id: "1", name: "沟通表达能力", weight: 25 },
          { id: "2", name: "专业知识运用", weight: 25 },
          { id: "3", name: "问题解决能力", weight: 25 },
          { id: "4", name: "情绪管理能力", weight: 25 },
        ];
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw content:', content);
      // Return default structured content
      practiceScript = {
        title: prompt.slice(0, 20),
        description: `培训场景：${prompt.slice(0, 50)}`,
        scenarioDescription: "目标：学会倾听客户诉求，提供解决方案，维护客户关系，提升客户满意度",
        aiRoleName: "模拟客户",
        aiRoleInfo: "一位需要帮助的客户，有一定的情绪但愿意沟通",
        traineeRole: "客服专员，负责处理客户咨询和投诉",
        dialogueGoal: "练习目标：基于客户需求设定 评估要点：-沟通技巧运用-专业知识掌握-问题解决能力",
        assessmentItems: [
          { id: "1", name: "沟通表达能力", weight: 25 },
          { id: "2", name: "专业知识运用", weight: 25 },
          { id: "3", name: "问题解决能力", weight: 25 },
          { id: "4", name: "情绪管理能力", weight: 25 },
        ],
        parseError: true
      };
    }

    return new Response(
      JSON.stringify({ success: true, script: practiceScript }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating practice script:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
