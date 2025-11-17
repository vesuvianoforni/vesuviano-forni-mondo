import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface Video360ModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const Video360Modal = ({ open, onClose, videoUrl, title }: Video360ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Video 360° - {title}</DialogTitle>
            <button 
              onClick={onClose}
              className="rounded-full p-1 hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <video 
            controls 
            autoPlay
            className="w-full h-full"
            src={videoUrl}
          >
            Il tuo browser non supporta il tag video.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Video360Modal;
