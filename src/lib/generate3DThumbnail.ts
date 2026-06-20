import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

export type Thumb3DFormat = "fbx" | "obj" | "stl";

function detectExt(name: string): Thumb3DFormat {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "obj") return "obj";
  if (ext === "stl") return "stl";
  return "fbx";
}

/**
 * Render an offscreen snapshot of a 3D model file (.fbx / .obj / .stl).
 * Returns a JPEG Blob suitable for use as a gallery thumbnail.
 */
export async function generate3DThumbnail(
  source: File | Blob | string,
  opts: { width?: number; height?: number; format?: Thumb3DFormat; filename?: string } = {},
): Promise<Blob> {
  const width = opts.width ?? 640;
  const height = opts.height ?? 480;

  const filename =
    opts.filename ?? (source instanceof File ? source.name : typeof source === "string" ? source : "model.fbx");
  const format = opts.format ?? detectExt(filename);

  const url =
    typeof source === "string" ? source : URL.createObjectURL(source);

  try {
    let object: THREE.Object3D;
    if (format === "stl") {
      const geom = (await new STLLoader().loadAsync(url)) as THREE.BufferGeometry;
      geom.center();
      geom.computeVertexNormals();
      object = new THREE.Mesh(
        geom,
        new THREE.MeshStandardMaterial({ color: 0x0ea5a4, metalness: 0.15, roughness: 0.45 }),
      );
    } else if (format === "obj") {
      object = await new OBJLoader().loadAsync(url);
    } else {
      object = await new FBXLoader().loadAsync(url);
      object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (
          mesh.isMesh &&
          (!mesh.material || (Array.isArray(mesh.material) && mesh.material.length === 0))
        ) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x0ea5a4,
            metalness: 0.15,
            roughness: 0.45,
          });
        }
      });
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1220);
    scene.add(object);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 8);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9cc9ff, 0.45);
    fill.position.set(-8, 4, -6);
    scene.add(fill);

    // Center & frame to camera
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    object.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, maxDim * 100);
    const dist = maxDim * 2.4;
    camera.position.set(dist * 0.9, dist * 0.65, dist);
    camera.lookAt(0, 0, 0);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: false,
    });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.render(scene, camera);

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Gagal membuat thumbnail"))),
        "image/jpeg",
        0.85,
      ),
    );

    renderer.dispose();
    return blob;
  } finally {
    if (typeof source !== "string") URL.revokeObjectURL(url);
  }
}
