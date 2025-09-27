import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileAudio, FileVideo, FileImage, File, Trash2, Download, Eye, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  content_id?: string;
  alt_text?: string;
  caption?: string;
  created_at: string;
}

interface MediaUploadManagerProps {
  trackSlug?: string;
  onMediaSelect?: (media: MediaFile) => void;
}

const MediaUploadManager: React.FC<MediaUploadManagerProps> = ({ 
  trackSlug, 
  onMediaSelect 
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadMediaFiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar arquivos de mídia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (activeTab === 'library') {
      loadMediaFiles();
    }
  }, [activeTab, loadMediaFiles]);

  const getBucketName = (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'content-images';
    if (fileType.startsWith('video/')) return 'content-videos';
    if (fileType.startsWith('audio/')) return 'content-audio';
    return 'content-documents';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const bucketName = getBucketName(file.type);
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        // Save to content_media table
        const { error: dbError } = await supabase
          .from('content_media')
          .insert({
            content_id: '00000000-0000-0000-0000-000000000000', // Temporary placeholder
            file_name: file.name,
            file_path: publicUrl,
            file_type: file.type.split('/')[0], // image, video, audio, etc.
            file_size: file.size,
            mime_type: file.type,
            alt_text: file.name.split('.')[0] // Default alt text
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Upload Concluído",
        description: `${files.length} arquivo(s) enviado(s) com sucesso!`,
      });

      // Reload media files if in library tab
      if (activeTab === 'library') {
        loadMediaFiles();
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erro no Upload",
        description: "Erro ao enviar arquivos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDeleteMedia = async (mediaId: string, filePath: string) => {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return;

    try {
      // Delete from storage (extract file name from URL)
      const fileName = filePath.split('/').pop();
      if (fileName) {
        // Try to delete from all buckets (since we don't know which one)
        const buckets = ['content-images', 'content-videos', 'content-audio', 'content-documents'];
        for (const bucket of buckets) {
          await supabase.storage.from(bucket).remove([fileName]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('content_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      toast({
        title: "Arquivo Excluído",
        description: "Arquivo removido com sucesso.",
      });

      loadMediaFiles();

    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir arquivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Gerenciador de Mídia
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'library')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className={`mx-auto h-12 w-12 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="mt-4">
                <p className="text-lg font-medium">
                  Arraste arquivos aqui ou
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : 'Selecione arquivos'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Formatos suportados: PNG, JPG, GIF, SVG, MP4, MP3, WAV, PDF
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Carregando...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiles.map((media) => (
                  <Card key={media.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center relative">
                      {media.file_type === 'image' ? (
                        <img
                          src={media.file_path}
                          alt={media.alt_text || media.file_name}
                          className="w-full h-full object-cover"
                        />
                      ) : media.file_type === 'video' ? (
                        <div className="relative w-full h-full bg-black/10 flex items-center justify-center">
                          <Play className="w-8 h-8 text-muted-foreground" />
                          <video className="w-full h-full object-cover opacity-50">
                            <source src={media.file_path} />
                          </video>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          {getFileIcon(media.mime_type || '')}
                          <p className="text-xs text-muted-foreground mt-1 text-center px-2">
                            {media.file_name}
                          </p>
                        </div>
                      )}
                      
                      {/* File type badge */}
                      <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                        {media.file_type}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {media.file_name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(media.file_size)}
                          </p>
                        </div>
                        
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMediaSelect?.(media)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(media.file_path, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMedia(media.id, media.file_path)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {mediaFiles.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Nenhum arquivo encontrado
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MediaUploadManager;