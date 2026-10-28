import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { TrustMetrics } from '../types';

interface TrustScoreProps {
  metrics: TrustMetrics;
  stage: number;
  totalStages: number;
}

export default function TrustScore({ metrics, stage, totalStages }: TrustScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-yellow-400 to-amber-600';
    if (score >= 40) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-700';
  };

  const getShieldIcon = () => {
    if (metrics.overallScore >= 80) return <ShieldCheck className="text-green-500" size={24} />;
    if (metrics.overallScore >= 60) return <Shield className="text-yellow-500" size={24} />;
    if (metrics.overallScore >= 40) return <ShieldAlert className="text-orange-500" size={24} />;
    return <ShieldX className="text-red-500" size={24} />;
  };

  const getLabel = () => {
    if (metrics.overallScore >= 80) return 'High Confidence';
    if (metrics.overallScore >= 60) return 'Moderate Confidence';
    if (metrics.overallScore >= 40) return 'Low Confidence';
    return 'Suspicious Activity';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getShieldIcon()}
          <div>
            <h4 className="text-sm font-semibold text-gray-800">Trust Analysis</h4>
            <p className={`text-xs ${getScoreColor(metrics.overallScore)}`}>{getLabel()}</p>
          </div>
        </div>
        <div className="text-right">
          <motion.div
            key={metrics.overallScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}
          >
            {metrics.overallScore}%
          </motion.div>
          <p className="text-xs text-gray-400">Stage {stage}/{totalStages}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getScoreGradient(metrics.overallScore)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${metrics.overallScore}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Threshold markers */}
        <div className="absolute inset-0 flex items-center">
          <div className="absolute left-[40%] w-px h-full bg-gray-300" />
          <div className="absolute left-[60%] w-px h-full bg-gray-300" />
          <div className="absolute left-[80%] w-px h-full bg-gray-300" />
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <MetricBar label="Behavior" value={metrics.behavioralScore} />
        <MetricBar label="Challenge" value={metrics.challengeScore} />
        <MetricBar label="Timing" value={metrics.timingScore} />
        <MetricBar label="Consistency" value={metrics.consistencyScore} />
      </div>
    </motion.div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-green-500';
    if (v >= 60) return 'bg-yellow-500';
    if (v >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-16 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${getColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-8 text-right">{value}%</span>
    </div>
  );
}
