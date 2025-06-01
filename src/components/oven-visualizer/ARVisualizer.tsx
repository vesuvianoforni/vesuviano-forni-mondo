
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Cylinder } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Move, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { OvenType } from './OvenTypeSelector';

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
      <Cylinder args={[1.2, 1.5, 0.3, 16]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#654321" />
      </Cylinder>
      
      {/* Corpo principale del forno */}
      <Box args={[2.5, 1.5, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color={ovenColor} />
      </Box>
      
      {/* Cupola del forno */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={ovenColor} />
      </mesh>
      
      {/* Porta del forno */}
      <Box args={[0.8, 1, 0.1]} position={[0, -0.2, 1.05]}>
        <meshStandardMaterial color="#2C2C2C" />
      </Box>
      
      {/* Camino */}
      <Cylinder args={[0.2, 0.2, 1.5, 8]} position={[0, 1.8, -0.5]}>
        <meshStandardMaterial color="#2C2C2C" />
      </Cylinder>
      
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
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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
    <div className="fixed inset-0 bg-black z-50">
      {/* Video AR Background */}
      {isARMode && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Canvas 3D */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 2, 5], fov: 60 }}
          style={{ background: isARMode ? 'transparent' : '#f0f0f0' }}
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
          
          {!isARMode && <OrbitControls />}
          {!isARMode && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
              <planeGeometry args={[20, 20]} />
              <meshStandardMaterial color="#e0e0e0" />
            </mesh>
          )}
        </Canvas>
      </div>

      {/* Controlli UI */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex justify-between items-center">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">{selectedOven?.label}</p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/90 text-black"
          >
            Chiudi AR
          </Button>
        </div>
      </div>

      {/* Controlli AR */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-black/70 p-4 rounded-lg">
          {!isARMode ? (
            <Button
              onClick={startAR}
              className="w-full bg-vesuviano-500 hover:bg-vesuviano-600 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Avvia Modalità AR
            </Button>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={stopAR}
                variant="outline"
                className="w-full bg-white/90 text-black"
              >
                Ferma AR
              </Button>
              
              {/* Controlli movimento */}
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" onClick={() => moveOven('left')}>←</Button>
                <Button size="sm" onClick={() => moveOven('up')}>↑</Button>
                <Button size="sm" onClick={() => moveOven('right')}>→</Button>
                <Button size="sm" onClick={() => moveOven('backward')}>⤴</Button>
                <Button size="sm" onClick={() => moveOven('down')}>↓</Button>
                <Button size="sm" onClick={() => moveOven('forward')}>⤵</Button>
              </div>
              
              {/* Controlli rotazione e scala */}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => rotateOven('y')}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => scaleOven('down')}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={() => scaleOven('up')}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={resetPosition}>
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
