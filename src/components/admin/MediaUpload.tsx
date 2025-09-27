import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, FileText, Image, Video, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  bucket: string;
  created_at: string;
}

interface MediaUploadProps {
  onFileUploaded?: (file: MediaFile) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  bucket?: 'content-images' | 'content-videos' | 'content-audio' | 'content-documents';
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onFileUploaded,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  maxSize = 50 * 1024 * 1024, // 50MB
  bucket = 'content-images'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const { toast } = useToast();

  const getBucket = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'content-images';
    if (fileType.startsWith('video/')) return 'content-videos';
    if (fileType.startsWith('audio/')) return 'content-audio';
    return 'content-documents';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const targetBucket = getBucket(file.type);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(filePath);

      // Save media metadata to content_media table
      const { data: mediaData, error: mediaError } = await supabase
        .from('content_media')
        .insert({
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          mime_type: file.type,
          content_id: crypto.randomUUID(), // Temporary - should be linked to content
          alt_text: file.name
        })
        .select()
        .single();

      if (mediaError) throw mediaError;

      const uploadedFile: MediaFile = {
        id: mediaData.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
        bucket: targetBucket,
        created_at: mediaData.created_at
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      onFileUploaded?.(uploadedFile);

      toast({
        title: "Upload concluído",
        description: `${file.name} foi enviado com sucesso.`,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.size > maxSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o tamanho máximo de ${formatFileSize(maxSize)}.`,
          variant: "destructive",
        });
        continue;
      }
      await uploadFile(file);
    }
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: true
  });

  const deleteFile = async (fileId: string, fileName: string, bucket: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('content_media')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));

      toast({
        title: "Arquivo removido",
        description: `${fileName} foi removido com sucesso.`,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Erro ao remover",
        description: "Falha ao remover o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Mídia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Máximo {formatFileSize(maxSize)} por arquivo
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Enviando arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="secondary">{file.bucket}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(file.url)}
                    >
                      Copiar URL
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.id, file.name, file.bucket)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaUpload;