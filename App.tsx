import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import HandTracker from './components/HandTracker';
import { ShapeType } from './types';
import { INITIAL_COLOR } from './constants';

const App: React.FC = () => {
  const [shape, setShape] = useState<ShapeType>(ShapeType.HEART);
  const [color, setColor] = useState<string>(INITIAL_COLOR);
  
  // Hand tracking state
  // 0.0 = Closed/Small, 1.0 = Open/Large
  const [handFactor, setHandFactor] = useState<number>(0.5); 
  const [isHandPresent, setIsHandPresent] = useState<boolean>(false);

  // We use a callback to prevent unnecessary re-renders in the tracker
  const handleHandUpdate = useCallback((factor: number, isPresent: boolean) => {
    // Smooth out jitter slightly in state if needed, but we do smoothing in ParticleSystem
    setHandFactor(prev => {
        // Simple low-pass filter for UI consistency
        if (!isPresent) return 0.5;
        return prev * 0.8 + factor * 0.2;
    });
    setIsHandPresent(isPresent);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans selection:bg-pink-500 selection:text-white">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene 
          shape={shape} 
          color={color} 
          handFactor={handFactor}
          isHandPresent={isHandPresent}
        />
      </div>

      {/* Logic Layer */}
      <HandTracker onHandUpdate={handleHandUpdate} />

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay
          currentShape={shape}
          currentColor={color}
          onShapeChange={setShape}
          onColorChange={setColor}
          isHandPresent={isHandPresent}
          handFactor={handFactor}
        />
      </div>

    </div>
  );
};

export default App;
