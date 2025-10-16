/**
 * Enhanced MediaPipe hook with proportional scaling
 * Detects face landmarks and calculates measurements for accurate jewelry sizing
 */

import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

interface LandmarkPosition {
  x: number;
  y: number;
  z?: number;
}

interface Measurements {
  earWidth: number;
  neckWidth: number;
  faceWidth: number;
}

interface UseEnhancedMediaPipeReturn {
  landmarks: LandmarkPosition[] | null;
  measurements: Measurements | null;
  isReady: boolean;
  error: string | null;
}

/**
 * Calculate 3D distance between two landmark points (pure function)
 */
const calculateDistance = (point1: LandmarkPosition, point2: LandmarkPosition): number => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  const dz = (point1.z || 0) - (point2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Calculate proportional measurements from facial landmarks (pure function)
 */
const calculateMeasurements = (detectedLandmarks: LandmarkPosition[]): Measurements => {
  // Ear distance (horizontal span between ears)
  const earDistance = calculateDistance(
    detectedLandmarks[234], // Left ear top
    detectedLandmarks[454]  // Right ear top
  );

  // Face width (for overall scale reference)
  const faceWidth = calculateDistance(
    detectedLandmarks[234], // Left face edge
    detectedLandmarks[454]  // Right face edge
  );

  // Neck width estimation (for necklace sizing)
  const chinCenter = detectedLandmarks[152];
  const foreheadCenter = detectedLandmarks[10];
  const verticalDistance = calculateDistance(chinCenter, foreheadCenter);
  const neckWidth = verticalDistance * 0.65; // 65% approximation

  return {
    earWidth: earDistance * 0.15, // Earrings are typically ~15% of ear width
    neckWidth: neckWidth,
    faceWidth: faceWidth,
  };
};

/**
 * Custom hook for MediaPipe face detection with proportional measurements
 */
export const useEnhancedMediaPipe = (
  videoRef: React.RefObject<HTMLVideoElement>
): UseEnhancedMediaPipeReturn => {
  const [landmarks, setLandmarks] = useState<LandmarkPosition[] | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number>();
  
  // Use refs to store latest values without triggering re-renders
  const landmarksRef = useRef<LandmarkPosition[] | null>(null);
  const measurementsRef = useRef<Measurements | null>(null);
  const lastUpdateTime = useRef<number>(0);

  /**
   * Initialize MediaPipe on component mount
   */
  useEffect(() => {
    let mounted = true;

    /**
     * Main detection loop - runs continuously on video frames
     */
    const detectFaces = () => {
      const video = videoRef.current;
      const faceLandmarker = faceLandmarkerRef.current;

      if (!video || !faceLandmarker || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectFaces);
        return;
      }

      try {
        // Detect faces in current video frame
        const results = faceLandmarker.detectForVideo(video, performance.now());
        const now = performance.now();

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const detectedLandmarks = results.faceLandmarks[0];
          landmarksRef.current = detectedLandmarks;
          
          // Calculate proportional measurements for scaling
          const newMeasurements = calculateMeasurements(detectedLandmarks);
          measurementsRef.current = newMeasurements;
          
          // Only update state every 100ms to avoid excessive re-renders
          if (now - lastUpdateTime.current > 100) {
            setLandmarks(detectedLandmarks);
            setMeasurements(newMeasurements);
            lastUpdateTime.current = now;
          }
        } else {
          // No face detected - clear landmarks
          landmarksRef.current = null;
          measurementsRef.current = null;
          
          // Only update state if it was previously set
          if (landmarks !== null) {
            setLandmarks(null);
            setMeasurements(null);
          }
        }
      } catch (err) {
        console.error('Face detection error:', err);
      }

      animationFrameRef.current = requestAnimationFrame(detectFaces);
    };

    const initializeMediaPipe = async () => {
      try {
        // Load MediaPipe WASM files
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );

        // Create face landmarker
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU" // Use GPU acceleration if available
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          runningMode: "VIDEO",
          numFaces: 1 // Only detect one face (primary user)
        });

        if (!mounted) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current = faceLandmarker;
        setIsReady(true);

        // Start detection loop
        if (videoRef.current) {
          detectFaces();
        }
      } catch (err) {
        console.error("MediaPipe initialization failed:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize AR");
      }
    };

    initializeMediaPipe();

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { landmarks, measurements, isReady, error };
};
