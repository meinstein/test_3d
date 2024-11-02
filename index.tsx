import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame, useLoader, extend, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import image1 from './textures/1.jpg';
import image2 from './textures/2.jpg';
import shaderBall from './shaderBall.obj';

extend({ OrbitControls });

// Extend the JSX namespace to include orbitControls
declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        args: any;
        enableDamping: boolean;
        dampingFactor: number;
        maxPolarAngle: number;
      };
    }
  }
}

function Scene({ texture, metalness, roughness }: { texture: THREE.Texture, metalness: number, roughness: number }) {
  const objRef = useRef<THREE.Group>(new THREE.Group());
  const obj = useLoader(OBJLoader, shaderBall);

  useEffect(() => {
    if (obj && texture) {
      obj.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: roughness,
            metalness: metalness,
          });
          child.position.y = 1;
        }
      });
      objRef.current.add(obj);
    }
  }, [obj, texture, metalness, roughness]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7.5]} intensity={1} />
      <primitive ref={objRef} object={new THREE.Group()} />
    </>
  );
}

function Controls() {
  const { camera, gl } = useThree();
  const controls = useRef<any>();
  useFrame(() => controls.current.update());

  return <orbitControls
    ref={controls}
    args={[camera, gl.domElement]}
    enableDamping
    dampingFactor={0.25}
    maxPolarAngle={Math.PI / 2}
  />;
}

function exportTexture(texture: THREE.Texture) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  canvas.width = texture.image.width;
  canvas.height = texture.image.height;
  context.drawImage(texture.image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  context.putImageData(imageData, 0, 0);
  const link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = 'exported_texture.png';
  link.click();
}

function App() {
  const [selectedTexture, setSelectedTexture] = useState(image1);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [metalness, setMetalness] = useState(1);
  const [roughness, setRoughness] = useState(1);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(selectedTexture, (loadedTexture) => {
      setTexture(loadedTexture);
    });
  }, [selectedTexture]);

  return (
    <div style={{ width: 600, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{display: 'flex', gap: '1rem'}}>
        <select onChange={(e) => {
          if (e.target.value === 'image1') {
            setSelectedTexture(image1);
          } else {
            setSelectedTexture(image2);
          }
        }}>
          <option value='image1'>Texture 1</option>
          <option value='image2'>Texture 2</option>
        </select>
        <button onClick={() => texture && exportTexture(texture)}>
          Export Texture
        </button>
      </div>
      <div style={{display: 'flex', gap: '1rem'}}>
        <label style={{display: 'flex', alignItems: 'center'}}>
          Metalness:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={metalness}
            onChange={(e) => setMetalness(parseFloat(e.target.value))}
          />
        </label>
        <label style={{display: 'flex', alignItems: 'center'}}>
          Roughness:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={roughness}
            onChange={(e) => setRoughness(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div style={{
        width: '100%',
        height: 600,
        border: '1px solid white',
      }}>
        <Canvas camera={{ position: [0, 0, 1000], fov: 20 }} >
          {texture && <Scene texture={texture} metalness={metalness} roughness={roughness} />}
          <Controls />
        </Canvas>
      </div>
    </div>
  );
}

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
