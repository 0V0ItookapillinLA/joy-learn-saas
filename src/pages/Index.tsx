import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Loader2, BookOpen, MessageSquare, ClipboardCheck, Lightbulb } from 'lucide-react';
import { Card, Button, Input, App } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GeneratedPlanEditor, type GeneratedPlanData, type Chapter, type ContentItem } from '@/components/training/GeneratedPlanEditor';
import { GenerationProgress } from '@/components/training/GenerationProgress';
import { KnowledgeConfirmation, type DiscoveredContext } from '@/components/training/KnowledgeConfirmation';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { VoiceInputButton } from '@/components/input/VoiceInputButton';
import { FileAttachment, type AttachedFile } from '@/components/input/FileAttachment';
import { parseMultipleFiles } from '@/lib/fileParser';

const { TextArea } = Input;

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
          items: chapter.items.map((item: any, itemIndex: number) => {
            const contentItem: ContentItem = {
              id: `${chapterId}-item-${itemIndex}`,
              title: item.title || item.name || '未命名内容',
              type: item.type || 'lesson',
              contentType: item.contentType || (item.type === 'lesson' ? 'video' : item.type === 'practice' ? 'ai_dialogue' : 'quiz'),
              duration: item.duration,
              description: item.description,
            };
            
            // 保留AI生成的练习配置
            if (item.type === 'practice' && item.config) {
              contentItem.config = {
                scenarioDescription: item.config.scenarioDescription || item.description || '',
                aiRole: item.config.aiRole || '',
                aiRoleInfo: item.config.aiRoleInfo || '',
                traineeRole: item.config.traineeRole || '',
                dialogueGoal: item.config.dialogueGoal || '',
                assessmentItems: item.config.assessmentItems || [],
                passScore: 60,
                passAttempts: 3,
              };
            }
            
            return contentItem;
          }),
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
        
        const contentItem: ContentItem = {
          id: `item-${index}`,
          title: chapter.title || '未命名内容',
          type: chapter.type || 'lesson',
          contentType: chapter.type === 'lesson' ? 'video' : chapter.type === 'practice' ? 'ai_dialogue' : 'quiz',
          duration: chapter.duration,
          description: chapter.description,
        };
        
        // 保留AI生成的练习配置
        if (chapter.type === 'practice' && chapter.config) {
          contentItem.config = {
            scenarioDescription: chapter.config.scenarioDescription || chapter.description || '',
            aiRole: chapter.config.aiRole || '',
            aiRoleInfo: chapter.config.aiRoleInfo || '',
            traineeRole: chapter.config.traineeRole || '',
            dialogueGoal: chapter.config.dialogueGoal || '',
            assessmentItems: chapter.config.assessmentItems || [],
            passScore: 60,
            passAttempts: 3,
          };
        }
        
        currentChapter.items.push(contentItem);
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

type GenerationPhase = 'input' | 'searching' | 'confirming' | 'generating' | 'results';

