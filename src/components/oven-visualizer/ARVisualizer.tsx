
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, useLoader } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Move, ZoomIn, ZoomOut, Settings, ChevronUp, ChevronDown, Palette } from "lucide-react";
import { toast } from "sonner";
import { OvenType } from './OvenTypeSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

interface ARVisualizerProps {
  selectedOvenType: string;
  ovenTypes: OvenType[];
  onClose: () => void;
  uploadedModel?: {url: string, name: string} | null;
}

// Componente per caricare modelli 3D reali
const Uploaded3DModel = ({ 
  modelUrl, 
  position, 
  rotation, 
  scale 
}: { 
  modelUrl: string; 
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Caricamento modello da URL:', modelUrl);
        
        const fileExtension = modelUrl.split('.').pop()?.toLowerCase();
        console.log('Estensione file rilevata:', fileExtension);
        
        if (fileExtension === 'gltf' || fileExtension === 'glb') {
          const loader = new GLTFLoader();
          
          loader.load(
            modelUrl,
            (gltf) => {
              console.log('Modello GLTF caricato con successo:', gltf);
              // Scala automatica del modello se necessario
              const box = new THREE.Box3().setFromObject(gltf.scene);
              const size = box.getSize(new THREE.Vector3());
              const maxSize = Math.max(size.x, size.y, size.z);
              if (maxSize > 3) {
                const scaleFactor = 2 / maxSize;
                gltf.scene.scale.multiplyScalar(scaleFactor);
              }
              
              setModel(gltf.scene);
              setLoading(false);
              toast.success('Modello 3D caricato con successo!');
            },
            (progress) => {
              console.log('Progresso caricamento GLTF:', progress);
            },
            (error) => {
              console.error('Errore caricamento GLTF:', error);
              setError('Errore nel caricamento del modello GLTF');
              setLoading(false);
              toast.error('Errore nel caricamento del modello GLTF');
            }
          );
        } else if (fileExtension === 'obj') {
          // Prova a caricare il file MTL se disponibile
          const mtlUrl = modelUrl.replace('.obj', '.mtl');
          const objLoader = new OBJLoader();
          
          // Prova prima a caricare il materiale MTL
          const mtlLoader = new MTLLoader();
          
          try {
            // Carica prima il file MTL se esiste
            const response = await fetch(mtlUrl, { method: 'HEAD' });
            if (response.ok) {
              mtlLoader.load(
                mtlUrl,
                (materials) => {
                  console.log('Materiali MTL caricati:', materials);
                  materials.preload();
                  objLoader.setMaterials(materials);
                  
                  objLoader.load(
                    modelUrl,
                    (obj) => {
                      console.log('Modello OBJ con materiali caricato:', obj);
                      // Scala automatica del modello
                      const box = new THREE.Box3().setFromObject(obj);
                      const size = box.getSize(new THREE.Vector3());
                      const maxSize = Math.max(size.x, size.y, size.z);
                      if (maxSize > 3) {
                        const scaleFactor = 2 / maxSize;
                        obj.scale.multiplyScalar(scaleFactor);
                      }
                      
                      setModel(obj);
                      setLoading(false);
                      toast.success('Modello OBJ con materiali caricato!');
                    },
                    (progress) => {
                      console.log('Progresso caricamento OBJ:', progress);
                    },
                    (error) => {
                      console.error('Errore caricamento OBJ con materiali:', error);
                      // Fallback: carica solo OBJ senza materiali
                      loadObjWithoutMaterials();
                    }
                  );
                },
                (progress) => {
                  console.log('Progresso caricamento MTL:', progress);
                },
                (error) => {
                  console.log('MTL non trovato, carico solo OBJ:', error);
                  loadObjWithoutMaterials();
                }
              );
            } else {
              loadObjWithoutMaterials();
            }
          } catch (err) {
            console.log('MTL non disponibile, carico solo OBJ');
            loadObjWithoutMaterials();
          }
          
          function loadObjWithoutMaterials() {
            objLoader.load(
              modelUrl,
              (obj) => {
                console.log('Modello OBJ caricato senza materiali:', obj);
                // Applica un materiale di default
                obj.traverse((child) => {
                  if (child instanceof THREE.Mesh) {
                    child.material = new THREE.MeshStandardMaterial({ 
                      color: 0xCC6600,
                      roughness: 0.5,
                      metalness: 0.2
                    });
                  }
                });
                
                // Scala automatica del modello
                const box = new THREE.Box3().setFromObject(obj);
                const size = box.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                if (maxSize > 3) {
                  const scaleFactor = 2 / maxSize;
                  obj.scale.multiplyScalar(scaleFactor);
                }
                
                setModel(obj);
                setLoading(false);
                toast.success('Modello OBJ caricato!');
              },
              (progress) => {
                console.log('Progresso caricamento OBJ:', progress);
              },
              (error) => {
                console.error('Errore caricamento OBJ:', error);
                setError('Errore nel caricamento del modello OBJ');
                setLoading(false);
                toast.error('Errore nel caricamento del modello OBJ');
              }
            );
          }
        } else {
          setError('Formato file non supportato. Supportati: GLB, GLTF, OBJ');
          setLoading(false);
          toast.error('Formato file non supportato');
        }
      } catch (err) {
        console.error('Errore generale nel caricamento:', err);
        setError('Errore nel caricamento del modello');
        setLoading(false);
        toast.error('Errore nel caricamento del modello');
      }
    };

    if (modelUrl) {
      loadModel();
    }
  }, [modelUrl]);

  if (loading) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="yellow"
          anchorX="center"
          anchorY="middle"
        >
          Caricamento modello...
        </Text>
      </group>
    );
  }

  if (error || !model) {
    return (
      <group position={position}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.2}
          color="red"
          anchorX="center"
          anchorY="middle"
        >
          {error || 'Modello non disponibile'}
        </Text>
      </group>
    );
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={model.clone()} />
    </group>
  );
};

