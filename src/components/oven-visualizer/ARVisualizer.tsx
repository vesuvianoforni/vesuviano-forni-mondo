
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Move, ZoomIn, ZoomOut, Settings, ChevronUp, ChevronDown, Palette } from "lucide-react";
import { OvenType } from './OvenTypeSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { supabase } from "@/integrations/supabase/client";

interface ARVisualizerProps {
  selectedOvenType: string;
  ovenTypes: OvenType[];
  onClose: () => void;
  onOvenTypeChange: (value: string) => void;
  uploadedModel?: {url: string, name: string} | null;
}

// Funzioni utility per gestire URL di Google Drive
const convertGoogleDriveUrl = (url: string): string => {
  console.log('Conversione URL Google Drive:', url);
  
  // Gestisci formato: /file/d/ID/
  let fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  
  // Gestisci formato: open?id=ID
  if (!fileIdMatch) {
    fileIdMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  }
  
  if (fileIdMatch) {
    const fileId = fileIdMatch[1];
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    console.log('ID file estratto:', fileId);
    console.log('URL convertito:', directUrl);
    return directUrl;
  }
  
  console.log('URL non riconosciuto come Google Drive, uso URL originale');
  return url;
};

const getFileExtensionFromUrl = (url: string): string => {
  // Estrai l'estensione dall'URL originale o dal nome del file
  const extensionMatch = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (extensionMatch) {
    return extensionMatch[1].toLowerCase();
  }
  
  // Fallback: cerca nell'URL originale
  const urlParts = url.split('.');
  if (urlParts.length > 1) {
    return urlParts[urlParts.length - 1].toLowerCase();
  }
  
  return '';
};