const Index = () => {
  const { message } = App.useApp();
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<GenerationPhase>('input');
  const [searchProgress, setSearchProgress] = useState(0);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [discoveredContext, setDiscoveredContext] = useState<DiscoveredContext | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanData | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<any>(null);
  const navigate = useNavigate();

  // Voice recognition hook
  const { 
    isListening, 
    isSupported: isVoiceSupported, 
    startListening, 
    stopListening,
    transcript 
  } = useVoiceRecognition({
    onResult: (text) => {
      setPrompt(prev => prev ? `${prev} ${text}` : text);
    },
    onError: (error) => {
      message.error(`语音识别错误: ${error}`);
    },
  });

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
      message.error('请输入培训需求');
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
      message.error('搜索失败，请稍后重试');
      setPhase('input');
    }
  };

  const handleConfirmContext = async (context: DiscoveredContext) => {
    setDiscoveredContext(context);
    setPhase('generating');
    setGenerateProgress(0);

    try {
      // Parse attachment content if any files are attached
      let attachmentContent = '';
      if (attachedFiles.length > 0) {
        const uploadedFiles = attachedFiles.filter(f => f.url && !f.uploading);
        if (uploadedFiles.length > 0) {
          attachmentContent = await parseMultipleFiles(
            uploadedFiles.map(f => ({ name: f.name, url: f.url, type: f.type }))
          );
        }
      }

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
              .join('、'),
            attachmentContent: attachmentContent || undefined
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
        message.success(`培训计划生成成功：已生成「${response.data.plan.title}」`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      message.error(error instanceof Error ? error.message : '生成失败，请稍后重试');
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
      
      if (!user) {
        message.error('请先登录');
        return;
      }
      
      const { data: orgId, error: orgError } = await supabase.rpc('initialize_user_with_organization', {
        _user_id: user.id,
        _full_name: user.user_metadata?.full_name || null,
        _org_name: '我的组织'
      });
      
      if (orgError || !orgId) {
        console.error('Organization init error:', orgError);
        throw new Error('无法初始化用户组织');
      }

      const { data: trainingPlan, error: planError } = await supabase
        .from('training_plans')
        .insert({
          title: plan.title,
          description: plan.description,
          objectives: plan.objectives,
          organization_id: orgId,
          created_by: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (planError) throw planError;

      if (trainingPlan && plan.chapters.length > 0) {
        const chaptersToInsert = plan.chapters.map((chapter, index) => ({
          training_plan_id: trainingPlan.id,
          title: chapter.title,
          sort_order: index,
          chapter_type: 'mixed',
          description: chapter.items.map(i => i.title).join(', '),
          content_items: JSON.stringify(chapter.items.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            contentType: item.contentType,
            duration: item.duration,
            description: item.description,
            config: item.config || {},
          }))),
        }));

        const { error: chaptersError } = await supabase
          .from('training_chapters')
          .insert(chaptersToInsert);

        if (chaptersError) throw chaptersError;
      }

      message.success(`已保存为草稿：「${plan.title}」`);
      navigate('/training/plans');
    } catch (error) {
      console.error('Save draft error:', error);
      message.error(error instanceof Error ? error.message : '保存失败，请稍后重试');
    }
  };

  const handleCreatePlan = async (plan: GeneratedPlanData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        message.error('请先登录');
        return;
      }
      
      const { data: orgId, error: orgError } = await supabase.rpc('initialize_user_with_organization', {
        _user_id: user.id,
        _full_name: user.user_metadata?.full_name || null,
        _org_name: '我的组织'
      });
      
      if (orgError || !orgId) {
        console.error('Organization init error:', orgError);
        throw new Error('无法初始化用户组织');
      }

      const { data: trainingPlan, error: planError } = await supabase
        .from('training_plans')
        .insert({
          title: plan.title,
          description: plan.description,
          objectives: plan.objectives,
          organization_id: orgId,
          created_by: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (planError) throw planError;

      interface PracticeItemWithConfig {
        title: string;
        description: string;
        chapterId: string;
        config?: Record<string, unknown>;
      }
      const practiceItems: PracticeItemWithConfig[] = [];

      if (trainingPlan && plan.chapters.length > 0) {
        const chaptersToInsert = plan.chapters.map((chapter, index) => ({
          training_plan_id: trainingPlan.id,
          title: chapter.title,
          sort_order: index,
          chapter_type: 'mixed',
          description: chapter.items.map(i => i.title).join(', '),
          content_items: JSON.stringify(chapter.items.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            contentType: item.contentType,
            duration: item.duration,
            description: item.description,
            config: item.config || {},
          }))),
        }));

        const { data: insertedChapters, error: chaptersError } = await supabase
          .from('training_chapters')
          .insert(chaptersToInsert)
          .select();

        if (chaptersError) throw chaptersError;

        plan.chapters.forEach((chapter, chapterIndex) => {
          chapter.items.forEach((item) => {
            if (item.type === 'practice') {
              practiceItems.push({
                title: item.title,
                description: item.description || `${chapter.title} - ${item.title}`,
                chapterId: insertedChapters?.[chapterIndex]?.id || '',
                config: item.config,
              });
            }
          });
        });

        if (practiceItems.length > 0) {
          const practiceSessionsToInsert = practiceItems.map((item) => ({
            title: item.title,
            description: item.description,
            organization_id: orgId,
            chapter_id: item.chapterId || null,
            practice_mode: 'free_dialogue',
            scenario_description: (item.config?.scenarioDescription as string) || `来自培训计划「${plan.title}」的练习场景`,
            ai_role: (item.config?.aiRole as string) || null,
            trainee_role: (item.config?.traineeRole as string) || null,
            scoring_criteria: item.config?.assessmentItems ? JSON.stringify({
              dialogueGoal: item.config?.dialogueGoal || '',
              aiRoleInfo: item.config?.aiRoleInfo || '',
              assessmentItems: item.config?.assessmentItems || [],
            }) : null,
          }));

          const { error: practiceError } = await supabase
            .from('practice_sessions')
            .insert(practiceSessionsToInsert);

          if (practiceError) {
            console.error('Practice sessions insert error:', practiceError);
          }
        }
      }

      message.success(`培训计划已创建：「${plan.title}」${practiceItems.length > 0 ? `，同步创建了 ${practiceItems.length} 个练习计划` : ''}`);
      navigate('/training/plans');
    } catch (error) {
      console.error('Create plan error:', error);
      message.error(error instanceof Error ? error.message : '创建失败，请稍后重试');
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                AI 智能培训计划生成
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                一句话生成<br />
                <span className="text-blue-600">学练考</span>完整培训计划
              </h1>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                输入培训对象和目标，AI 将自动设计课程内容、练习场景和考核方案
              </p>
            </div>

            {/* Input Section */}
            <div className="relative">
              <Card className="shadow-xl">
                <div className="relative">
                  <TextArea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="描述您的培训需求，例如：为新入职销售人员设计一套客户沟通技巧培训，包含电话销售和面对面拜访场景..."
                    autoSize={{ minRows: 4, maxRows: 8 }}
                    variant="borderless"
                    className="text-base"
                  />
                  {/* Voice indicator badge */}
                  {isListening && (
                    <div className="absolute top-0 right-0 flex items-center gap-2 text-xs text-red-500 font-medium">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        录音中
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Real-time voice transcript display */}
                {isListening && transcript && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-dashed border-blue-300">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">实时转写：</p>
                        <p className="text-sm text-gray-900">{transcript}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Attached files display */}
                {attachedFiles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dashed">
                    <FileAttachment 
                      files={attachedFiles} 
                      onFilesChange={setAttachedFiles}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    {/* Voice Input Button */}
                    <VoiceInputButton
                      isListening={isListening}
                      isSupported={isVoiceSupported}
                      onStart={startListening}
                      onStop={stopListening}
                    />
                    
                    {/* File Attachment Button */}
                    <FileAttachment
                      files={attachedFiles}
                      onFilesChange={setAttachedFiles}
                      maxFiles={5}
                      maxSizeMB={10}
                    />
                    
                    <span className="text-xs text-gray-400 ml-2">
                      ⌘ + Enter 快速生成
                    </span>
                  </div>
                  <Button 
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleStartSearch} 
                    disabled={!prompt.trim() || isListening}
                  >
                    一键生成培训计划
                  </Button>
                </div>
              </Card>
            </div>

            {/* Example Prompts */}
            <div className="mt-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Lightbulb className="h-4 w-4" />
                试试这些示例
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-3 rounded-lg border bg-white hover:bg-gray-50 hover:border-blue-300 transition-colors text-sm text-gray-600"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 mt-16">
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium mb-1">智能课程设计</h3>
                <p className="text-sm text-gray-500">自动规划课程大纲和知识点</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium mb-1">场景化练习</h3>
                <p className="text-sm text-gray-500">生成贴近实战的AI对话练习</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-3">
                  <ClipboardCheck className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-medium mb-1">自动考核方案</h3>
                <p className="text-sm text-gray-500">智能出题并设置评分标准</p>
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
