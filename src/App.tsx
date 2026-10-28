import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Fingerprint, Activity, Zap, Brain, MousePointer } from 'lucide-react';
import CaptchaWidget from './components/CaptchaWidget';
import { useBehavioralAnalysis } from './hooks/useBehavioralAnalysis';
import { ChallengeResult, TrustMetrics } from './types';

function App() {
  const { behavioralData, trustMetrics, updateChallengeScore, calculateMetrics } = useBehavioralAnalysis();
  const [challengeResults, setChallengeResults] = useState<ChallengeResult[]>([]);
  const [showInfo, setShowInfo] = useState(true);

  const handleChallengeComplete = (result: ChallengeResult) => {
    setChallengeResults(prev => [...prev, result]);
  };

  const handleUpdateChallengeScore = (score: number) => {
    updateChallengeScore(score);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Shield size={40} className="text-blue-400" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">reCAPTCHA</span>
            </h1>
          </div>
          <p className="text-blue-200/70 text-sm max-w-md mx-auto">
            Multi-layer verification with behavioral biometrics, pattern recognition, and real-time trust scoring
          </p>
        </motion.header>

        {/* Main Layout */}
        <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-8 max-w-6xl mx-auto w-full">
          {/* Left Panel - Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-72 space-y-4"
          >
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Security Features</h3>
            <FeatureCard
              icon={<Brain size={18} />}
              title="Behavioral Analysis"
              description="Tracks mouse movements, clicks, and interaction patterns"
              color="blue"
            />
            <FeatureCard
              icon={<Eye size={18} />}
              title="Visual Challenges"
              description="Image grid selection, slider puzzles, and pattern recognition"
              color="purple"
            />
            <FeatureCard
              icon={<Activity size={18} />}
              title="Timing Analysis"
              description="Measures response times and interaction velocity"
              color="green"
            />
            <FeatureCard
              icon={<Zap size={18} />}
              title="Adaptive Difficulty"
              description="Adjusts challenge complexity based on trust score"
              color="amber"
            />
            <FeatureCard
              icon={<Lock size={18} />}
              title="Token Generation"
              description="Generates secure verification tokens on success"
              color="cyan"
            />
          </motion.div>

          {/* Center - CAPTCHA Widget */}
          <div className="w-full max-w-lg">
            <CaptchaWidget
              trustMetrics={trustMetrics}
              onChallengeComplete={handleChallengeComplete}
              onUpdateChallengeScore={handleUpdateChallengeScore}
            />

            {/* Challenge Results Log */}
            {challengeResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
              >
                <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                  <Activity size={14} />
                  Challenge Log
                </h4>
                <div className="space-y-2">
                  {challengeResults.map((result, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${result.passed ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-white/60 capitalize">{result.type.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/40">{result.timeTaken.toFixed(1)}s</span>
                        <span className={`font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {Math.round(result.confidence)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Live Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block w-72 space-y-4"
          >
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Live Metrics</h3>
            
            <MetricCard
              icon={<MousePointer size={18} />}
              title="Mouse Events"
              value={behavioralData.mouseMovements.length.toString()}
              subtitle="movements tracked"
              color="blue"
            />
            <MetricCard
              icon={<Fingerprint size={18} />}
              title="Avg Speed"
              value={behavioralData.avgSpeed.toFixed(2)}
              subtitle="px/ms"
              color="purple"
            />
            <MetricCard
              icon={<Activity size={18} />}
              title="Jitter Score"
              value={behavioralData.jitterScore.toFixed(3)}
              subtitle="direction variance"
              color="green"
            />
            <MetricCard
              icon={<Zap size={18} />}
              title="Linearity"
              value={(behavioralData.linearityScore * 100).toFixed(1) + '%'}
              subtitle="path directness"
              color="amber"
            />
            <MetricCard
              icon={<Lock size={18} />}
              title="Session Time"
              value={behavioralData.totalTime.toFixed(1) + 's'}
              subtitle="elapsed time"
              color="cyan"
            />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-blue-300/40 text-xs"
        >
          <p>Advanced reCAPTCHA v3.0 • Multi-layer verification system</p>
          <p className="mt-1">Behavioral biometrics • Pattern recognition • Real-time analysis</p>
        </motion.footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 5 }}
      className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} border backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h4 className="text-white text-sm font-medium">{title}</h4>
          <p className="text-white/50 text-xs mt-0.5">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon, title, value, subtitle, color }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={colorClasses[color]}>{icon}</span>
          <span className="text-white/60 text-xs">{title}</span>
        </div>
        <div className="text-right">
          <motion.span
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-sm font-bold ${colorClasses[color]}`}
          >
            {value}
          </motion.span>
          <p className="text-white/30 text-[10px]">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default App;
