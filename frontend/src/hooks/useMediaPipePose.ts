import { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import type { Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

interface EarLandmarks {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
}

interface PoseHook {
  earLandmarks: EarLandmarks;
  isReady: boolean;
  error: string | null;
}

export const useMediaPipePose = (videoRef: React.RefObject<HTMLVideoElement>): PoseHook => {
  const [earLandmarks, setEarLandmarks] = useState<EarLandmarks>({
    left: null,
    right: null
  });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    const initializePose = async () => {
      try {
        console.log('🏃 Initializing MediaPipe Pose for ear detection...');

        if (!videoRef.current) {
          console.log('⏳ Video element not ready');
          return;
        }

        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results: Results) => {
          if (results.poseLandmarks && results.poseLandmarks.length > 8) {
            // MediaPipe Pose Landmark indices:
            // 7: Left ear
            // 8: Right ear
            const leftEar = results.poseLandmarks[7];
            const rightEar = results.poseLandmarks[8];

            if (leftEar && rightEar) {
              setEarLandmarks({
                left: { x: leftEar.x, y: leftEar.y },
                right: { x: rightEar.x, y: rightEar.y }
              });
              
              // Log ear positions for debugging (only occasionally to avoid spam)
              if (Math.random() < 0.05) {
                console.log(`👂 Ear Landmarks - Left: (${leftEar.x.toFixed(3)}, ${leftEar.y.toFixed(3)}), Right: (${rightEar.x.toFixed(3)}, ${rightEar.y.toFixed(3)})`);
              }
            }
          } else {
            setEarLandmarks({ left: null, right: null });
          }
        });

        await pose.initialize();
        poseRef.current = pose;

        // Initialize camera for continuous detection
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && poseRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720
        });

        cameraRef.current = camera;
        await camera.start();

        setIsReady(true);
        console.log('✅ MediaPipe Pose initialized successfully');

      } catch (err) {
        console.error('❌ Failed to initialize Pose:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize pose detection');
      }
    };

    // Wait for video element to be ready
    const checkVideo = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        clearInterval(checkVideo);
        initializePose();
      }
    }, 100);

    return () => {
      clearInterval(checkVideo);
      cameraRef.current?.stop();
      poseRef.current?.close();
    };
  }, [videoRef]);

  return { earLandmarks, isReady, error };
};
