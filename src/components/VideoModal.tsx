import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoModal = ({ isOpen, onClose, videoUrl, title }: VideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black border-none">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-300"
          aria-label="Chiudi video"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="relative w-full aspect-video bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            loop
            autoPlay
            playsInline
            muted
            controls
          />
        </div>
        
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
          <h3 className="text-white font-playfair text-xl md:text-2xl font-bold text-center drop-shadow-lg">
            {title}
          </h3>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
