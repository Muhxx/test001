import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onHandUpdate: (factor: number, isPresent: boolean) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>(0);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        setLoaded(true);
      } catch (e) {
        console.error("Error initializing hand tracker:", e);
        setError("Failed to load hand tracking AI");
      }
    };

    initHandLandmarker();

    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (err) {
        console.error("Webcam error:", err);
        setError("Camera access denied");
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const predictWebcam = () => {
    const video = videoRef.current;
    const landmarker = handLandmarkerRef.current;

    if (video && landmarker) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        const startTimeMs = performance.now();
        const results = landmarker.detectForVideo(video, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          let factor = 0.5; // Default middle
          
          // Logic:
          // If 1 hand: Calculate distance between Thumb(4) and Index(8) - Pinching
          // If 2 hands: Calculate distance between Wrist(0) of Hand A and Hand B
          
          if (results.landmarks.length === 1) {
            const hand = results.landmarks[0];
            const thumbTip = hand[4];
            const indexTip = hand[8];
            const dist = Math.sqrt(
              Math.pow(thumbTip.x - indexTip.x, 2) + 
              Math.pow(thumbTip.y - indexTip.y, 2) + 
              Math.pow(thumbTip.z - indexTip.z, 2)
            );
            // Empirically, pinch is ~0.02, open is ~0.15+
            factor = Math.min(Math.max((dist - 0.02) * 5, 0), 1);
          } else if (results.landmarks.length === 2) {
             const hand1 = results.landmarks[0][0]; // Wrist
             const hand2 = results.landmarks[1][0]; // Wrist
             const dist = Math.sqrt(
                Math.pow(hand1.x - hand2.x, 2) + 
                Math.pow(hand1.y - hand2.y, 2)
             );
             // Dist is usually 0.2 to 0.8 on screen width
             factor = Math.min(Math.max((dist - 0.2) * 1.5, 0), 1);
          }

          onHandUpdate(factor, true);
        } else {
          onHandUpdate(0, false);
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 overflow-hidden rounded-lg border border-white/20 bg-black/50 shadow-lg backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 opacity-80">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-24 w-32 object-cover -scale-x-100 transform" // Mirror effect
      />
      {error && <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-[10px] text-white p-1 text-center">{error}</div>}
      {!loaded && !error && <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">Loading AI...</div>}
    </div>
  );
};

export default HandTracker;