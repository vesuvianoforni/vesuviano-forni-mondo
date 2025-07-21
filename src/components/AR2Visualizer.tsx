import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, RotateCcw, Download } from "lucide-react";
import { toast } from "sonner";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

interface AR2VisualizerProps {
  className?: string;
}

interface LoadedModel {
  scene: THREE.Group;
  name: string;
  type: string;
}

const ModelViewer = ({ model }: { model: LoadedModel | null }) => {
  if (!model) {
    return (
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Carica un file 3D per iniziare
      </Text>
    );
  }

  return <primitive object={model.scene} />;
};

export const AR2Visualizer: React.FC<AR2VisualizerProps> = ({ className }) => {
  const [loadedModel, setLoadedModel] = useState<LoadedModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    
    try {
      console.log('AR2: Processando file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileUrl = URL.createObjectURL(file);
      
      let loader: GLTFLoader | OBJLoader | FBXLoader;
      let loadedScene: THREE.Group;

      switch (fileExtension) {
        case 'gltf':
        case 'glb':
          loader = new GLTFLoader();
          const gltfResult = await new Promise<THREE.Group>((resolve, reject) => {
            (loader as GLTFLoader).load(
              fileUrl,
              (gltf) => resolve(gltf.scene),
              undefined,
              reject
            );
          });
          loadedScene = gltfResult;
          break;

        case 'obj':
          loader = new OBJLoader();
          const objResult = await new Promise<THREE.Group>((resolve, reject) => {
            (loader as OBJLoader).load(
              fileUrl,
              (obj) => {
                // Applica materiale di default se necessario
                obj.traverse((child) => {
                  if (child instanceof THREE.Mesh && !child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                      color: 0x888888,
                      roughness: 0.7,
                      metalness: 0.1
                    });
                  }
                });
                resolve(obj);
              },
              undefined,
              reject
            );
          });
          loadedScene = objResult;
          break;

        case 'fbx':
          loader = new FBXLoader();
          const fbxResult = await new Promise<THREE.Group>((resolve, reject) => {
            (loader as FBXLoader).load(
              fileUrl,
              (fbx) => {
                // Assicurati che abbia materiali
                fbx.traverse((child) => {
                  if (child instanceof THREE.Mesh && !child.material) {
                    child.material = new THREE.MeshStandardMaterial({
                      color: 0x888888,
                      roughness: 0.7,
                      metalness: 0.1
                    });
                  }
                });
                resolve(fbx);
              },
              undefined,
              reject
            );
          });
          loadedScene = fbxResult;
          break;

        default:
          throw new Error(`Formato file non supportato: ${fileExtension}`);
      }

      // Normalizza la scala del modello
      const box = new THREE.Box3().setFromObject(loadedScene);
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      
      if (maxSize > 0) {
        const scaleFactor = 3 / maxSize; // Scala per adattarsi in una sfera di raggio 3
        loadedScene.scale.multiplyScalar(scaleFactor);
        
        // Centra il modello
        const center = box.getCenter(new THREE.Vector3());
        loadedScene.position.sub(center.multiplyScalar(scaleFactor));
      }

      setLoadedModel({
        scene: loadedScene,
        name: file.name,
        type: fileExtension || 'unknown'
      });

      toast.success(`Modello ${file.name} caricato con successo!`);
      console.log('AR2: Modello caricato e processato:', {
        originalSize: maxSize,
        scaleFactor: 3 / maxSize,
        vertices: loadedScene.children.length
      });

    } catch (error) {
      console.error('AR2: Errore nel caricamento:', error);
      toast.error(`Errore nel caricamento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const resetModel = () => {
    setLoadedModel(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            AR Visualizer 2.0 - Nuovo Sistema di Caricamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Area Upload con Drag & Drop */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground'}
              ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isLoading ? 'Caricamento in corso...' : 'Trascina i tuoi file 3D qui'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supporta: OBJ, FBX, GLB, GLTF
            </p>
            <Button variant="outline" disabled={isLoading}>
              Seleziona File
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".obj,.fbx,.gltf,.glb"
              onChange={handleFileSelect}
            />
          </div>

          {/* Info modello caricato */}
          {loadedModel && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium">{loadedModel.name}</p>
                <p className="text-sm text-muted-foreground">Tipo: {loadedModel.type.toUpperCase()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={resetModel}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Rimuovi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visualizzatore 3D */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 w-full">
            <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />
              <pointLight position={[-10, -10, -5]} intensity={0.3} />
              
              {/* Environment per riflessioni migliori */}
              <Environment preset="apartment" />
              
              <ModelViewer model={loadedModel} />
              
              <OrbitControls 
                enablePan={true} 
                enableZoom={true} 
                enableRotate={true}
                autoRotate={false}
                maxDistance={20}
                minDistance={1}
              />
            </Canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AR2Visualizer;