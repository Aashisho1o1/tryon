import { useRef, useCallback, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

interface EarPosition {
  x: number;
  y: number;
  scale: number;
  depth: number;
  rotation: number;
}

interface HeadRotation {
  pitch: number; // Up/down
  yaw: number;   // Left/right
}

// Specific ear landmark indices (earlobe area)
const LEFT_EAR_INDICES = [234, 127, 162, 21, 54];
const RIGHT_EAR_INDICES = [454, 356, 389, 251, 284];

export const useImprovedEarTracking = () => {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize MediaPipe with enhanced settings
  const initializeFaceLandmarker = useCallback(async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false
      });

      faceLandmarkerRef.current = faceLandmarker;
      return faceLandmarker;
    } catch (error) {
      console.error('Failed to initialize FaceLandmarker:', error);
      throw error;
    }
  }, []);

  // Get specific ear landmarks
  const getEarLandmarks = useCallback((landmarks: NormalizedLandmark[], indices: number[]) => {
    return indices.map(i => landmarks[i]);
  }, []);

  // Calculate average position of ear landmarks
  const calculateAveragePosition = useCallback((earLandmarks: NormalizedLandmark[]) => {
    const sum = earLandmarks.reduce(
      (acc, lm) => ({
        x: acc.x + lm.x,
        y: acc.y + lm.y,
        z: acc.z + lm.z
      }),
      { x: 0, y: 0, z: 0 }
    );

    return {
      x: sum.x / earLandmarks.length,
      y: sum.y / earLandmarks.length,
      z: sum.z / earLandmarks.length
    };
  }, []);

  // Calculate face width for distance estimation
  const calculateFaceWidth = useCallback((landmarks: NormalizedLandmark[]) => {
    const leftFaceEdge = landmarks[234];
    const rightFaceEdge = landmarks[454];
    return Math.abs(rightFaceEdge.x - leftFaceEdge.x);
  }, []);

  // Calculate head rotation angles
  const calculateHeadRotation = useCallback((landmarks: NormalizedLandmark[]): HeadRotation => {
    const chin = landmarks[152];
    const forehead = landmarks[10];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    // Calculate pitch (up/down tilt)
    const pitch = Math.atan2(
      forehead.y - chin.y,
      Math.abs(forehead.z - chin.z)
    ) * (180 / Math.PI);

    // Calculate yaw (left/right turn)
    const yaw = Math.atan2(
      rightEye.x - leftEye.x,
      Math.abs(rightEye.z - leftEye.z)
    ) * (180 / Math.PI);

    return { pitch, yaw };
  }, []);

  // Main function: Calculate ear position with depth and perspective correction
  const calculateEarPositionWithDepth = useCallback(
    (
      landmarks: NormalizedLandmark[],
      isLeft: boolean,
      videoWidth: number,
      videoHeight: number
    ): EarPosition => {
      // Get ear-specific landmarks
      const earIndices = isLeft ? LEFT_EAR_INDICES : RIGHT_EAR_INDICES;
      const earLandmarks = getEarLandmarks(landmarks, earIndices);
      const earlobe = calculateAveragePosition(earLandmarks);

      // Calculate face width for scale reference
      const faceWidth = calculateFaceWidth(landmarks);
      const faceWidthPx = faceWidth * videoWidth;

      // Calculate depth factor (how far the face is from camera)
      const depthFactor = Math.abs(earlobe.z) / faceWidth;

      // Calculate head rotation
      const headRotation = calculateHeadRotation(landmarks);
      const headTurnRatio = (landmarks[1].x - 0.5) * 2; // -1 to 1

      // Base position
      let x = earlobe.x * videoWidth;
      let y = earlobe.y * videoHeight;

      // Apply perspective correction based on head turn
      if (isLeft) {
        // Left ear moves back when turning right
        x -= depthFactor * 10 * (1 + headTurnRatio);
      } else {
        // Right ear moves back when turning left
        x += depthFactor * 10 * (1 - headTurnRatio);
      }

      // Adjust vertical position based on pitch
      y += headRotation.pitch * 0.5;

      // Calculate scale based on distance (150px is reference face width)
      const scale = faceWidthPx / 150;

      return {
        x,
        y,
        scale,
        depth: depthFactor,
        rotation: headRotation.yaw
      };
    },
    [getEarLandmarks, calculateAveragePosition, calculateFaceWidth, calculateHeadRotation]
  );

  // Process video frame
  const processFrame = useCallback(
    async (video: HTMLVideoElement, timestamp: number) => {
      if (!faceLandmarkerRef.current || !video) {
        return null;
      }

      try {
        const results = faceLandmarkerRef.current.detectForVideo(video, timestamp);

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          const leftEar = calculateEarPositionWithDepth(landmarks, true, videoWidth, videoHeight);
          const rightEar = calculateEarPositionWithDepth(landmarks, false, videoWidth, videoHeight);

          return {
            leftEar,
            rightEar,
            landmarks
          };
        }

        return null;
      } catch (error) {
        console.error('Error processing frame:', error);
        return null;
      }
    },
    [calculateEarPositionWithDepth]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  return {
    initializeFaceLandmarker,
    processFrame,
    videoRef
  };
};
