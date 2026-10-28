import { useState, useEffect, useCallback, useRef } from 'react';
import { BehavioralData, TrustMetrics } from '../types';

export function useBehavioralAnalysis() {
  const [behavioralData, setBehavioralData] = useState<BehavioralData>({
    mouseMovements: [],
    clicks: [],
    scrollEvents: [],
    keyPresses: [],
    startTime: Date.now(),
    totalTime: 0,
    avgSpeed: 0,
    jitterScore: 0,
    linearityScore: 0,
  });

  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics>({
    behavioralScore: 0,
    challengeScore: 0,
    timingScore: 0,
    consistencyScore: 0,
    overallScore: 0,
  });

  const mouseMovementsRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const clicksRef = useRef<{ x: number; y: number; timestamp: number }[]>([]);
  const lastMoveTime = useRef(Date.now());
  const sampleCount = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastMoveTime.current < 16) return; // ~60fps sampling
    lastMoveTime.current = now;
    
    const point = { x: e.clientX, y: e.clientY, timestamp: now };
    mouseMovementsRef.current.push(point);
    sampleCount.current++;

    if (sampleCount.current % 10 === 0) {
      setBehavioralData(prev => ({
        ...prev,
        mouseMovements: [...mouseMovementsRef.current.slice(-200)],
        clicks: [...clicksRef.current],
      }));
    }
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    clicksRef.current.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
  }, []);

  const calculateMetrics = useCallback(() => {
    const movements = mouseMovementsRef.current;
    if (movements.length < 10) return;

    // Calculate average speed
    let totalDistance = 0;
    let totalTime = 0;
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i - 1].x;
      const dy = movements[i].y - movements[i - 1].y;
      const dt = movements[i].timestamp - movements[i - 1].timestamp;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      totalTime += dt;
    }
    const avgSpeed = totalTime > 0 ? totalDistance / totalTime : 0;

    // Calculate jitter (variance in direction changes)
    let totalAngleChange = 0;
    let angleChanges = 0;
    for (let i = 2; i < movements.length; i++) {
      const dx1 = movements[i - 1].x - movements[i - 2].x;
      const dy1 = movements[i - 1].y - movements[i - 2].y;
      const dx2 = movements[i].x - movements[i - 1].x;
      const dy2 = movements[i].y - movements[i - 1].y;
      
      if (Math.abs(dx1) > 0.5 || Math.abs(dy1) > 0.5) {
        const angle1 = Math.atan2(dy1, dx1);
        const angle2 = Math.atan2(dy2, dx2);
        let diff = Math.abs(angle2 - angle1);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        totalAngleChange += diff;
        angleChanges++;
      }
    }
    const jitterScore = angleChanges > 0 ? totalAngleChange / angleChanges : 0;

    // Calculate linearity (how straight the path is)
    const startPt = movements[0];
    const endPt = movements[movements.length - 1];
    const directDist = Math.sqrt(
      Math.pow(endPt.x - startPt.x, 2) + Math.pow(endPt.y - startPt.y, 2)
    );
    const linearityScore = totalDistance > 0 ? directDist / totalDistance : 0;

    // Behavioral score (higher = more human-like)
    // Humans have moderate speed, some jitter, and moderate linearity
    const speedScore = avgSpeed > 0.1 && avgSpeed < 5 ? 1 : 0.3;
    const jitterHuman = jitterScore > 0.1 && jitterScore < 1.5 ? 1 : 0.3;
    const linearityHuman = linearityScore > 0.3 && linearityScore < 0.95 ? 1 : 0.4;
    
    const behavioralScore = ((speedScore + jitterHuman + linearityHuman) / 3) * 100;

    // Timing analysis
    const totalTimeTaken = (Date.now() - movements[0].timestamp) / 1000;
    const timingScore = totalTimeTaken > 1 && totalTimeTaken < 30 ? 100 : 
                        totalTimeTaken > 0.5 ? 70 : 30;

    // Consistency (check if movements are consistently human-like)
    const consistencyScore = behavioralScore > 60 ? 90 : behavioralScore > 40 ? 60 : 30;

    setBehavioralData(prev => ({
      ...prev,
      mouseMovements: movements.slice(-200),
      clicks: clicksRef.current,
      startTime: movements[0].timestamp,
      totalTime: totalTimeTaken,
      avgSpeed,
      jitterScore,
      linearityScore,
    }));

    setTrustMetrics(prev => ({
      ...prev,
      behavioralScore: Math.round(behavioralScore),
      timingScore: Math.round(timingScore),
      consistencyScore: Math.round(consistencyScore),
      overallScore: Math.round((behavioralScore * 0.4 + timingScore * 0.3 + consistencyScore * 0.3)),
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    const interval = setInterval(calculateMetrics, 2000);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearInterval(interval);
    };
  }, [handleMouseMove, handleClick, calculateMetrics]);

  const updateChallengeScore = (score: number) => {
    setTrustMetrics(prev => ({
      ...prev,
      challengeScore: score,
      overallScore: Math.round(
        prev.behavioralScore * 0.3 + score * 0.4 + prev.timingScore * 0.15 + prev.consistencyScore * 0.15
      ),
    }));
  };

  return { behavioralData, trustMetrics, updateChallengeScore, calculateMetrics };
}
