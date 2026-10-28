import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw } from 'lucide-react';

interface SliderChallengeProps {
  onComplete: (passed: boolean, timeTaken: number) => void;
}

export default function SliderChallenge({ onComplete }: SliderChallengeProps) {
  const [targetX, setTargetX] = useState(0);
  const [sliderX, setSliderX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxSlider = 280;

  const generatePuzzle = useCallback(() => {
    setTargetX(80 + Math.floor(Math.random() * 180));
    setSliderX(0);
    setShowResult(false);
  }, []);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleMouseDown = () => setIsDragging(true);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(maxSlider, e.clientX - rect.left - 20));
    setSliderX(x);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const tolerance = 8;
    const isCorrect = Math.abs(sliderX - targetX) <= tolerance;
    setPassed(isCorrect);
    setShowResult(true);
    setAttempts(prev => prev + 1);

    if (isCorrect || attempts >= 2) {
      const timeTaken = (Date.now() - startTime) / 1000;
      setTimeout(() => onComplete(isCorrect, timeTaken), 1500);
    }
  }, [isDragging, sliderX, targetX, attempts, startTime, onComplete]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchStart = () => setIsDragging(true);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(maxSlider, e.touches[0].clientX - rect.left - 20));
    setSliderX(x);
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleTouchMove, handleMouseUp]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Slide to complete the puzzle</p>
            <h3 className="text-lg font-bold">Drag the piece to fit</h3>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={generatePuzzle}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <RefreshCw size={20} />
          </motion.button>
        </div>
      </div>

      {/* Puzzle Area */}
      <div className="p-4 bg-gray-100">
        {/* Image with puzzle piece */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 rounded-full bg-white/30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${20 + Math.random() * 40}px`,
                  height: `${20 + Math.random() * 40}px`,
                }}
              />
            ))}
          </div>

          {/* Target outline */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 border-2 border-dashed border-white/80 rounded-md"
            style={{ left: `${targetX}px` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          {/* Sliding piece */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-md shadow-lg cursor-grab active:cursor-grabbing
              bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white flex items-center justify-center"
            style={{ left: `${sliderX}px` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-xl">🧩</span>
          </motion.div>

          {/* Result indicator */}
          {showResult && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute inset-0 flex items-center justify-center bg-black/40`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center
                ${passed ? 'bg-green-500' : 'bg-red-500'}`}>
                {passed ? <Check size={32} className="text-white" /> : <X size={32} className="text-white" />}
              </div>
            </motion.div>
          )}
        </div>

        {/* Slider track */}
        <div ref={containerRef} className="relative mt-4 h-10 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute inset-0 flex items-center px-2">
            <div className="w-full h-2 bg-gray-300 rounded-full relative">
              <motion.div
                className="absolute h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                style={{ width: `${(sliderX / maxSlider) * 100}%` }}
              />
              {/* Target marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-700 rounded-full border-2 border-white"
                style={{ left: `${(targetX / maxSlider) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 rounded-b-xl flex items-center justify-between border-t">
        <div className="text-sm text-gray-500">
          {showResult ? (
            <span className={passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {passed ? '✓ Perfect fit!' : `Missed by ${Math.abs(Math.round(sliderX - targetX))}px`}
            </span>
          ) : (
            <span>Position: {Math.round(sliderX)}px / Target: {targetX}px</span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          Attempt {attempts + 1}/3
        </div>
      </div>
    </motion.div>
  );
}