// Componente 3D del forno con materiali personalizzabili (fallback)
const DefaultOvenModel = ({ 
  ovenType, 
  position, 
  rotation, 
  scale, 
  material, 
  color 
}: { 
  ovenType: string; 
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  material: string;
  color: string;
}) => {
  const getOvenColor = (selectedColor: string, selectedMaterial: string) => {
    const colors = {
      nero: "#2C2C2C",
      oro: "#FFD700",
      rosso: "#DC143C",
      bianco: "#F5F5F5",
      blu: "#4169E1"
    };
    
    let baseColor = colors[selectedColor as keyof typeof colors] || "#D2691E";
    
    if (selectedMaterial === "ferro") {
      switch (selectedColor) {
        case "oro": return "#B8860B";
        case "nero": return "#1C1C1C";
        default: return baseColor;
      }
    }
    
    return baseColor;
  };

  const getMaterialProperties = (selectedMaterial: string, selectedColor: string) => {
    const baseColor = getOvenColor(selectedColor, selectedMaterial);
    
    switch (selectedMaterial) {
      case "vernice":
        return { color: baseColor, roughness: 0.3, metalness: 0.1 };
      case "mosaico":
        return { color: baseColor, roughness: 0.8, metalness: 0.0 };
      case "ferro":
        return { color: baseColor, roughness: 0.2, metalness: 0.8 };
      default:
        return { color: baseColor, roughness: 0.5, metalness: 0.2 };
    }
  };

  const materialProps = getMaterialProperties(material, color);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 0.3, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 1.5, 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[1.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      
      <mesh position={[0, -0.2, 1.05]}>
        <boxGeometry args={[0.8, 1, 0.1]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      <mesh position={[0, 1.8, -0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
        <meshStandardMaterial color="#2C2C2C" />
      </mesh>
      
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`${material.toUpperCase()} - ${color.toUpperCase()}`}
      </Text>
    </group>
  );
};

const ARVisualizer = ({ selectedOvenType, ovenTypes, onClose, uploadedModel }: ARVisualizerProps) => {
  const [isARMode, setIsARMode] = useState(false);
  const [ovenPosition, setOvenPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [ovenRotation, setOvenRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [ovenScale, setOvenScale] = useState(1);
  const [showContactForm, setShowContactForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [showMaterialControls, setShowMaterialControls] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("vernice");
  const [selectedColor, setSelectedColor] = useState("rosso");
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    wantsContact: false
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const selectedOven = ovenTypes.find(oven => oven.value === selectedOvenType);

  const materialOptions = [
    { value: "vernice", label: "Vernice" },
    { value: "mosaico", label: "Mosaico" },
    { value: "ferro", label: "Ferro" }
  ];

  const colorOptions = [
    { value: "nero", label: "Nero" },
    { value: "oro", label: "Oro" },
    { value: "rosso", label: "Rosso" },
    { value: "bianco", label: "Bianco" },
    { value: "blu", label: "Blu" }
  ];

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

  const captureScreenshot = async () => {
    if (!containerRef.current || !isARMode) return;

    try {
      // Nascondi temporaneamente i controlli
      const controlsElement = containerRef.current.querySelector('.ar-controls');
      const headerElement = containerRef.current.querySelector('.ar-header');
      
      if (controlsElement) (controlsElement as HTMLElement).style.display = 'none';
      if (headerElement) (headerElement as HTMLElement).style.display = 'none';

      // Aspetta un frame per assicurarsi che i controlli siano nascosti
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Usa html2canvas per catturare l'intero contenuto
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 1,
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });

      // Ripristina i controlli
      if (controlsElement) (controlsElement as HTMLElement).style.display = 'block';
      if (headerElement) (headerElement as HTMLElement).style.display = 'flex';

      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      setShowContactForm(true);
      
      toast.success("Screenshot catturato! Inserisci i tuoi dati per scaricare");
    } catch (error) {
      console.error("Errore durante la cattura dello screenshot:", error);
      toast.error("Errore durante la cattura dello screenshot");
      
      // Ripristina i controlli in caso di errore
      const controlsElement = containerRef.current?.querySelector('.ar-controls');
      const headerElement = containerRef.current?.querySelector('.ar-header');
      if (controlsElement) (controlsElement as HTMLElement).style.display = 'block';
      if (headerElement) (headerElement as HTMLElement).style.display = 'flex';
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.phone) {
      toast.error("Tutti i campi sono obbligatori");
      return;
    }

    if (!capturedImage) return;

    // Crea e scarica l'immagine
    const link = document.createElement('a');
    link.download = `vesuviano-ar-${Date.now()}.png`;
    link.href = capturedImage;
    link.click();

    // Log dei dati di contatto (in un'applicazione reale, questi andrebbero salvati nel database)
    console.log('Dati contatto:', contactData);

    // Reset
    setShowContactForm(false);
    setCapturedImage(null);
    setContactData({ firstName: '', lastName: '', email: '', phone: '', wantsContact: false });
    
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
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-hidden">
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
          pointerEvents: 'auto'
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {selectedOven && uploadedModel && (
          <Uploaded3DModel
            modelUrl={uploadedModel.url}
            position={ovenPosition}
            rotation={ovenRotation}
            scale={ovenScale}
          />
        )}
        
        {selectedOven && !uploadedModel && (
          <DefaultOvenModel
            ovenType={selectedOvenType}
            position={ovenPosition}
            rotation={ovenRotation}
            scale={ovenScale}
            material={selectedMaterial}
            color={selectedColor}
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Inserisci i tuoi dati</h3>
            <p className="text-sm text-gray-600 mb-4">
              Per scaricare la foto del forno AR, inserisci i tuoi dati di contatto
            </p>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome *</label>
                  <input
                    type="text"
                    value={contactData.firstName}
                    onChange={(e) => setContactData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Cognome *</label>
                  <input
                    type="text"
                    value={contactData.lastName}
                    onChange={(e) => setContactData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Numero di telefono *</label>
                <input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="contact-consent"
                  checked={contactData.wantsContact}
                  onCheckedChange={(checked) => 
                    setContactData(prev => ({ ...prev, wantsContact: checked as boolean }))}
                />
                <label 
                  htmlFor="contact-consent" 
                  className="text-sm text-gray-700 leading-tight cursor-pointer"
                >
                  Desidero essere ricontattato per ricevere informazioni sui forni Vesuviano
                </label>
              </div>
              
              <div className="flex gap-3 pt-2">
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
      <div className="ar-header absolute top-4 left-4 right-4 z-10 pointer-events-auto">
        <div className="flex justify-between items-center">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-medium">{selectedOven?.label}</p>
            <p className="text-xs text-gray-300">{selectedMaterial} - {selectedColor}</p>
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
      <div className="ar-controls absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
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
              
              {/* Toggle per controlli materiali e colori */}
              <Button
                onClick={() => setShowMaterialControls(!showMaterialControls)}
                className="w-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center gap-2"
                size="sm"
              >
                <Palette className="w-4 h-4" />
                Materiali e Colori
                {showMaterialControls ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
              
              {/* Controlli materiali e colori */}
              {showMaterialControls && (
                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white text-xs mb-1 block">Materiale</Label>
                      <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                        <SelectTrigger className="h-8 text-xs bg-white/90">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {materialOptions.map((material) => (
                            <SelectItem key={material.value} value={material.value}>
                              {material.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-white text-xs mb-1 block">Colore</Label>
                      <Select value={selectedColor} onValueChange={setSelectedColor}>
                        <SelectTrigger className="h-8 text-xs bg-white/90">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              {color.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Toggle per controlli di posizionamento */}
              <Button
                onClick={() => setShowControls(!showControls)}
                className="w-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center gap-2"
                size="sm"
              >
                <Settings className="w-4 h-4" />
                Controlli Posizione
                {showControls ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
              
              {/* Controlli di posizionamento */}
              {showControls && (
                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  {/* Controlli movimento */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" onClick={() => moveOven('left')} className="bg-white/20 text-white hover:bg-white/30 text-xs">
                      ← Sinistra
                    </Button>
                    <Button size="sm" onClick={() => moveOven('up')} className="bg-white/20 text-white hover:bg-white/30 text-xs">
                      ↑ Su
                    </Button>
                    <Button size="sm" onClick={() => moveOven('right')} className="bg-white/20 text-white hover:bg-white/30 text-xs">
                      Destra →
                    </Button>
                    <Button size="sm" onClick={() => moveOven('backward')} className="bg-white/20 text-white hover:bg-white/30 text-xs">
                      ↙ Indietro
                    </Button>
                    <Button size="sm" onClick={() => moveOven('down')} className="bg-white/20 text-white hover:bg-white/30 text-xs">
                      ↓ Giù
                    </Button>
                    <Button size="sm" onClick={() => moveOven('forward')} className="bg-white/20 text-white hover:bg-white/30 text-xs">
                      Avanti ↗
                    </Button>
                  </div>
                  
                  {/* Controlli scala e rotazione */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={() => scaleOven('down')} className="bg-white/20 text-white hover:bg-white/30">
                      <ZoomOut className="w-4 h-4 mr-1" />
                      Riduci
                    </Button>
                    <Button size="sm" onClick={() => scaleOven('up')} className="bg-white/20 text-white hover:bg-white/30">
                      <ZoomIn className="w-4 h-4 mr-1" />
                      Ingrandisci
                    </Button>
                    <Button size="sm" onClick={() => rotateOven('y')} className="bg-white/20 text-white hover:bg-white/30">
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Ruota
                    </Button>
                    <Button size="sm" onClick={resetPosition} className="bg-white/20 text-white hover:bg-white/30">
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
