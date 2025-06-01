import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Move, ZoomIn, ZoomOut, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { OvenType } from './OvenTypeSelector';
import * as THREE from 'three';

interface ARVisualizerProps {
  selectedOvenType: string;
  ovenTypes: OvenType[];
  onClose: () => void;
}

// Componente 3D del forno semplificato
const OvenModel = ({ ovenType, position, rotation, scale }: { 
  ovenType: string; 
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) => {
  const getOvenColor = (type: string) => {
    switch (type) {
      case "vesuviobuono": return "#D2691E"; // Terracotta con mosaico
      case "verniciato": return "#CD853F"; // Terracotta verniciata
      case "mosaicato": return "#8B4513"; // Marrone mosaico
      default: return "#D2691E";
    }
  };

  const ovenColor = getOvenColor(ovenType);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Base del forno */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 0.3, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Corpo principale del forno */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 1.5, 2]} />
        <meshStandardMaterial color={ovenColor} />
      </mesh>
      
      {/* Cupola del forno */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={ovenColor} />
      </mesh>
      
      {/* Porta del forno */}
      <mesh position={[0, -0.2, 1.05]}>
        <boxGeometry args={[0.8, 1, 0.1]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      {/* Camino */}
      <mesh position={[0, 1.8, -0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      {/* Testo identificativo */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {ovenType.toUpperCase()}
      </Text>
    </group>
  );
};

const ARVisualizer = ({ selectedOvenType, ovenTypes, onClose }: ARVisualizerProps) => {
  const [isARMode, setIsARMode] = useState(false);
  const [ovenPosition, setOvenPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [ovenRotation, setOvenRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [ovenScale, setOvenScale] = useState(1);
  const [showContactForm, setShowContactForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Touch gesture states
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [isGesturing, setIsGesturing] = useState(false);

  const selectedOven = ovenTypes.find(oven => oven.value === selectedOvenType);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Touch gesture handlers
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    setIsGesturing(true);
    
    if (e.touches.length === 1) {
      // Single touch - prepare for drag
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // Two fingers - prepare for scale/rotate
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setTouchStart(null);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    
    if (!isGesturing) return;

    if (e.touches.length === 1 && touchStart) {
      // Single finger drag - move oven
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;
      
      const moveScale = 0.01;
      setOvenPosition(prev => [
        prev[0] + deltaX * moveScale,
        prev[1] - deltaY * moveScale, // Inverse Y for natural movement
        prev[2]
      ]);
      
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2 && lastTouchDistance) {
      // Two fingers - scale and rotate
      const currentDistance = getTouchDistance(e.touches);
      
      if (currentDistance && lastTouchDistance) {
        // Scale based on distance change
        const scaleChange = currentDistance / lastTouchDistance;
        setOvenScale(prev => {
          const newScale = prev * scaleChange;
          return Math.max(0.3, Math.min(3, newScale));
        });
        
        // Rotate based on finger movement
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const angle = Math.atan2(
          touch2.clientY - touch1.clientY,
          touch2.clientX - touch1.clientX
        );
        
        setOvenRotation(prev => [
          prev[0],
          prev[1] + angle * 0.01, // Small rotation increment
          prev[2]
        ]);
        
        setLastTouchDistance(currentDistance);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    setIsGesturing(false);
    setTouchStart(null);
    setLastTouchDistance(null);
    
    // Prevent double tap zoom
    const now = new Date().getTime();
    const timeSince = now - (window as any).lastTouchEnd;
    if (timeSince < 300 && timeSince > 0) {
      e.preventDefault();
    }
    (window as any).lastTouchEnd = now;
  };

  // Disabilita il doppio tap zoom e aggiungi gesture touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isARMode) return;

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isARMode, touchStart, lastTouchDistance, isGesturing]);

  const startAR = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsARMode(true);
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error);
          }
        };
        
        toast.success("Modalità AR attivata! Usa i controlli per posizionare il forno");
      }
    } catch (error) {
      console.error("Errore accesso fotocamera:", error);
      toast.error("Impossibile accedere alla fotocamera");
    }
  };

  const stopAR = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsARMode(false);
  };

  const captureScreenshot = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Imposta le dimensioni del canvas
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Disegna il video (non specchiato)
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Converti in base64
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    setShowContactForm(true);
    
    toast.success("Screenshot catturato! Inserisci i tuoi dati per scaricare");
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData.name || !contactData.email) {
      toast.error("Nome ed email sono obbligatori");
      return;
    }

    if (!capturedImage) return;

    // Crea e scarica l'immagine
    const link = document.createElement('a');
    link.download = `vesuviano-ar-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();

    // Reset
    setShowContactForm(false);
    setCapturedImage(null);
    setContactData({ name: '', email: '', phone: '' });
    
    toast.success("Foto scaricata! Ti contatteremo presto per informazioni sui nostri forni");
  };

  const resetPosition = () => {
    setOvenPosition([0, 0, 0]);
    setOvenRotation([0, 0, 0]);
    setOvenScale(1);
    toast.info("Posizione forno ripristinata");
  };

  const moveOven = (direction: string) => {
    const step = 0.5;
    setOvenPosition(prev => {
      switch (direction) {
        case 'left': return [prev[0] - step, prev[1], prev[2]];
        case 'right': return [prev[0] + step, prev[1], prev[2]];
        case 'up': return [prev[0], prev[1] + step, prev[2]];
        case 'down': return [prev[0], prev[1] - step, prev[2]];
        case 'forward': return [prev[0], prev[1], prev[2] - step];
        case 'backward': return [prev[0], prev[1], prev[2] + step];
        default: return prev;
      }
    });
  };

  const rotateOven = (axis: string) => {
    const step = Math.PI / 8;
    setOvenRotation(prev => {
      switch (axis) {
        case 'x': return [prev[0] + step, prev[1], prev[2]];
        case 'y': return [prev[0], prev[1] + step, prev[2]];
        case 'z': return [prev[0], prev[1], prev[2] + step];
        default: return prev;
      }
    });
  };

  const scaleOven = (direction: string) => {
    setOvenScale(prev => {
      const newScale = direction === 'up' ? prev * 1.1 : prev * 0.9;
      return Math.max(0.3, Math.min(3, newScale));
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Video di sfondo per AR */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          display: isARMode ? 'block' : 'none',
          transform: 'scaleX(1)',
        }}
      />

      {/* Canvas 3D sovrapposto */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 2, 5], fov: 60 }}
        gl={{ 
          alpha: true,
          preserveDrawingBuffer: true,
          antialias: true
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isARMode ? 'transparent' : '#f0f0f0',
          pointerEvents: isARMode ? 'none' : 'auto',
          touchAction: 'none'
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {selectedOven && (
          <OvenModel
            ovenType={selectedOvenType}
            position={ovenPosition}
            rotation={ovenRotation}
            scale={ovenScale}
          />
        )}
        
        {!isARMode && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
        {!isARMode && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>
        )}
      </Canvas>

      {/* Modal per form contatto */}
      {showContactForm && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Inserisci i tuoi dati</h3>
            <p className="text-sm text-gray-600 mb-4">
              Per scaricare la foto del forno AR, inserisci i tuoi dati di contatto
            </p>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefono</label>
                <input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-vesuviano-500 hover:bg-vesuviano-600"
                >
                  Scarica Foto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Controlli UI */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-auto">
        <div className="flex justify-between items-center">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-medium">{selectedOven?.label}</p>
            {isARMode && (
              <p className="text-xs text-gray-300">Modalità AR Attiva - Usa le dita per posizionare</p>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/90 text-black hover:bg-white"
          >
            Chiudi AR
          </Button>
        </div>
      </div>

      {/* Controlli AR */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
        <div className="bg-black/70 p-4 rounded-lg backdrop-blur-sm">
          {!isARMode ? (
            <div className="space-y-3">
              <Button
                onClick={startAR}
                className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Avvia Modalità AR
              </Button>
              <p className="text-white text-xs text-center">
                Assicurati di consentire l'accesso alla fotocamera
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Controlli principali sempre visibili */}
              <div className="flex gap-2">
                <Button
                  onClick={stopAR}
                  variant="outline"
                  className="flex-1 bg-white/90 text-black hover:bg-white"
                >
                  Ferma AR
                </Button>
                <Button
                  onClick={captureScreenshot}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Fotografa
                </Button>
              </div>
              
              {/* Istruzioni touch */}
              <div className="bg-white/10 p-3 rounded-lg">
                <p className="text-white text-xs text-center mb-2 font-medium">
                  Controlli Touch:
                </p>
                <div className="text-white text-xs space-y-1">
                  <p>• Un dito: Sposta il forno</p>
                  <p>• Due dita: Pizzica per ridimensionare e ruotare</p>
                </div>
              </div>
              
              {/* Toggle per controlli manuali (opzionali) */}
              <Button
                onClick={() => setShowControls(!showControls)}
                className="w-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center gap-2"
                size="sm"
              >
                <Settings className="w-4 h-4" />
                Controlli Manuali
                {showControls ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
              
              {/* Controlli di posizionamento manuali (fallback) */}
              {showControls && (
                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => scaleOven('down')}
                      className="bg-white/20 text-white hover:bg-white/30"
                    >
                      <ZoomOut className="w-4 h-4 mr-1" />
                      Riduci
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => scaleOven('up')}
                      className="bg-white/20 text-white hover:bg-white/30"
                    >
                      <ZoomIn className="w-4 h-4 mr-1" />
                      Ingrandisci
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => rotateOven('y')}
                      className="bg-white/20 text-white hover:bg-white/30"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Ruota
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={resetPosition}
                      className="bg-white/20 text-white hover:bg-white/30"
                    >
                      <Move className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARVisualizer;
