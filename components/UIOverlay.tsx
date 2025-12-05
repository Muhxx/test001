import React from 'react';
import { Maximize2, Minimize2, Hand } from 'lucide-react';
import { ShapeType } from '../types';
import { SHAPE_OPTIONS, COLOR_PALETTES } from '../constants';

interface UIOverlayProps {
  currentShape: ShapeType;
  currentColor: string;
  onShapeChange: (shape: ShapeType) => void;
  onColorChange: (color: string) => void;
  isHandPresent: boolean;
  handFactor: number;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  currentShape,
  currentColor,
  onShapeChange,
  onColorChange,
  isHandPresent,
  handFactor
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            ZenParticles
            </h1>
            <p className="text-gray-400 text-xs mt-1 max-w-xs">
                Use your camera. Pinch or open hands to control the particles.
            </p>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors text-white"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-none">
         <div className={`flex items-center gap-2 px-4 py-1 rounded-full border backdrop-blur-md transition-all duration-500 ${
             isHandPresent 
             ? 'border-green-500/50 bg-green-500/10 text-green-200' 
             : 'border-white/10 bg-black/20 text-gray-400'
         }`}>
            <Hand size={14} className={isHandPresent ? 'animate-pulse' : ''} />
            <span className="text-xs font-medium uppercase tracking-wider">
                {isHandPresent 
                  ? `Control Active ${(handFactor * 100).toFixed(0)}%` 
                  : 'Waiting for Hand...'}
            </span>
         </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 items-end pointer-events-auto">
        
        {/* Shape Selector */}
        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-4 w-64 shadow-2xl">
          <h3 className="text-white/80 text-xs font-bold uppercase mb-3 tracking-wider">Model</h3>
          <div className="grid grid-cols-2 gap-2">
            {SHAPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onShapeChange(opt.id)}
                className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 text-left ${
                  currentShape === opt.id
                    ? 'bg-white text-black font-semibold shadow-lg scale-105'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl p-4 w-64 shadow-2xl">
           <h3 className="text-white/80 text-xs font-bold uppercase mb-3 tracking-wider">Color</h3>
           <div className="flex gap-2 justify-between">
              {COLOR_PALETTES.map((color) => (
                  <button
                    key={color}
                    onClick={() => onColorChange(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 hover:scale-110 ${
                        currentColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
              ))}
           </div>
           <input 
             type="color" 
             value={currentColor}
             onChange={(e) => onColorChange(e.target.value)}
             className="w-full mt-3 h-8 rounded cursor-pointer bg-transparent border border-white/20"
           />
        </div>

      </div>
    </div>
  );
};

export default UIOverlay;