// Componente per caricare modelli 3D reali
const Uploaded3DModel = ({ 
  modelUrl, 
  position, 
  rotation, 
  scale,
  materialColor,
  environmentSize = 'medium'
}: { 
  modelUrl: string; 
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  materialColor: string;
  environmentSize: 'small' | 'medium' | 'large';
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastMaterialColor, setLastMaterialColor] = useState<string>('');

  // Effetto separato per aggiornare i colori del modello caricato
  useEffect(() => {
    if (model && materialColor !== lastMaterialColor) {
      console.log('🎨 Aggiornamento colore modello:', materialColor);
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color = new THREE.Color(materialColor);
            child.material.needsUpdate = true;
          } else if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.color = new THREE.Color(materialColor);
                mat.needsUpdate = true;
              }
            });
          }
        }
      });
      setLastMaterialColor(materialColor);
    }
  }, [model, materialColor, lastMaterialColor]);

  useEffect(() => {
    const loadModel = async () => {
      if (!modelUrl) {
        console.log('❌ Nessun modelUrl fornito');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Caricamento modello iniziato');
        console.log('📁 URL originale:', modelUrl);
        console.log('🔍 Tentativo di accesso diretto al file...');
        
        // Per Supabase, usiamo l'URL diretto
        const directUrl = modelUrl;
        console.log('🔗 URL finale per download:', directUrl);
        
        const fileExtension = getFileExtensionFromUrl(modelUrl);
        console.log('📄 Estensione file rilevata:', fileExtension);
        
        if (fileExtension === 'gltf' || fileExtension === 'glb') {
          const loader = new GLTFLoader();
          
          loader.load(
            directUrl,
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
            },
            (progress) => {
              console.log('Progresso caricamento GLTF:', progress);
            },
            (error) => {
              console.error('Errore caricamento GLTF:', error);
              setError('Errore nel caricamento del modello GLTF');
              setLoading(false);
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
                    directUrl,
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
              directUrl,
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
              },
              (progress) => {
                console.log('Progresso caricamento OBJ:', progress);
              },
              (error) => {
                console.error('Errore caricamento OBJ:', error);
                setError('Errore nel caricamento del modello OBJ');
                setLoading(false);
              }
            );
          }
        } else if (fileExtension === 'fbx') {
          console.log('🎯 Caricamento FBX...');
          const fbxLoader = new FBXLoader();
          
          fbxLoader.load(
            directUrl,
            (fbx) => {
              console.log('✅ Modello FBX caricato con successo:', fbx);
              
              // Aggiungi materiali se necessario
              fbx.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                  
                  // Applica colore personalizzato se non ha materiali
                  if (!child.material || (Array.isArray(child.material) && child.material.length === 0)) {
                    child.material = new THREE.MeshStandardMaterial({ 
                      color: materialColor,
                      roughness: 0.5,
                      metalness: 0.2
                    });
                  } else {
                    // Modifica il colore del materiale esistente
                    if (child.material instanceof THREE.MeshStandardMaterial) {
                      child.material.color = new THREE.Color(materialColor);
                    }
                  }
                }
              });
              
              // Scala automatica del modello per AR basata sull'ambiente
              const box = new THREE.Box3().setFromObject(fbx);
              const size = box.getSize(new THREE.Vector3());
              const maxSize = Math.max(size.x, size.y, size.z);
              
              // Scala basata su dimensioni ambiente
              const environmentSizes = {
                small: 0.6,   // Appartamento piccolo
                medium: 1.0,  // Casa normale  
                large: 1.5    // Casa grande/villa
              };
              const targetSize = environmentSizes[environmentSize];
              const scaleFactor = targetSize / maxSize;
              fbx.scale.setScalar(scaleFactor);
              
              // Centra il modello
              box.setFromObject(fbx);
              const center = box.getCenter(new THREE.Vector3());
              fbx.position.sub(center);
              
              setModel(fbx);
              setLoading(false);
            },
            (progress) => {
              console.log('📊 Progress FBX:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
              console.error('❌ Errore caricamento FBX:', error);
              setError('Errore nel caricamento del modello FBX');
              setLoading(false);
            }
          );
        } else {
          setError('Formato file non supportato. Supportati: GLB, GLTF, OBJ, FBX');
          setLoading(false);
        }
      } catch (err) {
        console.error('Errore generale nel caricamento:', err);
        setError('Errore nel caricamento del modello');
        setLoading(false);
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

const ARVisualizer = ({ selectedOvenType, ovenTypes, onClose, onOvenTypeChange, uploadedModel }: ARVisualizerProps) => {
  const [isARMode, setIsARMode] = useState(false);
  const [ovenPosition, setOvenPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [ovenRotation, setOvenRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [ovenScale, setOvenScale] = useState(1);
  const [showContactForm, setShowContactForm] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [modelColor, setModelColor] = useState('#CC6600');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  const [initialScale, setInitialScale] = useState(1);
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

  // Debug info
  console.log('ARVisualizer stato:', {
    selectedOvenType,
    selectedOven: selectedOven?.label,
    selectedOvenModelKey: selectedOven?.modelKey,
    uploadedModel: uploadedModel ? { url: uploadedModel.url, name: uploadedModel.name } : null
  });

  // Colore disattivato: rimosse opzioni colore perché non applicabili al modello 3D

  useEffect(() => {
    // Blocca lo scroll della pagina quando l'AR è attivo
    if (isARMode) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Ripristina lo scroll quando il componente viene smontato
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [stream, isARMode]);

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
        
        // AR avviata con successo
      }
    } catch (error) {
      console.error("Errore accesso fotocamera:", error);
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
      
      setShowContactForm(true);
    } catch (error) {
      console.error("Errore durante la cattura dello screenshot:", error);
      
      // Ripristina i controlli in caso di errore
      const controlsElement = containerRef.current?.querySelector('.ar-controls');
      const headerElement = containerRef.current?.querySelector('.ar-header');
      if (controlsElement) (controlsElement as HTMLElement).style.display = 'block';
      if (headerElement) (headerElement as HTMLElement).style.display = 'flex';
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.phone) {
      return;
    }

    if (!capturedImage) return;

    try {
      // Send form data to our notification system
      await supabase.functions.invoke('send-form-data', {
        body: {
          formType: 'ar-contact',
          data: contactData
        }
      });

      // Crea e scarica l'immagine
      const link = document.createElement('a');
      link.download = `vesuviano-ar-${Date.now()}.png`;
      link.href = capturedImage;
      link.click();

      // Reset
      setShowContactForm(false);
      setCapturedImage(null);
      setContactData({ firstName: '', lastName: '', email: '', phone: '', wantsContact: false });

    } catch (error) {
      console.error('Errore invio dati contatto:', error);
      
      // Procedi comunque con il download
      const link = document.createElement('a');
      link.download = `vesuviano-ar-${Date.now()}.png`;
      link.href = capturedImage;
      link.click();

      setShowContactForm(false);
      setCapturedImage(null);
      setContactData({ firstName: '', lastName: '', email: '', phone: '', wantsContact: false });
    }
  };

  const resetPosition = () => {
    setOvenPosition([0, 0, 0]);
    setOvenRotation([0, 0, 0]);
    setOvenScale(1);
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

  // Gestione touch migliorata
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Blocca lo scroll della pagina
    
    if (e.touches.length === 1) {
      // Un dito - movimento
      setIsDragging(true);
      setTouchStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // Due dita - zoom pinch
      setIsDragging(false);
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setInitialPinchDistance(distance);
      setInitialScale(ovenScale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Blocca lo scroll della pagina
    
    if (e.touches.length === 1 && isDragging) {
      // Un dito - movimento
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const deltaX = (currentX - touchStartPos.x) * 0.01;
      const deltaY = (currentY - touchStartPos.y) * 0.01;
      
      setOvenPosition(prev => [
        prev[0] + deltaX,
        prev[1] - deltaY, // Inverti Y per movimento naturale
        prev[2]
      ]);
      
      setTouchStartPos({ x: currentX, y: currentY });
    } else if (e.touches.length === 2) {
      // Due dita - zoom pinch
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      if (initialPinchDistance > 0) {
        const scale = (currentDistance / initialPinchDistance) * initialScale;
        const clampedScale = Math.max(0.3, Math.min(3, scale));
        setOvenScale(clampedScale);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Blocca lo scroll della pagina
    
    if (e.touches.length === 0) {
      setIsDragging(false);
      setInitialPinchDistance(0);
    } else if (e.touches.length === 1) {
      // Se rimane un dito, continua il movimento
      setTouchStartPos({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      });
      setIsDragging(true);
      setInitialPinchDistance(0);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ touchAction: 'none' }} // Disabilita tutti i gesti touch del browser
    >
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {selectedOven?.modelKey ? (
          <Uploaded3DModel
            modelUrl={`https://lgueucxznbqgvhpjzurf.supabase.co/storage/v1/object/public/3d-models/${selectedOven.modelKey}.fbx`}
            position={ovenPosition}
            rotation={ovenRotation}
            scale={ovenScale}
            materialColor={modelColor}
            environmentSize="medium"
          />
        ) : uploadedModel ? (
          <Uploaded3DModel
            modelUrl={uploadedModel.url}
            position={ovenPosition}
            rotation={ovenRotation}
            scale={ovenScale}
            materialColor={modelColor}
            environmentSize="medium"
          />
        ) : (
          <Text
            position={[0, 0, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Seleziona un tipo di forno
          </Text>
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
          <div className="bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
            <p className="text-sm font-medium">{selectedOven?.label}</p>
          </div>
          <div className="flex gap-3 items-center">
            {isARMode && (
              <Button
                onClick={captureScreenshot}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300 px-5 py-2 text-sm font-semibold rounded-full"
                size="sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                Foto
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-white/20 text-white hover:bg-white/30 border-white/40 rounded-full"
            >
              ×
            </Button>
          </div>
        </div>
      </div>

      {/* Controlli AR - UI aggiornata */}
      <div className="ar-controls absolute bottom-4 left-4 right-4 z-10 pointer-events-auto">
        <div className="bg-black/30 p-4 rounded-lg backdrop-blur-sm border border-white/20">
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
              {/* Selezione modello forno */}
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/30">
                <Label className="text-white text-sm block mb-3 font-medium">Seleziona il modello:</Label>
                <div className="grid grid-cols-3 gap-2">
                  {ovenTypes.map((oven) => (
                    <button
                      key={oven.value}
                      onClick={() => {
                        console.log('🔧 Cambio modello:', oven.value);
                        onOvenTypeChange(oven.value);
                      }}
                      className={`p-2 rounded-lg text-xs text-white border-2 transition-all duration-200 ${
                        selectedOvenType === oven.value 
                          ? 'border-white bg-white/30 scale-105' 
                          : 'border-white/50 bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      <img 
                        src={oven.image} 
                        alt={oven.label}
                        className="w-full h-8 object-cover rounded mb-1"
                      />
                      <span className="text-xs">{oven.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Toggle per controlli di posizionamento - collassabile */}
              <Button
                onClick={() => setShowControls(!showControls)}
                className="w-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center gap-2 backdrop-blur-sm border border-white/20"
                size="sm"
              >
                <Settings className="w-4 h-4" />
                {showControls ? 'Nascondi Controlli' : 'Mostra Controlli Posizione'}
                {showControls ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
              
              {/* Controlli di posizionamento */}
              {showControls && (
                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  {/* Istruzioni touch aggiornate */}
                  <div className="text-center text-white text-xs bg-white/10 p-2 rounded">
                    👆 Un dito per spostare • 🤏 Due dita per zoom
                  </div>
                  
                  {/* Controlli scala e rotazione principali */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" onClick={() => scaleOven('down')} className="bg-white/20 text-white hover:bg-white/30">
                      <ZoomOut className="w-4 h-4 mr-1" />
                      -
                    </Button>
                    <Button size="sm" onClick={() => rotateOven('y')} className="bg-white/20 text-white hover:bg-white/30">
                      <RotateCcw className="w-4 h-4 mr-1" />
                      ↻
                    </Button>
                    <Button size="sm" onClick={() => scaleOven('up')} className="bg-white/20 text-white hover:bg-white/30">
                      <ZoomIn className="w-4 h-4 mr-1" />
                      +
                    </Button>
                  </div>
                  
                  {/* Controlli movimento fine */}
                  <div className="grid grid-cols-3 gap-1">
                    <Button size="sm" onClick={() => moveOven('left')} className="bg-white/10 text-white hover:bg-white/20 text-xs p-1">
                      ←
                    </Button>
                    <Button size="sm" onClick={() => moveOven('up')} className="bg-white/10 text-white hover:bg-white/20 text-xs p-1">
                      ↑
                    </Button>
                    <Button size="sm" onClick={() => moveOven('right')} className="bg-white/10 text-white hover:bg-white/20 text-xs p-1">
                      →
                    </Button>
                    <Button size="sm" onClick={() => moveOven('backward')} className="bg-white/10 text-white hover:bg-white/20 text-xs p-1">
                      ↙
                    </Button>
                    <Button size="sm" onClick={() => moveOven('down')} className="bg-white/10 text-white hover:bg-white/20 text-xs p-1">
                      ↓
                    </Button>
                    <Button size="sm" onClick={() => moveOven('forward')} className="bg-white/10 text-white hover:bg-white/20 text-xs p-1">
                      ↗
                    </Button>
                  </div>
                  
                  {/* Reset */}
                  <Button size="sm" onClick={resetPosition} className="w-full bg-white/20 text-white hover:bg-white/30">
                    <Move className="w-4 h-4 mr-1" />
                    Ripristina Posizione
                  </Button>
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
