
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Move, ZoomIn, ZoomOut } from "lucide-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const selectedOven = ovenTypes.find(oven => oven.value === selectedOvenType);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
        videoRef.current.play();
        setStream(mediaStream);
        setIsARMode(true);
        toast.success("Modalità AR attivata! Muovi il forno con i controlli");
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
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: isARMode ? 'transparent' : '#f0f0f0' }}>
      {/* Video AR Background - Layer più basso */}
      {isARMode && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 1,
            transform: 'scaleX(-1)', // Mirror effect
          }}
        />
      )}

      {/* Canvas 3D - Layer intermedio con trasparenza in AR */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        <Canvas
          camera={{ position: [0, 2, 5], fov: 60 }}
          gl={{ 
            alpha: true, 
            premultipliedAlpha: false,
            antialias: true,
            preserveDrawingBuffer: true
          }}
          style={{ 
            background: 'transparent',
            pointerEvents: isARMode ? 'none' : 'auto'
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
      </div>

      {/* Controlli UI - Layer superiore */}
      <div className="absolute top-4 left-4 right-4" style={{ zIndex: 10 }}>
        <div className="flex justify-between items-center">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-medium">{selectedOven?.label}</p>
            {isARMode && (
              <p className="text-xs text-gray-300">Modalità AR Attiva</p>
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

      {/* Controlli AR - Layer superiore */}
      <div className="absolute bottom-4 left-4 right-4" style={{ zIndex: 10 }}>
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
              <Button
                onClick={stopAR}
                variant="outline"
                className="w-full bg-white/90 text-black hover:bg-white"
              >
                Ferma AR
              </Button>
              
              {/* Controlli movimento */}
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  size="sm" 
                  onClick={() => moveOven('left')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  ←
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => moveOven('up')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  ↑
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => moveOven('right')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  →
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => moveOven('backward')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  ⤴
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => moveOven('down')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  ↓
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => moveOven('forward')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  ⤵
                </Button>
              </div>
              
              {/* Controlli rotazione e scala */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => rotateOven('y')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => scaleOven('down')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => scaleOven('up')}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={resetPosition}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <Move className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARVisualizer;
