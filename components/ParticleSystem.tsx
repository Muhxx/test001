import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { generateShapePositions } from '../services/shapeGenerator';
import { PARTICLE_COUNT } from '../constants';

// Add missing intrinsic element definitions for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      pointsMaterial: any;
    }
  }
}

interface ParticleSystemProps {
  shape: ShapeType;
  color: string;
  handFactor: number;
  isHandPresent: boolean;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ shape, color, handFactor, isHandPresent }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  // Use a stable reference for current positions to handle animation
  // We double buffer: currentPositions tracks animation state, targetPositions is the destination
  const currentPositions = useRef(new Float32Array(PARTICLE_COUNT * 3));
  const targetPositions = useMemo(() => {
    return generateShapePositions(shape, PARTICLE_COUNT);
  }, [shape]);

  // Initial setup
  useLayoutEffect(() => {
    if (meshRef.current) {
      // Initialize current positions to target on first mount (or smoothly transition later)
      // For first load, we can set them directly or random
      for(let i=0; i<currentPositions.current.length; i++) {
        currentPositions.current[i] = (Math.random() - 0.5) * 10;
      }
    }
  }, []);

  // Material reference to update color smoothly
  const materialRef = useRef<THREE.PointsMaterial>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const targets = targetPositions;
    
    // Smooth factor for hand interaction
    // If hand is present: 
    //   Low factor (closed hand) -> Contract/Zoom In (Scale down)
    //   High factor (open hand) -> Expand/Disperse (Scale up + Noise)
    
    // Base animation speed
    const lerpSpeed = 3.0 * delta;
    
    // Calculate global modifiers based on hand
    const time = state.clock.getElapsedTime();
    
    // Scale modifier: 0.0 to 1.0 input. 
    // If no hand: breathe normally.
    // If hand: map factor 0-1 to scale 0.2 - 2.5
    let targetScale = 1.0;
    let explosionFactor = 0.0;
    
    if (isHandPresent) {
      targetScale = 0.5 + (handFactor * 2.0); // 0.5x to 2.5x
      if (handFactor > 0.8) explosionFactor = (handFactor - 0.8) * 2; // Add noise at extreme open
    } else {
      // Idle breathing
      targetScale = 1.0 + Math.sin(time * 0.5) * 0.1;
    }

    // Update color
    if (materialRef.current) {
        materialRef.current.color.lerp(new THREE.Color(color), 0.05);
        // Pulse size
        materialRef.current.size = 0.08 * targetScale;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      
      // 1. Get Base Target
      let tx = targets[idx];
      let ty = targets[idx + 1];
      let tz = targets[idx + 2];

      // 2. Apply "Life" (Noise/Movement)
      // Add some curled noise or sine wave movement relative to original pos
      const noise = Math.sin(time * 2 + tx * 0.5) * 0.1;
      
      // 3. Apply Hand Interaction (Scale & Dispersion)
      // Scale from center (0,0,0)
      tx *= targetScale;
      ty *= targetScale;
      tz *= targetScale;

      // Add explosion/scatter jitter if fully open
      if (explosionFactor > 0) {
        tx += (Math.random() - 0.5) * explosionFactor * 5;
        ty += (Math.random() - 0.5) * explosionFactor * 5;
        tz += (Math.random() - 0.5) * explosionFactor * 5;
      }

      // 4. Lerp current to target
      positions[idx] += (tx - positions[idx]) * lerpSpeed;
      positions[idx + 1] += (ty + noise - positions[idx + 1]) * lerpSpeed;
      positions[idx + 2] += (tz - positions[idx + 2]) * lerpSpeed;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate entire system slowly
    meshRef.current.rotation.y += delta * 0.1;
    if (shape === ShapeType.SATURN) {
       meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.2;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.08}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default ParticleSystem;