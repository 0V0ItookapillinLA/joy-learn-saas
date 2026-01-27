-- 创建培训资料存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-attachments', 'training-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 允许认证用户上传文件
CREATE POLICY "Authenticated users can upload training attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'training-attachments');

-- 允许所有人读取文件
CREATE POLICY "Anyone can view training attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'training-attachments');

-- 允许用户删除自己上传的文件
CREATE POLICY "Users can delete own training attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'training-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);