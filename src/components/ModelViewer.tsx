import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stage, Html } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type ModelFormat = "stl" | "obj" | "fbx" | "glb" | "gltf";

interface ModelProps {
  url: string;
  format: ModelFormat;
}

function StlModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url) as THREE.BufferGeometry;
  const geo = useMemo(() => {
    const g = geometry.clone();
    g.center();
    g.computeVertexNormals();
    return g;
  }, [geometry]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color="#0EA5A4" metalness={0.15} roughness={0.45} />
    </mesh>
  );
}

function ObjModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

function FbxModel({ url }: { url: string }) {
  const fbx = useLoader(FBXLoader, url);
  const scene = useMemo(() => {
    const s = fbx.clone();
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.material || (Array.isArray(mesh.material) && mesh.material.length === 0)) {
          mesh.material = new THREE.MeshStandardMaterial({ color: "#0EA5A4", metalness: 0.15, roughness: 0.45 });
        }
      }
    });
    return s;
  }, [fbx]);
  return <primitive object={scene} />;
}

function GlbModel({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} />;
}

function ModelInner({ url, format }: ModelProps) {
  if (format === "stl") return <StlModel url={url} />;
  if (format === "fbx") return <FbxModel url={url} />;
  if (format === "glb" || format === "gltf") return <GlbModel url={url} />;
  return <ObjModel url={url} />;
}

interface ModelViewerProps {
  url: string;
  format: ModelFormat;
  downloadUrl?: string;
  filename?: string;
  height?: number;
}

export default function ModelViewer({ url, format, downloadUrl, filename, height = 420 }: ModelViewerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-b from-secondary/40 to-background">
      <div style={{ height }} className="relative w-full">
        {mounted ? (
          <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }} dpr={[1, 2]}>
            <color attach="background" args={["#0b1220"]} />
            <Suspense
              fallback={
                <Html center>
                  <div className="rounded-md bg-background/90 px-3 py-2 text-xs font-semibold text-foreground shadow">
                    Memuat model 3D...
                  </div>
                </Html>
              }
            >
              <Stage environment="city" intensity={0.6} adjustCamera={1.2} shadows={false}>
                <ModelInner url={url} format={format} />
              </Stage>
            </Suspense>
            <OrbitControls enablePan enableZoom enableRotate makeDefault />
          </Canvas>
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
            Menyiapkan viewer 3D...
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background px-4 py-3">
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Kontrol:</span> klik & seret untuk memutar · scroll untuk
          zoom · klik kanan untuk pan
        </div>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download={filename}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[var(--navy)] hover:text-[var(--navy)]"
          >
            Unduh file ({format.toUpperCase()})
          </a>
        )}
      </div>
    </div>
  );
}
