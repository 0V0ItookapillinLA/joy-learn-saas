import { useState } from "react";
import { Input, Table, Tag, Checkbox, Typography, Divider } from "antd";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { Text } = Typography;
const { TextArea } = Input;

interface KnowledgeDoc {
  id: string;
  title: string;
  ai_summary: string | null;
  ai_key_points: any;
  category: string | null;
  status: string;
}

interface Props {
  selectedDocs: KnowledgeDoc[];
  onSelect: (docs: KnowledgeDoc[]) => void;
  title: string;
  onTitleChange: (v: string) => void;
  extraPrompt: string;
  onExtraPromptChange: (v: string) => void;
}

export function KnowledgeSelector({
  selectedDocs,
  onSelect,
  title,
  onTitleChange,
  extraPrompt,
  onExtraPromptChange,
}: Props) {
  const [search, setSearch] = useState("");

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["knowledge-docs-ready", search],
    queryFn: async () => {
      let query = supabase
        .from("knowledge_documents" as any)
        .select("id, title, ai_summary, ai_key_points, category, status")
        .eq("status", "ready")
        .order("created_at", { ascending: false });

      if (search) query = query.ilike("title", `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as KnowledgeDoc[];
    },
  });

  const selectedIds = new Set(selectedDocs.map((d) => d.id));

  const toggleDoc = (doc: KnowledgeDoc) => {
    if (selectedIds.has(doc.id)) {
      onSelect(selectedDocs.filter((d) => d.id !== doc.id));
    } else {
      onSelect([...selectedDocs, doc]);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong>课件标题</Text>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="输入课件标题"
          style={{ marginTop: 8 }}
        />
      </div>

      <Divider />

      <div style={{ marginBottom: 16 }}>
        <Text strong>从知识库选择资料（已选 {selectedDocs.length} 篇）</Text>
        <Input.Search
          placeholder="搜索文档"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginTop: 8 }}
          allowClear
        />
      </div>

      <Table
        size="small"
        loading={isLoading}
        dataSource={docs}
        rowKey="id"
        pagination={{ pageSize: 10, size: "small" }}
        columns={[
          {
            title: "",
            width: 40,
            render: (_: any, record: KnowledgeDoc) => (
              <Checkbox
                checked={selectedIds.has(record.id)}
                onChange={() => toggleDoc(record)}
              />
            ),
          },
          {
            title: "标题",
            dataIndex: "title",
            render: (t: string) => <Text>{t}</Text>,
          },
          {
            title: "分类",
            dataIndex: "category",
            width: 80,
            render: (c: string) => c || "通用",
          },
          {
            title: "知识点",
            key: "points",
            width: 80,
            render: (_: any, r: KnowledgeDoc) => {
              const n = Array.isArray(r.ai_key_points) ? r.ai_key_points.length : 0;
              return n > 0 ? <Tag color="blue">{n}</Tag> : "-";
            },
          },
        ]}
      />

      <Divider />

      <div>
        <Text strong>额外指令（可选）</Text>
        <TextArea
          rows={3}
          value={extraPrompt}
          onChange={(e) => onExtraPromptChange(e.target.value)}
          placeholder="例如：重点讲解异议处理技巧，每章控制在10分钟左右"
          style={{ marginTop: 8 }}
        />
      </div>
    </div>
  );
}
