import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Loader2, BookOpen, MessageSquare, ClipboardCheck, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GeneratedPlanEditor, type GeneratedPlanData, type Chapter, type ContentItem } from '@/components/training/GeneratedPlanEditor';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "请输入培训需求",
        description: "描述您想要创建的培训计划",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setShowResults(false);

    try {
      const { data, error } = await supabase.functions.invoke('generate-training-plan', {
        body: { prompt: prompt.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success && data.plan) {
        const transformedPlan = transformToEditorFormat(data.plan);
        setGeneratedPlan(transformedPlan);
        setShowResults(true);
        toast({
          title: "培训计划生成成功",
          description: `已生成「${data.plan.title}」培训计划`
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  const handleSaveDraft = (plan: GeneratedPlanData) => {
    toast({
      title: "已保存为草稿",
      description: `「${plan.title}」已保存到草稿箱`
    });
    // TODO: Save to database
  };

  const handleCreatePlan = (plan: GeneratedPlanData) => {
    toast({
      title: "培训计划已创建",
      description: `「${plan.title}」已正式入库`
    });
    navigate('/training/plans');
  };

  return (
    <DashboardLayout title="AI培训生成工作台" description="一句话生成学练考完整培训计划">
      <div className="space-y-6">
        {!showResults ? (
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
                    disabled={isGenerating}
                  />
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground">
                      按 ⌘ + Enter 快速生成
                    </span>
                    <Button 
                      onClick={handleGenerate} 
                      disabled={isGenerating || !prompt.trim()}
                      size="lg"
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          AI 正在设计...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          一键生成培训计划
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Loading Animation */}
              {isGenerating && (
                <div className="absolute inset-0 bg-card/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                      <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-sm font-medium text-foreground">AI 正在分析需求并设计培训计划...</p>
                    <p className="text-xs text-muted-foreground mt-1">这可能需要 10-30 秒</p>
                  </div>
                </div>
              )}
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
                    disabled={isGenerating}
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
        ) : (
          /* Results Section - Editable Structure */
          generatedPlan && (
            <GeneratedPlanEditor
              plan={generatedPlan}
              onBack={() => setShowResults(false)}
              onSaveDraft={handleSaveDraft}
              onCreatePlan={handleCreatePlan}
            />
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
