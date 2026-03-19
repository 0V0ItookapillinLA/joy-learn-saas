import { useState, useEffect, useMemo } from "react";
import { TreeSelect, Spin } from "antd";
import { supabase } from "@/integrations/supabase/client";

interface KnowledgeTreeSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  multiple?: boolean;
}

interface TreeNode {
  title: string;
  value: string;
  key: string;
  children?: TreeNode[];
  selectable?: boolean;
}

export function KnowledgeTreeSelect({
  value = [],
  onChange,
  placeholder = "请选择知识库/文档",
  style,
  multiple = true,
}: KnowledgeTreeSelectProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kbRes, docRes] = await Promise.all([
          supabase.from("knowledge_bases").select("id, name").order("created_at", { ascending: false }),
          supabase.from("knowledge_documents").select("id, title, knowledge_base_id, status").eq("status", "ready"),
        ]);
        setKnowledgeBases(kbRes.data || []);
        setDocuments(docRes.data || []);
      } catch (e) {
        console.error("Failed to load knowledge data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const treeData: TreeNode[] = useMemo(() => {
    return knowledgeBases.map((kb) => {
      const children = documents
        .filter((d) => d.knowledge_base_id === kb.id)
        .map((d) => ({
          title: d.title,
          value: `doc:${d.id}`,
          key: `doc:${d.id}`,
        }));
      return {
        title: kb.name,
        value: `kb:${kb.id}`,
        key: `kb:${kb.id}`,
        children,
      };
    });
  }, [knowledgeBases, documents]);

  if (loading) return <Spin size="small" />;

  return (
    <TreeSelect
      treeData={treeData}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style || { width: "100%" }}
      treeCheckable={multiple}
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      allowClear
      maxTagCount={3}
      treeDefaultExpandAll
      dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
    />
  );
}
