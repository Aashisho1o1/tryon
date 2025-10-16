/**
 * TryOnCamera - Main AR component for virtual jewelry try-on
 * Combines camera feed, face tracking, and jewelry rendering
 */

import { useRef, useEffect } from 'react';
import { useEnhancedMediaPipe } from '../hooks/useEnhancedMediaPipe';
import { getMaterialStyle } from '../utils/materialStyles';

interface JewelryItem {
  item_id: string;
  name: string;
  type: string;
  ar_config: {
    landmarks: number[];
    size: number;
    color?: string;
    material?: { type: string; opacity?: number };
    physics?: { enabled: boolean; damping?: number; stiffness?: number };
    auto_scale?: boolean;
  };
  image_url?: string;
}

interface TryOnCameraProps {
  jewelry: JewelryItem;
}

export const TryOnCamera: React.FC<TryOnCameraProps> = ({ jewelry }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { landmarks, measurements, isReady, error } = useEnhancedMediaPipe(videoRef);

  /**
   * Initialize camera on component mount
   */
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access denied:', err);
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  /**
   * Main rendering loop - draws jewelry on canvas
   */
  useEffect(() => {
    if (!landmarks || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get landmark positions (default to earrings landmarks)
    const leftLandmark = landmarks[jewelry.ar_config.landmarks[0]] || landmarks[234];
    const rightLandmark = landmarks[jewelry.ar_config.landmarks[1]] || landmarks[454];

    // Convert normalized coordinates (0-1) to pixel coordinates
    const leftX = leftLandmark.x * canvas.width;
    const leftY = leftLandmark.y * canvas.height;
    const rightX = rightLandmark.x * canvas.width;
    const rightY = rightLandmark.y * canvas.height;

    // Calculate jewelry size with proportional scaling
    let size = jewelry.ar_config.size;
    if (jewelry.ar_config.auto_scale && measurements) {
      // Scale based on face measurements for accurate sizing
      const baseSize = 30;
      const scaleFactor = measurements.earWidth / 0.05; // 0.05 = average normalized ear width
      size = baseSize * scaleFactor;
    }

    // Get material rendering style
    const materialType = jewelry.ar_config.material?.type || 'gold';
    const materialStyle = getMaterialStyle(materialType);

    // Apply material effects to canvas
    ctx.filter = materialStyle.filter;
    ctx.globalAlpha = jewelry.ar_config.material?.opacity || materialStyle.opacity || 1;

    // Draw jewelry based on type
    if (jewelry.type === 'earrings') {
      const color = jewelry.ar_config.color || '#FFD700';

      // Left earring
      ctx.beginPath();
      ctx.arc(leftX, leftY, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Add highlight for shine effect
      ctx.beginPath();
      ctx.arc(leftX - size * 0.3, leftY - size * 0.3, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // Right earring
      ctx.beginPath();
      ctx.arc(rightX, rightY, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Add highlight
      ctx.beginPath();
      ctx.arc(rightX - size * 0.3, rightY - size * 0.3, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
    }

    // Reset canvas effects
    ctx.filter = 'none';
    ctx.globalAlpha = 1;

  }, [landmarks, measurements, jewelry]);

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Camera video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie mode
      />
      
      {/* AR rendering canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect
      />
      
      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading AR...</p>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}
      
      {/* Jewelry info overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h3 className="font-bold text-lg">{jewelry.name}</h3>
        <p className="text-sm text-gray-600">{jewelry.type}</p>
      </div>
      
      {/* Face detection indicator */}
      {isReady && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${landmarks ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-white text-sm">
            {landmarks ? 'Face Detected' : 'Looking for face...'}
          </span>
        </div>
      )}
    </div>
  );
};
