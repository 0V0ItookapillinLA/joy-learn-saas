/**
 * File content parser utility
 * Extracts text content from various file types
 */

import { supabase } from '@/integrations/supabase/client';

export interface ParsedFileContent {
  fileName: string;
  content: string;
  type: string;
}

/**
 * Fetch and parse text content from a file URL
 */
export async function parseFileContent(fileUrl: string, fileName: string, fileType: string): Promise<ParsedFileContent | null> {
  try {
    // For text-based files, fetch and return content directly
    if (fileType.startsWith('text/') || 
        fileType === 'application/json' ||
        fileName.endsWith('.md') ||
        fileName.endsWith('.txt')) {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      const content = await response.text();
      return {
        fileName,
        content: content.slice(0, 50000), // Limit to 50k chars
        type: fileType,
      };
    }

    // For PDF files, we'll extract what we can via edge function
    if (fileType === 'application/pdf') {
      // Call edge function to parse PDF
      const { data, error } = await supabase.functions.invoke('parse-document', {
        body: { fileUrl, fileName }
      });
      
      if (error) {
        console.error('PDF parse error:', error);
        return {
          fileName,
          content: `[PDF文件: ${fileName}]`,
          type: fileType,
        };
      }
      
      return {
        fileName,
        content: data?.content?.slice(0, 50000) || `[PDF文件: ${fileName}]`,
        type: fileType,
      };
    }

    // For Office documents, return a placeholder
    if (fileType.includes('word') || 
        fileType.includes('document') ||
        fileName.endsWith('.doc') ||
        fileName.endsWith('.docx')) {
      return {
        fileName,
        content: `[Word文档: ${fileName}] - 请考虑将文档转换为PDF或文本格式以获得更好的解析效果`,
        type: fileType,
      };
    }

    // For images, return description
    if (fileType.startsWith('image/')) {
      return {
        fileName,
        content: `[图片文件: ${fileName}]`,
        type: fileType,
      };
    }

    // For other files, return basic info
    return {
      fileName,
      content: `[附件: ${fileName}]`,
      type: fileType,
    };
  } catch (error) {
    console.error('Error parsing file:', error);
    return {
      fileName,
      content: `[无法解析文件: ${fileName}]`,
      type: fileType,
    };
  }
}

/**
 * Parse multiple files and combine their content
 */
export async function parseMultipleFiles(files: Array<{ name: string; url?: string; type: string }>): Promise<string> {
  if (files.length === 0) return '';

  const parsedContents: string[] = [];
  
  for (const file of files) {
    if (!file.url) continue;
    
    const parsed = await parseFileContent(file.url, file.name, file.type);
    if (parsed && parsed.content) {
      parsedContents.push(`【${parsed.fileName}】\n${parsed.content}`);
    }
  }

  if (parsedContents.length === 0) return '';
  
  return `\n\n===== 参考资料 =====\n${parsedContents.join('\n\n---\n\n')}`;
}
