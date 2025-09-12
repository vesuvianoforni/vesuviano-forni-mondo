import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

const VideoPlayer = ({ src, poster, className = "" }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          video.play().catch(console.error);
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        loop
        muted={isMuted}
        playsInline
        poster={poster}
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Il tuo browser non supporta la riproduzione video.
      </video>
      
      {/* Video Controls Overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={togglePlay}
            className="bg-black/50 text-white hover:bg-black/70 border-none backdrop-blur-sm"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleMute}
            className="bg-black/50 text-white hover:bg-black/70 border-none backdrop-blur-sm"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
        </div>
      </div>

      {/* Loading indicator */}
      {!isInView && (
        <div className="absolute inset-0 bg-charcoal-800 rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-vesuviano-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;