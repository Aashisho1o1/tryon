/**
 * Simple physics simulation for natural jewelry movement
 * Uses spring-damper system for realistic swaying motion
 */

import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface PhysicsState {
  position: Position;
  velocity: Position;
}

interface PhysicsConfig {
  damping: number;    // 0-1: How quickly movement stops (0.85 = natural)
  stiffness: number;  // 0-1: How springy the motion is (0.15 = gentle sway)
  mass: number;       // Grams: Affects inertia (5g = typical earring)
}

/**
 * Hook for simulating physics-based jewelry movement
 * Makes jewelry feel more realistic by adding natural sway
 * 
 * @param targetPosition - Where the jewelry should be (from face landmarks)
 * @param enabled - Whether physics is active
 * @param config - Optional physics parameters
 */
export const useJewelryPhysics = (
  targetPosition: Position,
  enabled: boolean = true,
  config?: Partial<PhysicsConfig>
): Position => {
  const defaultConfig: PhysicsConfig = {
    damping: 0.85,
    stiffness: 0.15,
    mass: 5,
    ...config
  };

  const [state, setState] = useState<PhysicsState>({
    position: targetPosition,
    velocity: { x: 0, y: 0 }
  });

  const lastTime = useRef(Date.now());

  useEffect(() => {
    // If physics disabled, snap to target immediately
    if (!enabled) {
      setState({ position: targetPosition, velocity: { x: 0, y: 0 } });
      return;
    }

    let animationFrame: number;

    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastTime.current) / 1000, 0.1); // Max 100ms to prevent huge jumps
      lastTime.current = now;

      setState(prev => {
        // Spring force - pulls jewelry toward target position
        const springForceX = (targetPosition.x - prev.position.x) * defaultConfig.stiffness;
        const springForceY = (targetPosition.y - prev.position.y) * defaultConfig.stiffness;

        // Damping force - slows down movement (prevents endless bouncing)
        const dampingForceX = -prev.velocity.x * (1 - defaultConfig.damping);
        const dampingForceY = -prev.velocity.y * (1 - defaultConfig.damping);

        // Update velocity based on forces
        const newVelocityX = prev.velocity.x + (springForceX + dampingForceX) * deltaTime;
        const newVelocityY = prev.velocity.y + (springForceY + dampingForceY) * deltaTime;

        // Update position based on velocity
        const newPositionX = prev.position.x + newVelocityX * deltaTime;
        const newPositionY = prev.position.y + newVelocityY * deltaTime;

        return {
          position: { x: newPositionX, y: newPositionY },
          velocity: { x: newVelocityX, y: newVelocityY }
        };
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targetPosition.x, targetPosition.y, enabled, defaultConfig.damping, defaultConfig.stiffness]);

  return state.position;
};
