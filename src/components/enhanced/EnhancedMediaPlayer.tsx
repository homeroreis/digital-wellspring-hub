import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Maximize,
  Download,
  Share2,
  Heart,
  HeartHandshake
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedMediaPlayerProps {
  src: string;
  title?: string;
  description?: string;
  type: 'audio' | 'video';
  autoPlay?: boolean;
  className?: string;
  trackSlug?: string;
  dayNumber?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const EnhancedMediaPlayer: React.FC<EnhancedMediaPlayerProps> = ({
  src,
  title,
  description,
  type,
  autoPlay = false,
  className = '',
  trackSlug,
  dayNumber,
  onProgress,
  onComplete
}) => {
  const { toast } = useToast();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateTime = () => {
      setCurrentTime(media.currentTime);
      onProgress?.(media.currentTime / media.duration * 100);
    };

    const updateDuration = () => {
      setDuration(media.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
      
      // Log completion for gamification
      if (trackSlug && dayNumber) {
        // This would integrate with your progress tracking system
        toast({
          title: "Mídia concluída!",
          description: "Você ganhou pontos por completar este conteúdo.",
        });
      }
    };

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
      media.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete, trackSlug, dayNumber]);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play().catch(error => {
        console.error('Error playing media:', error);
        toast({
          title: "Erro na reprodução",
          description: "Não foi possível reproduzir a mídia.",
          variant: "destructive",
        });
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const media = mediaRef.current;
    if (!media || !duration) return;
    
    const newTime = (value[0] / 100) * duration;
    media.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const media = mediaRef.current;
    if (!media) return;
    
    const newVolume = value[0] / 100;
    media.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    
    if (isMuted) {
      media.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;
    
    media.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
  };

  const toggleFullscreen = () => {
    if (type !== 'video') return;
    
    const media = mediaRef.current;
    if (!media) return;

    if (!isFullscreen) {
      media.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const media = mediaRef.current;
    if (!media) return;
    
    media.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "O download do arquivo foi iniciado.",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Conteúdo Digital Wellspring',
          text: description || 'Confira este conteúdo incrível!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description: "Link da página copiado para a área de transferência.",
      });
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: isLiked ? "Item removido da sua lista." : "Item salvo na sua lista de favoritos.",
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Media Element */}
        <div className="relative bg-black">
          {type === 'video' ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={src}
              autoPlay={autoPlay}
              className="w-full aspect-video"
              onClick={togglePlay}
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Volume2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} autoPlay={autoPlay} />
            </div>
          )}
          
          {/* Overlay Controls for Video */}
          {type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="p-4 space-y-4">
          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && <h3 className="font-semibold truncate">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="sm" onClick={toggleLike}>
                {isLiked ? <HeartHandshake className="w-4 h-4 text-red-500" /> : <Heart className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progressPercent]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => skip(-10)}>
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button variant="default" size="sm" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => skip(10)}>
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Playback Speed */}
              <div className="flex gap-1">
                {[0.5, 1, 1.25, 1.5, 2].map((rate) => (
                  <Button
                    key={rate}
                    variant={playbackRate === rate ? "default" : "ghost"}
                    size="sm"
                    className="px-2 py-1 h-auto text-xs"
                    onClick={() => changePlaybackRate(rate)}
                  >
                    {rate}x
                  </Button>
                ))}
              </div>
            </div>

            {/* Volume and Fullscreen */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                className="w-20"
              />

              {type === 'video' && (
                <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                  <Maximize className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress Badge */}
          {progressPercent > 0 && (
            <div className="flex justify-center">
              <Badge variant="secondary">
                {Math.round(progressPercent)}% concluído
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMediaPlayer;