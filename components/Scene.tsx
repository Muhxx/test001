import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import ParticleSystem from './ParticleSystem';
import { ShapeType } from '../types';

// Add missing intrinsic element definitions for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      color: any;
      ambientLight: any;
    }
  }
}

interface SceneProps {
  shape: ShapeType;
  color: string;
  handFactor: number;
  isHandPresent: boolean;
}

const Scene: React.FC<SceneProps> = ({ shape, color, handFactor, isHandPresent }) => {
  return (
    <div className="h-full w-full bg-black">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 2]} // Handle high DPI
        gl={{ antialias: false, alpha: false }} // Optimization
      >
        <color attach="background" args={['#050505']} />
        
        <Suspense fallback={null}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ParticleSystem 
            shape={shape} 
            color={color} 
            handFactor={handFactor}
            isHandPresent={isHandPresent}
          />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} // Zoom handled by gesture
          enablePan={false}
          autoRotate={!isHandPresent}
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
        
        {/* Simple Ambient Light for potential future meshes, though points use emissive-like logic */}
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
};

export default Scene;