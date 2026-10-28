import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw, Volume2 } from 'lucide-react';

interface TextChallengeProps {
  onComplete: (passed: boolean, timeTaken: number) => void;
}

const WORDS = [
  'VERIFY', 'SECURE', 'HUMAN', 'ACCESS', 'PROVE', 'CHECK',
  'VALID', 'TRUST', 'MATCH', 'ENTER', 'CLICK', 'PROOF',
  'IDENT', 'ROBOT', 'SAFETY', 'TOKEN', 'GUARD', 'SHIELD'
];

function generateDistortedText(text: string): { char: string; rotation: number; offsetY: number; scale: number; skew: number }[] {
  return text.split('').map(char => ({
    char,
    rotation: (Math.random() - 0.5) * 40,
    offsetY: (Math.random() - 0.5) * 12,
    scale: 0.8 + Math.random() * 0.4,
    skew: (Math.random() - 0.5) * 20,
  }));
}

function generateNoiseLines() {
  return Array.from({ length: 5 + Math.floor(Math.random() * 4) }, () => ({
    x1: Math.random() * 100,
    y1: Math.random() * 100,
    x2: Math.random() * 100,
    y2: Math.random() * 100,
    color: `hsl(${Math.random() * 360}, 50%, 50%)`,
    width: 1 + Math.random() * 2,
  }));
}

export default function TextChallenge({ onComplete }: TextChallengeProps) {
  const [word, setWord] = useState(WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [startTime] = useState(Date.now());
  const [distortedChars, setDistortedChars] = useState(generateDistortedText(word));
  const [noiseLines, setNoiseLines] = useState(generateNoiseLines());
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDistortedChars(generateDistortedText(word));
    setNoiseLines(generateNoiseLines());
  }, [word]);

  const refresh = () => {
    const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(newWord);
    setInput('');
    setShowResult(false);
    setAttempts(prev => prev + 1);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = input.toUpperCase().trim() === word;
    setPassed(isCorrect);
    setShowResult(true);

    if (isCorrect || attempts >= 2) {
      setTimeout(() => onComplete(isCorrect, timeTaken), 1500);
    } else {
      setTimeout(() => {
        refresh();
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const speakText = () => {
    const utterance = new SpeechSynthesisUtterance(word.split('').join(' '));
    utterance.rate = 0.7;
    utterance.pitch = 0.8;
    speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Type the characters you see</p>
            <h3 className="text-lg font-bold">Enter the distorted text</h3>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={speakText}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              title="Listen to audio"
            >
              <Volume2 size={20} />
            </motion.button>
            <motion.button
              whileHover={{ rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={refresh}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <RefreshCw size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Distorted Text Display */}
      <div className="p-4 bg-gray-100">
        <div className="relative w-full h-32 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex items-center justify-center">
          {/* Noise background */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {noiseLines.map((line, i) => (
              <line
                key={i}
                x1={`${line.x1}%`}
                y1={`${line.y1}%`}
                x2={`${line.x2}%`}
                y2={`${line.y2}%`}
                stroke={line.color}
                strokeWidth={line.width}
                opacity="0.4"
              />
            ))}
            {/* Noise dots */}
            {Array.from({ length: 30 }).map((_, i) => (
              <circle
                key={`dot-${i}`}
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r={1 + Math.random() * 2}
                fill={`hsl(${Math.random() * 360}, 30%, 60%)`}
                opacity="0.3"
              />
            ))}
          </svg>

          {/* Distorted characters */}
          <div className="relative flex items-center justify-center gap-1 z-10">
            {distortedChars.map((char, i) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-3xl font-bold select-none"
                style={{
                  transform: `rotate(${char.rotation}deg) translateY(${char.offsetY}px) scale(${char.scale}) skewX(${char.skew}deg)`,
                  color: `hsl(${i * 40 + 200}, 70%, 40%)`,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                  fontFamily: 'serif',
                }}
              >
                {char.char}
              </motion.span>
            ))}
          </div>

          {/* Result overlay */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`absolute inset-0 flex items-center justify-center ${passed ? 'bg-green-50/90' : 'bg-red-50/90'}`}
            >
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full
                ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {passed ? <Check size={20} /> : <X size={20} />}
                <span className="font-medium">{passed ? 'Correct!' : 'Try again'}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type what you see..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 
              focus:outline-none text-lg tracking-widest font-mono uppercase text-center
              transition-colors"
            disabled={showResult}
            autoFocus
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 rounded-b-xl flex items-center justify-between border-t">
        <div className="text-sm text-gray-500">
          {showResult ? (
            <span className={passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {passed ? '✓ Text matched!' : `Expected: ${word}`}
            </span>
          ) : (
            <span>Attempt {attempts + 1}/3</span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={showResult || input.length === 0}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium
            hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          Verify
        </motion.button>
      </div>
    </motion.div>
  );
}
