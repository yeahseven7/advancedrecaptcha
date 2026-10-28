export type ChallengeType = 'image-grid' | 'slider' | 'text-distort' | 'pattern' | 'behavioral';

export type ChallengeStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface BehavioralData {
  mouseMovements: { x: number; y: number; timestamp: number }[];
  clicks: { x: number; y: number; timestamp: number }[];
  scrollEvents: { timestamp: number; deltaY: number }[];
  keyPresses: { key: string; timestamp: number }[];
  startTime: number;
  totalTime: number;
  avgSpeed: number;
  jitterScore: number;
  linearityScore: number;
}

export interface TrustMetrics {
  behavioralScore: number;
  challengeScore: number;
  timingScore: number;
  consistencyScore: number;
  overallScore: number;
}

export interface ChallengeResult {
  type: ChallengeType;
  passed: boolean;
  timeTaken: number;
  confidence: number;
}
