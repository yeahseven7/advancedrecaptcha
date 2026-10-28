import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, CheckCircle2, XCircle, Eye, EyeOff, Fingerprint } from 'lucide-react';
import ImageChallenge from './ImageChallenge';
import SliderChallenge from './SliderChallenge';
import TextChallenge from './TextChallenge';
import PatternChallenge from './PatternChallenge';
import TrustScore from './TrustScore';
import { ChallengeType, ChallengeResult, TrustMetrics } from '../types';

interface CaptchaWidgetProps {
  trustMetrics: TrustMetrics;
  onChallengeComplete: (result: ChallengeResult) => void;
  onUpdateChallengeScore: (score: number) => void;
}

const CHALLENGE_SEQUENCE: ChallengeType[] = ['image-grid', 'slider', 'pattern', 'text-distort'];

export default function CaptchaWidget({ trustMetrics, onChallengeComplete, onUpdateChallengeScore }: CaptchaWidgetProps) {
  const [stage, setStage] = useState(-1); // -1 = initial checkbox, 0+ = challenges
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [challengeResults, setChallengeResults] = useState<ChallengeResult[]>([]);
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [showMetrics, setShowMetrics] = useState(true);
  const [animatingPulse, setAnimatingPulse] = useState(false);

  useEffect(() => {
    // Randomly select 2-3 challenges
    const shuffled = [...CHALLENGE_SEQUENCE].sort(() => Math.random() - 0.5);
    const count = 2 + Math.floor(Math.random() * 2);
    setChallenges(shuffled.slice(0, count));
  }, []);

  const handleCheckboxClick = () => {
    if (isVerified || isFailed) return;
    
    setAnimatingPulse(true);
    setTimeout(() => setAnimatingPulse(false), 1000);

    // If behavioral score is high enough, might skip challenges
    if (trustMetrics.behavioralScore >= 85 && trustMetrics.timingScore >= 70) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
        onUpdateChallengeScore(100);
        onChallengeComplete({
          type: 'behavioral',
          passed: true,
          timeTaken: 0,
          confidence: trustMetrics.overallScore,
        });
      }, 2000);
    } else {
      setIsVerifying(true);
      setTimeout(() => {
        setIsVerifying(false);
        setStage(0);
      }, 1500);
    }
  };

  const handleChallengeComplete = (passed: boolean, timeTaken: number) => {
    const currentChallenge = challenges[stage];
    const result: ChallengeResult = {
      type: currentChallenge,
      passed,
      timeTaken,
      confidence: passed ? 80 + Math.random() * 20 : 20 + Math.random() * 30,
    };

    const newResults = [...challengeResults, result];
    setChallengeResults(newResults);

    // Calculate challenge score
    const passedCount = newResults.filter(r => r.passed).length;
    const score = Math.round((passedCount / newResults.length) * 100);
    onUpdateChallengeScore(score);

    onChallengeComplete(result);

    if (!passed) {
      // Allow retry once, then fail
      const failedCount = newResults.filter(r => !r.passed).length;
      if (failedCount >= 2) {
        setIsFailed(true);
        return;
      }
    }

    // Move to next challenge or complete
    if (stage + 1 < challenges.length) {
      setStage(stage + 1);
    } else {
      // All challenges done
      const finalPassed = newResults.filter(r => r.passed).length >= Math.ceil(challenges.length * 0.7);
      if (finalPassed) {
        setIsVerifying(true);
        setTimeout(() => {
          setIsVerifying(false);
          setIsVerified(true);
        }, 2000);
      } else {
        setIsFailed(true);
      }
    }
  };

  const reset = () => {
    setStage(-1);
    setIsVerifying(false);
    setIsVerified(false);
    setIsFailed(false);
    setChallengeResults([]);
    const shuffled = [...CHALLENGE_SEQUENCE].sort(() => Math.random() - 0.5);
    const count = 2 + Math.floor(Math.random() * 2);
    setChallenges(shuffled.slice(0, count));
  };

  const renderChallenge = () => {
    if (stage < 0 || stage >= challenges.length) return null;
    const challenge = challenges[stage];

    switch (challenge) {
      case 'image-grid':
        return <ImageChallenge onComplete={handleChallengeComplete} />;
      case 'slider':
        return <SliderChallenge onComplete={handleChallengeComplete} />;
      case 'text-distort':
        return <TextChallenge onComplete={handleChallengeComplete} />;
      case 'pattern':
        return <PatternChallenge onComplete={handleChallengeComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      {/* Main Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Header bar */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <span className="text-white text-sm font-medium">Advanced Security Check</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMetrics(!showMetrics)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showMetrics ? <Eye size={14} /> : <EyeOff size={14} />}
            </motion.button>
            <span className="text-gray-500 text-xs">v3.0</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {/* Initial State - Checkbox */}
            {stage === -1 && !isVerifying && !isVerified && !isFailed && (
              <motion.div
                key="checkbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between py-4"
              >
                <motion.button
                  onClick={handleCheckboxClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-4 group"
                >
                  <motion.div
                    animate={animatingPulse ? { scale: [1, 1.2, 1] } : {}}
                    className={`w-8 h-8 rounded border-2 flex items-center justify-center transition-all
                      ${animatingPulse ? 'border-blue-500 bg-blue-50' : 'border-gray-300 group-hover:border-blue-400'}`}
                  >
                    {animatingPulse && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 bg-blue-500 rounded-sm"
                      />
                    )}
                  </motion.div>
                  <span className="text-gray-700 text-lg group-hover:text-gray-900 transition-colors">
                    I'm not a robot
                  </span>
                </motion.button>
                <div className="flex flex-col items-end">
                  <Fingerprint size={32} className="text-gray-300" />
                  <span className="text-xs text-gray-400 mt-1">reCAPTCHA</span>
                </div>
              </motion.div>
            )}

            {/* Verifying State */}
            {isVerifying && !isVerified && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                >
                  <Loader2 size={40} className="text-blue-500" />
                </motion.div>
                <p className="mt-4 text-gray-600 font-medium">Verifying your identity...</p>
                <div className="flex gap-1 mt-3">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                      className="w-2 h-2 rounded-full bg-blue-500"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Challenge State */}
            {stage >= 0 && stage < challenges.length && !isVerified && !isFailed && (
              <motion.div
                key={`challenge-${stage}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Challenge progress */}
                <div className="flex items-center gap-2 mb-4">
                  {challenges.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        i < stage ? 'bg-green-500' : i === stage ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {renderChallenge()}
              </motion.div>
            )}

            {/* Verified State */}
            {isVerified && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 size={64} className="text-green-500" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-green-700 text-xl font-bold"
                >
                  Verification Complete
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500 text-sm mt-1"
                >
                  Human verified with {trustMetrics.overallScore}% confidence
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 px-4 py-2 bg-green-50 rounded-lg border border-green-200"
                >
                  <p className="text-green-700 text-xs font-mono">
                    Token: {btoa(`verified_${Date.now()}_${trustMetrics.overallScore}`).slice(0, 32)}...
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Failed State */}
            {isFailed && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <XCircle size={64} className="text-red-500" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-red-700 text-xl font-bold"
                >
                  Verification Failed
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500 text-sm mt-1"
                >
                  Too many failed attempts. Please try again.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="mt-4 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-400">Secure connection</span>
          </div>
          <span className="text-xs text-gray-400">Privacy - Terms</span>
        </div>
      </motion.div>

      {/* Trust Score Panel */}
      <AnimatePresence>
        {showMetrics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TrustScore
              metrics={trustMetrics}
              stage={Math.max(0, stage + 1)}
              totalStages={challenges.length}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
