/**
 * Shared wave physics logic to synchronize 2D visuals with 3D movement.
 */
export const WAVES_CONFIG = [
  { baseY: 0.56, amp: 6, f: 0.005, speed: 0.35 },
  { baseY: 0.60, amp: 10, f: 0.007, speed: 0.50 },
  { baseY: 0.64, amp: 15, f: 0.008, speed: 0.65 },
  { baseY: 0.68, amp: 20, f: 0.009, speed: 0.82 },
  { baseY: 0.72, amp: 26, f: 0.010, speed: 1.0 },
  { baseY: 0.76, amp: 34, f: 0.011, speed: 1.22 },
];

/**
 * Calculates the y position (displacement) for a wave layer at a given x and time.
 * This is the exact math used in OceanCanvas.
 */
export const getWaveHeight = (x: number, time: number, waveIndex: number) => {
  const wave = WAVES_CONFIG[waveIndex];
  if (!wave) return 0;
  
  // We recreate the offset logic: offset = speed * time
  // Note: OceanCanvas uses a cumulative dt-based offset, but for sync, 
  // we can use a pure time-based approach (time * speed).
  const offset = time * wave.speed;
  
  return Math.sin(x * wave.f + offset) * wave.amp
    + Math.sin(x * wave.f * 1.7 + offset * 1.3) * wave.amp * 0.4
    + Math.sin(x * wave.f * 0.4 + offset * 0.6) * wave.amp * 0.6
    + Math.sin(time * 0.8 + x * 0.002) * wave.amp * 0.2;
};
