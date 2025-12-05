import * as THREE from 'three';
import { ShapeType } from '../types';

// Helper to get random point in sphere
const randomInSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

export const generateShapePositions = (type: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    
    switch (type) {
      case ShapeType.HEART: {
        // Parametric heart
        const t = Math.random() * Math.PI * 2;
        const u = Math.random() * Math.PI; // Full sphere distribution
        
        // 3D Heart approximation formula
        const x = 16 * Math.pow(Math.sin(t), 3) * Math.sin(u);
        const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * Math.sin(u);
        const z = 6 * Math.cos(u); 
        
        // Scale down
        vec.set(x, y, z).multiplyScalar(0.3);
        break;
      }
      
      case ShapeType.FLOWER: {
        // Rose curve / Phyllotaxis inspired
        const r = 5 * Math.sqrt(Math.random());
        const theta = i * 2.39996; // Golden angle approx
        
        // Modulate Z to create petal depth
        const petalMod = Math.sin(theta * 5); 
        
        vec.x = r * Math.cos(theta);
        vec.y = r * Math.sin(theta);
        vec.z = petalMod * 2 * (1 - r/6);
        break;
      }

      case ShapeType.SATURN: {
        // Planet + Rings
        if (i < count * 0.4) {
          // Planet body
          const p = randomInSphere(2.5);
          vec.copy(p);
        } else {
          // Rings
          const angle = Math.random() * Math.PI * 2;
          const radius = 3.5 + Math.random() * 3;
          vec.x = Math.cos(angle) * radius;
          vec.z = Math.sin(angle) * radius; // Flat on XZ plane initially
          vec.y = (Math.random() - 0.5) * 0.2; // Thin noise
          
          // Tilt the rings
          vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 0.1);
          vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * 0.1);
        }
        break;
      }

      case ShapeType.BUDDHA: {
        // Abstract Seated Figure (Stacked geometric primitives)
        // 0-30%: Head
        // 30-70%: Body/Torso
        // 70-100%: Base/Legs
        
        const ratio = i / count;
        
        if (ratio < 0.2) {
          // Head
          const p = randomInSphere(1.2);
          vec.copy(p).add(new THREE.Vector3(0, 3.5, 0));
        } else if (ratio < 0.6) {
          // Torso (Ellipsoid)
          const p = randomInSphere(2.2);
          p.x *= 1.2; // Shoulders
          p.y *= 1.5;
          vec.copy(p).add(new THREE.Vector3(0, 0.5, 0));
        } else {
          // Legs/Base (Squashed sphere/Torus approximation)
          const t = Math.random() * Math.PI * 2;
          const r = 2 + Math.random() * 2.5;
          vec.x = r * Math.cos(t);
          vec.z = r * Math.sin(t);
          vec.y = (Math.random() - 0.5) * 2 - 2.5;
        }
        break;
      }

      case ShapeType.FIREWORK: {
        // Explosion outward
        const p = randomInSphere(8);
        vec.copy(p);
        break;
      }

      case ShapeType.SPHERE:
      default: {
        const p = randomInSphere(4);
        vec.copy(p);
        break;
      }
    }

    positions[idx] = vec.x;
    positions[idx + 1] = vec.y;
    positions[idx + 2] = vec.z;
  }

  return positions;
};
