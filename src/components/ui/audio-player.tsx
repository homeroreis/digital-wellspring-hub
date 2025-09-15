import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title = "Áudio Devocional",
  className,
  autoPlay = false,
  onPlay,
  onPause,
  onEnded
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src, onEnded]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        onPause?.();
      } else {
        await audio.play();
        setIsPlaying(true);
        onPlay?.();
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = newValue[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newValue: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = newValue[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!src) {
    return (
      <div className={cn(
        "bg-muted/50 border border-dashed border-muted-foreground/25 rounded-lg p-6 text-center",
        className
      )}>
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Áudio não disponível
            </p>
            <p className="text-xs text-muted-foreground/75">
              O conteúdo de áudio será adicionado em breve
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-card border rounded-lg p-4 space-y-4",
      className
    )}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        autoPlay={autoPlay}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
          disabled={!src || duration === 0}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayPause}
            disabled={!src || isLoading}
            className="w-10 h-10 p-0"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={restart}
            disabled={!src}
            className="w-8 h-8 p-0"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="w-8 h-8 p-0"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};