import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Video,
  FileText,
  Bot,
  Save,
  ArrowRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContentConfigSheet } from "./ContentConfigSheet";
import { PracticeConfigDialog } from "./PracticeConfigDialog";

export interface ContentItem {
  id: string;
  title: string;
  type: "lesson" | "practice" | "assessment";
  contentType?: "video" | "pdf" | "article" | "ai_dialogue" | "quiz" | "scenario";
  duration?: string;
  description?: string;
  config?: Record<string, unknown>;
}

export interface Chapter {
  id: string;
  title: string;
  items: ContentItem[];
}

export interface GeneratedPlanData {
  title: string;
  description: string;
  targetAudience: string;
  objectives: string;
  duration: string;
  chapters: Chapter[];
  skillsTargeted: string[];
}

interface GeneratedPlanEditorProps {
  plan: GeneratedPlanData;
  onBack: () => void;
  onSaveDraft: (plan: GeneratedPlanData) => void;
  onCreatePlan: (plan: GeneratedPlanData) => void;
}

const typeConfig = {
  lesson: {
    label: "学习",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  practice: {
    label: "练习",
    icon: MessageSquare,
    color: "bg-secondary text-secondary-foreground",
  },
  assessment: {
    label: "考核",
    icon: ClipboardCheck,
    color: "bg-accent text-accent-foreground",
  },
};

const contentTypeIcons: Record<string, typeof Video> = {
  video: Video,
  pdf: FileText,
  article: FileText,
  ai_dialogue: Bot,
  quiz: ClipboardCheck,
  scenario: MessageSquare,
};

export function GeneratedPlanEditor({
  plan: initialPlan,
  onBack,
  onSaveDraft,
  onCreatePlan,
}: GeneratedPlanEditorProps) {
  const [plan, setPlan] = useState<GeneratedPlanData>(initialPlan);
  const [expandedChapters, setExpandedChapters] = useState<string[]>(
    initialPlan.chapters.map((c) => c.id)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [configSheetOpen, setConfigSheetOpen] = useState(false);
  const [practiceDialogOpen, setPracticeDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    chapterId: string;
    item: ContentItem;
  } | null>(null);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingValue(currentTitle);
  };

  const saveEditing = () => {
    if (!editingId || !editingValue.trim()) {
      setEditingId(null);
      return;
    }

    setPlan((prev) => {
      // Check if it's a chapter
      const chapterIndex = prev.chapters.findIndex((c) => c.id === editingId);
      if (chapterIndex !== -1) {
        const newChapters = [...prev.chapters];
        newChapters[chapterIndex] = {
          ...newChapters[chapterIndex],
          title: editingValue,
        };
        return { ...prev, chapters: newChapters };
      }

      // Check items in chapters
      const newChapters = prev.chapters.map((chapter) => ({
        ...chapter,
        items: chapter.items.map((item) =>
          item.id === editingId ? { ...item, title: editingValue } : item
        ),
      }));
      return { ...prev, chapters: newChapters };
    });
    setEditingId(null);
  };

  const deleteChapter = (chapterId: string) => {
    setPlan((prev) => ({
      ...prev,
      chapters: prev.chapters.filter((c) => c.id !== chapterId),
    }));
  };

  const deleteItem = (chapterId: string, itemId: string) => {
    setPlan((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, items: chapter.items.filter((i) => i.id !== itemId) }
          : chapter
      ),
    }));
  };

  const addItem = (chapterId: string, type: "lesson" | "practice" | "assessment") => {
    const newItem: ContentItem = {
      id: `item-${Date.now()}`,
      title: type === "lesson" ? "新课程内容" : type === "practice" ? "新练习" : "新考核",
      type,
      contentType: type === "lesson" ? "video" : type === "practice" ? "ai_dialogue" : "quiz",
    };

    setPlan((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, items: [...chapter.items, newItem] }
          : chapter
      ),
    }));
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: `第${plan.chapters.length + 1}章：新章节`,
      items: [],
    };
    setPlan((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
    }));
  };

  const changeItemType = (
    chapterId: string,
    itemId: string,
    newType: "lesson" | "practice" | "assessment"
  ) => {
    setPlan((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              items: chapter.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      type: newType,
                      contentType:
                        newType === "lesson"
                          ? "video"
                          : newType === "practice"
                          ? "ai_dialogue"
                          : "quiz",
                    }
                  : item
              ),
            }
          : chapter
      ),
    }));
  };

  const openItemConfig = (chapterId: string, item: ContentItem) => {
    setSelectedItem({ chapterId, item });
    // 如果是练习类型，打开练习配置弹窗
    if (item.type === "practice") {
      setPracticeDialogOpen(true);
    } else {
      setConfigSheetOpen(true);
    }
  };

  const handlePracticeConfigSave = (config: {
    title: string;
    scenarioDescription: string;
    aiRoleId: string;
    aiRoleInfo: string;
    traineeRole: string;
    dialogueGoal: string;
    passScore: number;
    passAttempts: number;
    assessmentItems: { id: string; name: string; weight: number }[];
  }) => {
    if (!selectedItem) return;
    
    const updatedItem: ContentItem = {
      ...selectedItem.item,
      title: config.title || selectedItem.item.title,
      description: config.scenarioDescription,
      config: {
        ...selectedItem.item.config,
        scenarioDescription: config.scenarioDescription,
        aiRoleId: config.aiRoleId,
        aiRoleInfo: config.aiRoleInfo,
        traineeRole: config.traineeRole,
        dialogueGoal: config.dialogueGoal,
        passScore: config.passScore,
        passAttempts: config.passAttempts,
        assessmentItems: config.assessmentItems,
      },
    };
    
    updateItemConfig(updatedItem);
  };

  const updateItemConfig = (updatedItem: ContentItem) => {
    if (!selectedItem) return;
    
    setPlan((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.id === selectedItem.chapterId
          ? {
              ...chapter,
              items: chapter.items.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              ),
            }
          : chapter
      ),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2 -ml-4">
            ← 返回重新生成
          </Button>
          <h2 className="text-2xl font-bold">{plan.title}</h2>
          <p className="text-muted-foreground mt-1">{plan.description}</p>
        </div>
      </div>

      {/* Plan Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">培训对象</div>
            <div className="font-medium mt-1">{plan.targetAudience}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">预计时长</div>
            <div className="font-medium mt-1">{plan.duration}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">章节数量</div>
            <div className="font-medium mt-1">{plan.chapters.length} 个章节</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">目标技能</div>
            <div className="font-medium mt-1">{plan.skillsTargeted?.length || 0} 项技能</div>
          </CardContent>
        </Card>
      </div>

      {/* Training Objectives */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">培训目标</h3>
          <p className="text-muted-foreground">{plan.objectives}</p>
          {plan.skillsTargeted && plan.skillsTargeted.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {plan.skillsTargeted.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structure Editor */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">培训内容结构</CardTitle>
          <Button variant="outline" size="sm" onClick={addChapter}>
            <Plus className="h-4 w-4 mr-1" />
            添加章节
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {plan.chapters.map((chapter, chapterIndex) => (
              <Collapsible
                key={chapter.id}
                open={expandedChapters.includes(chapter.id)}
                onOpenChange={() => toggleChapter(chapter.id)}
              >
                <div className="rounded-lg border bg-card">
                  {/* Chapter Header */}
                  <div className="flex items-center gap-2 p-3 hover:bg-muted/50">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                      {expandedChapters.includes(chapter.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {editingId === chapter.id ? (
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={saveEditing}
                          onKeyDown={(e) => e.key === "Enter" && saveEditing()}
                          className="h-7 w-64"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-medium">{chapter.title}</span>
                      )}
                    </CollapsibleTrigger>
                    <Badge variant="secondary" className="text-xs">
                      {chapter.items.length} 项内容
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => startEditing(chapter.id, chapter.title)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          编辑名称
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => addItem(chapter.id, "lesson")}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          添加学习内容
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addItem(chapter.id, "practice")}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          添加练习
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addItem(chapter.id, "assessment")}>
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          添加考核
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteChapter(chapter.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除章节
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Chapter Items */}
                  <CollapsibleContent>
                    <div className="border-t">
                      {chapter.items.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          暂无内容，点击右上角菜单添加
                        </div>
                      ) : (
                        <div className="divide-y">
                          {chapter.items.map((item) => {
                            const config = typeConfig[item.type];
                            const TypeIcon = config.icon;
                            const ContentIcon =
                              contentTypeIcons[item.contentType || "video"] || FileText;

                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 p-3 pl-10 hover:bg-muted/30 cursor-pointer group"
                                onClick={() => openItemConfig(chapter.id, item)}
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded",
                                    config.color
                                  )}
                                >
                                  <ContentIcon className="h-4 w-4" />
                                </div>
                                {editingId === item.id ? (
                                  <Input
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onBlur={saveEditing}
                                    onKeyDown={(e) => e.key === "Enter" && saveEditing()}
                                    className="h-7 flex-1"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <span className="flex-1">{item.title}</span>
                                )}
                                <Badge variant="secondary" className={cn("text-xs", config.color)}>
                                  {config.label}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(item.id, item.title);
                                      }}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      编辑名称
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        changeItemType(chapter.id, item.id, "lesson");
                                      }}
                                    >
                                      <BookOpen className="mr-2 h-4 w-4" />
                                      切换为学习
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        changeItemType(chapter.id, item.id, "practice");
                                      }}
                                    >
                                      <MessageSquare className="mr-2 h-4 w-4" />
                                      切换为练习
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        changeItemType(chapter.id, item.id, "assessment");
                                      }}
                                    >
                                      <ClipboardCheck className="mr-2 h-4 w-4" />
                                      切换为考核
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteItem(chapter.id, item.id);
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      删除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => onSaveDraft(plan)}>
          <Save className="mr-2 h-4 w-4" />
          保存为草稿
        </Button>
        <Button onClick={() => onCreatePlan(plan)}>
          生成完整培训计划
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Content Config Sheet */}
      <ContentConfigSheet
        open={configSheetOpen}
        onOpenChange={setConfigSheetOpen}
        item={selectedItem?.item || null}
        onSave={updateItemConfig}
      />

      {/* Practice Config Dialog */}
      <PracticeConfigDialog
        open={practiceDialogOpen}
        onOpenChange={setPracticeDialogOpen}
        onSave={handlePracticeConfigSave}
        initialData={selectedItem?.item ? {
          title: selectedItem.item.title,
          scenarioDescription: (selectedItem.item.config?.scenarioDescription as string) || selectedItem.item.description || "",
          aiRoleId: (selectedItem.item.config?.aiRoleId as string) || "",
          aiRoleInfo: (selectedItem.item.config?.aiRoleInfo as string) || "",
          traineeRole: (selectedItem.item.config?.traineeRole as string) || "",
          dialogueGoal: (selectedItem.item.config?.dialogueGoal as string) || "",
          passScore: (selectedItem.item.config?.passScore as number) || 60,
          passAttempts: (selectedItem.item.config?.passAttempts as number) || 3,
          assessmentItems: (selectedItem.item.config?.assessmentItems as { id: string; name: string; weight: number }[]) || undefined,
        } : undefined}
      />
    </div>
  );
}
