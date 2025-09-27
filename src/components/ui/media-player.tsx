import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { Slider } from './slider';

interface MediaPlayerProps {
  src: string;
  title?: string;
  type: 'audio' | 'video';
  autoPlay?: boolean;
  className?: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({
  src,
  title,
  type,
  autoPlay = false,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!mediaRef.current) return;

    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    setCurrentTime(mediaRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!mediaRef.current) return;
    setDuration(mediaRef.current.duration);
  };

  const handleSeek = (newTime: number[]) => {
    if (!mediaRef.current) return;
    const time = newTime[0];
    mediaRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    if (!mediaRef.current) return;
    const vol = newVolume[0];
    mediaRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    
    if (isMuted) {
      mediaRef.current.volume = volume;
      setIsMuted(false);
    } else {
      mediaRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    if (!mediaRef.current) return;
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    mediaRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      
      {type === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          autoPlay={autoPlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="w-full rounded-lg"
          controls={false}
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          autoPlay={autoPlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Controls */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-10)}
            disabled={!duration}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={togglePlay}
            disabled={!src}
            size="lg"
            className="rounded-full w-12 h-12"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(10)}
            disabled={!duration}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </Card>
  );
};