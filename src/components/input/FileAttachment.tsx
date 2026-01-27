import { useState, useRef } from 'react';
import { Paperclip, X, FileText, Image, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploading?: boolean;
}

interface FileAttachmentProps {
  files: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  'image': <Image className="h-4 w-4" />,
  'application/pdf': <FileText className="h-4 w-4" />,
  'text': <FileText className="h-4 w-4" />,
  'default': <File className="h-4 w-4" />,
};

function getFileIcon(type: string): React.ReactNode {
  if (type.startsWith('image/')) return FILE_ICONS['image'];
  if (type.startsWith('text/')) return FILE_ICONS['text'];
  if (type === 'application/pdf') return FILE_ICONS['application/pdf'];
  return FILE_ICONS['default'];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function FileAttachment({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  className,
}: FileAttachmentProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Check max files limit
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: '文件数量超限',
        description: `最多只能上传 ${maxFiles} 个文件`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const newFiles: AttachedFile[] = [];

    for (const file of Array.from(selectedFiles)) {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: `${file.name} 超过 ${maxSizeMB}MB 限制`,
          variant: 'destructive',
        });
        continue;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempFile: AttachedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploading: true,
      };
      
      newFiles.push(tempFile);
      // Update files with the temp file immediately
      const updatedFiles = [...files, tempFile];
      onFilesChange(updatedFiles);

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || 'anonymous';
        
        // Upload to Supabase Storage
        const filePath = `${userId}/${fileId}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('training-attachments')
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('training-attachments')
          .getPublicUrl(data.path);

        // Update file with URL - need to get current files state
        const updatedFile: AttachedFile = {
          ...tempFile,
          url: publicUrl,
          uploading: false,
        };

        // Since we can't use functional updates, we need to update files directly
        const currentFiles = files.filter(f => f.id !== fileId);
        onFilesChange([...currentFiles, updatedFile]);
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: '上传失败',
          description: `${file.name} 上传失败，请重试`,
          variant: 'destructive',
        });
        // Remove failed file
        onFilesChange(files.filter(f => f.id !== fileId));
      }
    }

    setIsUploading(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove?.url) {
      try {
        // Extract path from URL
        const urlParts = fileToRemove.url.split('/training-attachments/');
        if (urlParts[1]) {
          await supabase.storage
            .from('training-attachments')
            .remove([decodeURIComponent(urlParts[1])]);
        }
      } catch (error) {
        console.error('Failed to delete file from storage:', error);
      }
    }
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || files.length >= maxFiles}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>添加附件 ({files.length}/{maxFiles})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Attached files list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <Badge
              key={file.id}
              variant="secondary"
              className="flex items-center gap-1.5 py-1 px-2 text-xs"
            >
              {file.uploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                getFileIcon(file.type)
              )}
              <span className="max-w-[120px] truncate">{file.name}</span>
              <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(file.id)}
                className="ml-1 hover:text-destructive"
                disabled={file.uploading}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
