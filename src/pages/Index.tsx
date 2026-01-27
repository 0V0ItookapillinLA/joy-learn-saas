import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Loader2, BookOpen, MessageSquare, ClipboardCheck, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GeneratedPlanEditor, type GeneratedPlanData, type Chapter, type ContentItem } from '@/components/training/GeneratedPlanEditor';
import { GenerationProgress } from '@/components/training/GenerationProgress';
import { KnowledgeConfirmation, type DiscoveredContext } from '@/components/training/KnowledgeConfirmation';

type GenerationPhase = 'input' | 'searching' | 'confirming' | 'generating' | 'results';

const EXAMPLE_PROMPTS = [
  "为新入职销售人员设计一套客户沟通技巧培训，包含电话销售和面对面拜访场景",
  "给客服团队设计投诉处理培训，要求有大量实战演练",
  "为项目经理设计敏捷开发方法论培训，需要包含Scrum实践考核",
  "设计一套新员工入职培训，涵盖公司文化、制度流程和岗位技能"
];

// Transform API response to editor format
function transformToEditorFormat(apiPlan: any): GeneratedPlanData {
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | null = null;

  // Group items into chapters based on the API response
  if (apiPlan.chapters && Array.isArray(apiPlan.chapters)) {
    apiPlan.chapters.forEach((chapter: any, index: number) => {
      const chapterId = `chapter-${index}`;
      
      // If the chapter has nested content items, use them
      if (chapter.items && Array.isArray(chapter.items)) {
        chapters.push({
          id: chapterId,
          title: chapter.title || `第${index + 1}章`,
          items: chapter.items.map((item: any, itemIndex: number) => ({
            id: `${chapterId}-item-${itemIndex}`,
            title: item.title || item.name || '未命名内容',
            type: item.type || 'lesson',
            contentType: item.contentType || (item.type === 'lesson' ? 'video' : item.type === 'practice' ? 'ai_dialogue' : 'quiz'),
            duration: item.duration,
            description: item.description,
          })),
        });
      } else {
        // Treat each chapter as an item (flat structure from API)
        if (!currentChapter || chapters.length === 0 || (index % 3 === 0 && index > 0)) {
          currentChapter = {
            id: `chapter-${chapters.length}`,
            title: `第${chapters.length + 1}章：${chapter.title?.split('：')[0] || '培训模块'}`,
            items: [],
          };
          chapters.push(currentChapter);
        }
        
        currentChapter.items.push({
          id: `item-${index}`,
          title: chapter.title || '未命名内容',
          type: chapter.type || 'lesson',
          contentType: chapter.type === 'lesson' ? 'video' : chapter.type === 'practice' ? 'ai_dialogue' : 'quiz',
          duration: chapter.duration,
          description: chapter.description,
        });
      }
    });
  }

  // If no chapters were created, create a default structure
  if (chapters.length === 0) {
    chapters.push({
      id: 'chapter-1',
      title: '第1章：培训内容',
      items: [
        { id: 'item-1', title: '课程介绍', type: 'lesson', contentType: 'video' },
        { id: 'item-2', title: 'AI对练', type: 'practice', contentType: 'ai_dialogue' },
        { id: 'item-3', title: '理论测验', type: 'assessment', contentType: 'quiz' },
      ],
    });
  }

  return {
    title: apiPlan.title || '培训计划',
    description: apiPlan.description || '',
    targetAudience: apiPlan.targetAudience || '',
    objectives: apiPlan.objectives || '',
    duration: apiPlan.duration || '',
    chapters,
    skillsTargeted: apiPlan.skillsTargeted || [],
  };
}

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<GenerationPhase>('input');
  const [searchProgress, setSearchProgress] = useState(0);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [discoveredContext, setDiscoveredContext] = useState<DiscoveredContext | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanData | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (textareaRef.current && phase === 'input') {
      textareaRef.current.focus();
    }
  }, [phase]);

  // 模拟搜索进度动画
  const simulateSearchProgress = useCallback(() => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          setSearchProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setSearchProgress(Math.min(progress, 95));
        }
      }, 400);
    });
  }, []);

  // 模拟生成进度动画
  const simulateGenerateProgress = useCallback(() => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10 + 3;
        if (progress >= 100) {
          setGenerateProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setGenerateProgress(Math.min(progress, 95));
        }
      }, 500);
    });
  }, []);

  // 生成模拟的发现上下文
  const generateDiscoveredContext = useCallback((promptText: string): DiscoveredContext => {
    // 从prompt中提取关键词来生成相关的上下文
    const isSales = promptText.includes('销售') || promptText.includes('客户');
    const isService = promptText.includes('客服') || promptText.includes('投诉');
    const isManager = promptText.includes('经理') || promptText.includes('项目');
    
    let targetRole = '业务岗位';
    let competencyName = '通用能力模型';
    let dimensions = [];
    let knowledge = [];
    
    if (isSales) {
      targetRole = '销售代表';
      competencyName = '销售能力模型';
      dimensions = [
        { id: 'd1', name: '客户开发', description: '识别潜在客户、建立初步联系的能力', selected: true },
        { id: 'd2', name: '沟通表达', description: '清晰传达产品价值、倾听客户需求的能力', selected: true },
        { id: 'd3', name: '异议处理', description: '应对客户质疑、化解成交阻力的能力', selected: true },
        { id: 'd4', name: '商务谈判', description: '把握时机、达成双赢结果的能力', selected: true },
        { id: 'd5', name: '客户维护', description: '建立长期关系、促进复购的能力', selected: false },
      ];
      knowledge = [
        { id: 'k1', title: '电话销售话术手册', category: '话术', selected: true },
        { id: 'k2', title: '客户拜访流程规范', category: '流程', selected: true },
        { id: 'k3', title: '产品知识FAQ', category: '产品', selected: true },
        { id: 'k4', title: 'SPIN销售法则详解', category: '方法论', selected: true },
        { id: 'k5', title: '竞品对比分析', category: '市场', selected: false },
      ];
    } else if (isService) {
      targetRole = '客服专员';
      competencyName = '客户服务能力模型';
      dimensions = [
        { id: 'd1', name: '问题诊断', description: '快速理解客户问题本质的能力', selected: true },
        { id: 'd2', name: '情绪管理', description: '控制自身情绪、安抚客户情绪的能力', selected: true },
        { id: 'd3', name: '解决方案', description: '提供有效解决方案的能力', selected: true },
        { id: 'd4', name: '沟通技巧', description: '清晰、友好地与客户沟通的能力', selected: true },
      ];
      knowledge = [
        { id: 'k1', title: '投诉处理流程规范', category: '流程', selected: true },
        { id: 'k2', title: '常见问题解决方案库', category: '知识库', selected: true },
        { id: 'k3', title: '客户满意度提升技巧', category: '技巧', selected: true },
      ];
    } else if (isManager) {
      targetRole = '项目经理';
      competencyName = '项目管理能力模型';
      dimensions = [
        { id: 'd1', name: '计划制定', description: '制定可执行项目计划的能力', selected: true },
        { id: 'd2', name: '团队协调', description: '协调跨职能团队协作的能力', selected: true },
        { id: 'd3', name: '风险管理', description: '识别和应对项目风险的能力', selected: true },
        { id: 'd4', name: '敏捷实践', description: '运用敏捷方法论的能力', selected: true },
      ];
      knowledge = [
        { id: 'k1', title: 'Scrum框架指南', category: '方法论', selected: true },
        { id: 'k2', title: '敏捷迭代管理手册', category: '流程', selected: true },
        { id: 'k3', title: '项目复盘最佳实践', category: '技巧', selected: true },
      ];
    } else {
      dimensions = [
        { id: 'd1', name: '专业技能', description: '岗位所需的核心专业技能', selected: true },
        { id: 'd2', name: '沟通协作', description: '与团队成员有效沟通协作的能力', selected: true },
        { id: 'd3', name: '问题解决', description: '分析和解决工作中问题的能力', selected: true },
      ];
      knowledge = [
        { id: 'k1', title: '岗位操作手册', category: '流程', selected: true },
        { id: 'k2', title: '常见问题处理指南', category: '知识库', selected: true },
      ];
    }

    return {
      targetRole,
      roleLevel: '初级 / P1-P2',
      competencyModel: {
        name: competencyName,
        dimensions,
      },
      growthMapPath: ['基础认知', '技能训练', '实战演练', '独立上岗'],
      relatedKnowledge: knowledge,
    };
  }, []);

  const handleStartSearch = async () => {
    if (!prompt.trim()) {
      toast({
        title: "请输入培训需求",
        description: "描述您想要创建的培训计划",
        variant: "destructive"
      });
      return;
    }

    setPhase('searching');
    setSearchProgress(0);

    try {
      // 模拟搜索进度
      await simulateSearchProgress();
      
      // 生成发现的上下文
      const context = generateDiscoveredContext(prompt);
      setDiscoveredContext(context);
      
      setPhase('confirming');
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "搜索失败",
        description: "请稍后重试",
        variant: "destructive"
      });
      setPhase('input');
    }
  };

  const handleConfirmContext = async (context: DiscoveredContext) => {
    setDiscoveredContext(context);
    setPhase('generating');
    setGenerateProgress(0);

    try {
      // 并行执行：模拟进度 + 实际API调用
      const [, response] = await Promise.all([
        simulateGenerateProgress(),
        supabase.functions.invoke('generate-training-plan', {
          body: { 
            prompt: prompt.trim(),
            targetAudience: context.targetRole,
            trainingGoals: context.competencyModel.dimensions
              .filter(d => d.selected)
              .map(d => d.name)
              .join('、')
          }
        })
      ]);

      if (response.error) {
        throw response.error;
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      if (response.data.success && response.data.plan) {
        const transformedPlan = transformToEditorFormat(response.data.plan);
        setGeneratedPlan(transformedPlan);
        setPhase('results');
        toast({
          title: "培训计划生成成功",
          description: `已生成「${response.data.plan.title}」培训计划`
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
      setPhase('confirming');
    }
  };

  const handleBackToInput = () => {
    setPhase('input');
    setSearchProgress(0);
    setGenerateProgress(0);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleStartSearch();
    }
  };

  const handleSaveDraft = async (plan: GeneratedPlanData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 静默获取或创建组织（不要求登录）
      let orgId: string | null = null;
      
      if (user) {
        const { data } = await supabase.rpc('initialize_user_with_organization', {
          _user_id: user.id,
          _full_name: user.user_metadata?.full_name || null,
          _org_name: '我的组织'
        });
        orgId = data;
      }
      
      // 如果没有用户或组织，使用开发模式的默认组织
      if (!orgId) {
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
        orgId = orgs?.[0]?.id || null;
      }

      if (!orgId) {
        // 创建一个开发用组织
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: '开发组织', status: 'active', plan_type: 'basic' })
          .select()
          .single();
        if (orgError) throw orgError;
        orgId = newOrg.id;
      }

      // Insert training plan as draft
      const { data: trainingPlan, error: planError } = await supabase
        .from('training_plans')
        .insert({
          title: plan.title,
          description: plan.description,
          objectives: plan.objectives,
          organization_id: orgId,
          created_by: user?.id || null,
          status: 'draft',
        })
        .select()
        .single();

      if (planError) throw planError;

      // Insert chapters
      if (trainingPlan && plan.chapters.length > 0) {
        const chaptersToInsert = plan.chapters.map((chapter, index) => ({
          training_plan_id: trainingPlan.id,
          title: chapter.title,
          sort_order: index,
          chapter_type: 'mixed',
          description: chapter.items.map(i => i.title).join(', '),
        }));

        const { error: chaptersError } = await supabase
          .from('training_chapters')
          .insert(chaptersToInsert);

        if (chaptersError) throw chaptersError;
      }

      toast({
        title: "已保存为草稿",
        description: `「${plan.title}」已保存到草稿箱`
      });
      navigate('/training/plans');
    } catch (error) {
      console.error('Save draft error:', error);
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    }
  };

  const handleCreatePlan = async (plan: GeneratedPlanData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // 静默获取或创建组织（不要求登录）
      let orgId: string | null = null;
      
      if (user) {
        const { data } = await supabase.rpc('initialize_user_with_organization', {
          _user_id: user.id,
          _full_name: user.user_metadata?.full_name || null,
          _org_name: '我的组织'
        });
        orgId = data;
      }
      
      // 如果没有用户或组织，使用开发模式的默认组织
      if (!orgId) {
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
        orgId = orgs?.[0]?.id || null;
      }

      if (!orgId) {
        // 创建一个开发用组织
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: '开发组织', status: 'active', plan_type: 'basic' })
          .select()
          .single();
        if (orgError) throw orgError;
        orgId = newOrg.id;
      }

      // Insert training plan with pending status
      const { data: trainingPlan, error: planError } = await supabase
        .from('training_plans')
        .insert({
          title: plan.title,
          description: plan.description,
          objectives: plan.objectives,
          organization_id: orgId,
          created_by: user?.id || null,
          status: 'pending',
        })
        .select()
        .single();

      if (planError) throw planError;

      // Insert chapters and collect practice items
      const practiceItems: { title: string; description: string; chapterId: string }[] = [];

      if (trainingPlan && plan.chapters.length > 0) {
        const chaptersToInsert = plan.chapters.map((chapter, index) => ({
          training_plan_id: trainingPlan.id,
          title: chapter.title,
          sort_order: index,
          chapter_type: 'mixed',
          description: chapter.items.map(i => i.title).join(', '),
        }));

        const { data: insertedChapters, error: chaptersError } = await supabase
          .from('training_chapters')
          .insert(chaptersToInsert)
          .select();

        if (chaptersError) throw chaptersError;

        // Collect practice items from the plan
        plan.chapters.forEach((chapter, chapterIndex) => {
          chapter.items.forEach((item) => {
            if (item.type === 'practice') {
              practiceItems.push({
                title: item.title,
                description: item.description || `${chapter.title} - ${item.title}`,
                chapterId: insertedChapters?.[chapterIndex]?.id || '',
              });
            }
          });
        });

        // Create practice_sessions for each practice item
        if (practiceItems.length > 0) {
          const practiceSessionsToInsert = practiceItems.map((item) => ({
            title: item.title,
            description: item.description,
            organization_id: orgId,
            chapter_id: item.chapterId || null,
            practice_mode: 'free_dialogue',
            scenario_description: `来自培训计划「${plan.title}」的练习场景`,
          }));

          const { error: practiceError } = await supabase
            .from('practice_sessions')
            .insert(practiceSessionsToInsert);

          if (practiceError) {
            console.error('Practice sessions insert error:', practiceError);
          }
        }
      }

      toast({
        title: "培训计划已创建",
        description: `「${plan.title}」已正式入库${practiceItems.length > 0 ? `，同步创建了 ${practiceItems.length} 个练习计划` : ''}`
      });
      navigate('/training/plans');
    } catch (error) {
      console.error('Create plan error:', error);
      toast({
        title: "创建失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout title="AI培训生成工作台" description="一句话生成学练考完整培训计划">
      <div className="space-y-6">
        {/* Phase: Input */}
        {phase === 'input' && (
          <div className="max-w-3xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI 智能培训计划生成
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                一句话生成<br />
                <span className="text-primary">学练考</span>完整培训计划
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                输入培训对象和目标，AI 将自动设计课程内容、练习场景和考核方案
              </p>
            </div>

            {/* Input Section */}
            <div className="relative">
              <Card className="shadow-xl border-0 bg-card">
                <CardContent className="p-6">
                  <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="描述您的培训需求，例如：为新入职销售人员设计一套客户沟通技巧培训，包含电话销售和面对面拜访场景..."
                    className="min-h-[120px] text-base border-0 focus-visible:ring-0 resize-none p-0"
                  />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground">
                      按 ⌘ + Enter 快速生成
                    </span>
                    <Button 
                      onClick={handleStartSearch} 
                      disabled={!prompt.trim()}
                      size="lg"
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      一键生成培训计划
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Example Prompts */}
            <div className="mt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Lightbulb className="h-4 w-4" />
                试试这些示例
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 rounded-lg border bg-card hover:bg-muted hover:border-primary/30 transition-colors text-sm text-muted-foreground"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-16">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">智能课程设计</h3>
                <p className="text-sm text-muted-foreground">自动规划课程大纲和知识点</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h3 className="font-medium mb-1">场景化练习</h3>
                <p className="text-sm text-muted-foreground">生成贴近实战的AI对话练习</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
                  <ClipboardCheck className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-medium mb-1">自动考核方案</h3>
                <p className="text-sm text-muted-foreground">智能出题并设置评分标准</p>
              </div>
            </div>
          </div>
        )}

        {/* Phase: Searching */}
        {phase === 'searching' && (
          <div className="max-w-2xl mx-auto">
            <GenerationProgress
              phase="searching"
              progress={searchProgress}
            />
          </div>
        )}

        {/* Phase: Confirming */}
        {phase === 'confirming' && discoveredContext && (
          <KnowledgeConfirmation
            context={discoveredContext}
            onConfirm={handleConfirmContext}
            onBack={handleBackToInput}
          />
        )}

        {/* Phase: Generating */}
        {phase === 'generating' && (
          <div className="max-w-2xl mx-auto">
            <GenerationProgress
              phase="generating"
              progress={generateProgress}
            />
          </div>
        )}

        {/* Phase: Results */}
        {phase === 'results' && generatedPlan && (
          <GeneratedPlanEditor
            plan={generatedPlan}
            onBack={handleBackToInput}
            onSaveDraft={handleSaveDraft}
            onCreatePlan={handleCreatePlan}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
