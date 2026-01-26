import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Loader2, BookOpen, MessageSquare, ClipboardCheck, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface GeneratedChapter {
  title: string;
  type: 'lesson' | 'practice' | 'assessment';
  description: string;
  duration: string;
  content: Record<string, unknown>;
}

interface GeneratedPlan {
  title: string;
  description: string;
  targetAudience: string;
  objectives: string;
  duration: string;
  chapters: GeneratedChapter[];
  skillsTargeted: string[];
  prerequisites: string[];
  successCriteria: string;
}

const EXAMPLE_PROMPTS = [
  "为新入职销售人员设计一套客户沟通技巧培训，包含电话销售和面对面拜访场景",
  "给客服团队设计投诉处理培训，要求有大量实战演练",
  "为项目经理设计敏捷开发方法论培训，需要包含Scrum实践考核",
  "设计一套新员工入职培训，涵盖公司文化、制度流程和岗位技能"
];

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
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
        setGeneratedPlan(data.plan);
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

  const getChapterTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-4 w-4" />;
      case 'practice':
        return <MessageSquare className="h-4 w-4" />;
      case 'assessment':
        return <ClipboardCheck className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getChapterTypeBadge = (type: string) => {
    switch (type) {
      case 'lesson':
        return <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">学习</Badge>;
      case 'practice':
        return <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary">练习</Badge>;
      case 'assessment':
        return <Badge variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent">考核</Badge>;
      default:
        return <Badge variant="secondary">其他</Badge>;
    }
  };

  const handleCreatePlan = () => {
    navigate('/training/plans', { state: { generatedPlan } });
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
                          生成培训计划
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
          /* Results Section */
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Button variant="ghost" onClick={() => setShowResults(false)} className="mb-2 -ml-4">
                  ← 返回重新生成
                </Button>
                <h2 className="text-2xl font-bold">{generatedPlan?.title}</h2>
                <p className="text-muted-foreground mt-1">{generatedPlan?.description}</p>
              </div>
              <Button onClick={handleCreatePlan} size="lg" className="gap-2">
                使用此计划
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Plan Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">培训对象</div>
                  <div className="font-medium mt-1">{generatedPlan?.targetAudience}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">预计时长</div>
                  <div className="font-medium mt-1">{generatedPlan?.duration}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">章节数量</div>
                  <div className="font-medium mt-1">{generatedPlan?.chapters?.length || 0} 个章节</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">目标技能</div>
                  <div className="font-medium mt-1">{generatedPlan?.skillsTargeted?.length || 0} 项技能</div>
                </CardContent>
              </Card>
            </div>

            {/* Training Objectives */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">培训目标</h3>
                <p className="text-muted-foreground">{generatedPlan?.objectives}</p>
                {generatedPlan?.skillsTargeted && generatedPlan.skillsTargeted.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {generatedPlan.skillsTargeted.map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">培训内容</h3>
                <div className="space-y-4">
                  {generatedPlan?.chapters?.map((chapter, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-card shadow-sm flex items-center justify-center">
                        {getChapterTypeIcon(chapter.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{chapter.title}</span>
                          {getChapterTypeBadge(chapter.type)}
                          <span className="text-xs text-muted-foreground ml-auto">{chapter.duration}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{chapter.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Success Criteria */}
            {generatedPlan?.successCriteria && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">成功标准</h3>
                  <p className="text-muted-foreground">{generatedPlan.successCriteria}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
