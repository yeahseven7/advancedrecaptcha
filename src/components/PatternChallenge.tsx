import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, RefreshCw } from 'lucide-react';

interface PatternChallengeProps {
  onComplete: (passed: boolean, timeTaken: number) => void;
}

type PatternType = 'sequence' | 'odd-one-out' | 'rotation';

interface PatternPuzzle {
  type: PatternType;
  question: string;
  items: { id: number; content: string; isAnswer: boolean }[];
}

function generateSequencePuzzle(): PatternPuzzle {
  const patterns = [
    { seq: ['🔴', '🔵', '🔴', '🔵', '🔴', '?'], answer: '🔵', options: ['🔵', '🔴', '🟢', '🟡'] },
    { seq: ['⭐', '⭐', '🌙', '⭐', '⭐', '?'], answer: '🌙', options: ['⭐', '🌙', '☀️', '💫'] },
    { seq: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '?'], answer: '6️⃣', options: ['6️⃣', '7️⃣', '5️⃣', '8️⃣'] },
    { seq: ['🐱', '🐶', '🐱', '🐶', '🐱', '?'], answer: '🐶', options: ['🐶', '🐱', '🐰', '🐸'] },
    { seq: ['🌑', '🌒', '🌓', '🌔', '🌕', '?'], answer: '🌖', options: ['🌖', '🌑', '🌕', '🌗'] },
  ];

  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const shuffledOptions = [...pattern.options].sort(() => Math.random() - 0.5);

  return {
    type: 'sequence',
    question: 'What comes next in the sequence?',
    items: [
      ...shuffledOptions.map((opt, i) => ({
        id: i,
        content: opt,
        isAnswer: opt === pattern.answer,
      })),
    ],
  };
}

function generateOddOneOut(): PatternPuzzle {
  const sets = [
    { group: '🍎', odd: '🍊', name: 'fruit color' },
    { group: '🐕', odd: '🐈', name: 'animal type' },
    { group: '🔵', odd: '🟢', name: 'color' },
    { group: '🌲', odd: '🌵', name: 'plant type' },
    { group: '🚗', odd: '🚁', name: 'vehicle' },
  ];

  const set = sets[Math.floor(Math.random() * sets.length)];
  const items: { id: number; content: string; isAnswer: boolean }[] = [];
  const oddPosition = Math.floor(Math.random() * 6);

  for (let i = 0; i < 6; i++) {
    items.push({
      id: i,
      content: i === oddPosition ? set.odd : set.group,
      isAnswer: i === oddPosition,
    });
  }

  return {
    type: 'odd-one-out',
    question: `Which one doesn't belong? (Find the different ${set.name})`,
    items,
  };
}

function generateRotation(): PatternPuzzle {
  const arrows = ['⬆️', '➡️', '⬇️', '⬅️'];
  const startIdx = Math.floor(Math.random() * 4);
  const sequence = [
    arrows[startIdx],
    arrows[(startIdx + 1) % 4],
    arrows[(startIdx + 2) % 4],
    '?',
  ];

  const answer = arrows[(startIdx + 3) % 4];
  const options = [...arrows].sort(() => Math.random() - 0.5);

  return {
    type: 'rotation',
    question: 'The arrows rotate clockwise. What comes next?',
    items: options.map((opt, i) => ({
      id: i,
      content: opt,
      isAnswer: opt === answer,
    })),
  };
}

export default function PatternChallenge({ onComplete }: PatternChallengeProps) {
  const [puzzle, setPuzzle] = useState<PatternPuzzle>(() => {
    const types = [generateSequencePuzzle, generateOddOneOut, generateRotation];
    return types[Math.floor(Math.random() * types.length)]();
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [startTime] = useState(Date.now());

  const refresh = () => {
    const types = [generateSequencePuzzle, generateOddOneOut, generateRotation];
    setPuzzle(types[Math.floor(Math.random() * types.length)]());
    setSelected(null);
    setShowResult(false);
  };

  const handleSelect = (id: number) => {
    if (showResult) return;
    setSelected(id);
    
    const item = puzzle.items.find(i => i.id === id);
    const isCorrect = item?.isAnswer || false;
    setPassed(isCorrect);
    setShowResult(true);

    const timeTaken = (Date.now() - startTime) / 1000;
    setTimeout(() => onComplete(isCorrect, timeTaken), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Pattern Recognition</p>
            <h3 className="text-lg font-bold">{puzzle.question}</h3>
          </div>
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

      {/* Pattern Display */}
      <div className="p-6 bg-gray-100">
        {puzzle.type === 'sequence' && (
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {['🔴', '🔵', '🔴', '🔵', '🔴', '?'].map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1 }}
                className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center text-2xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        )}

        {puzzle.type === 'rotation' && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {['⬆️', '➡️', '⬇️', '?'].map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 }}
                className="w-14 h-14 bg-white rounded-lg shadow-md flex items-center justify-center text-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        )}

        {puzzle.type === 'odd-one-out' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-4 text-gray-600"
          >
            <p className="text-sm">Click the item that is different from the rest</p>
          </motion.div>
        )}

        {/* Options */}
        <div className={`grid ${puzzle.type === 'odd-one-out' ? 'grid-cols-3' : 'grid-cols-4'} gap-3`}>
          {puzzle.items.map((item) => (
            <motion.button
              key={item.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: item.id * 0.08 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect(item.id)}
              className={`aspect-square rounded-xl shadow-md flex items-center justify-center text-3xl
                transition-all duration-200 border-3
                ${selected === item.id
                  ? item.isAnswer
                    ? 'bg-green-100 border-green-500 ring-4 ring-green-200'
                    : 'bg-red-100 border-red-500 ring-4 ring-red-200'
                  : showResult && item.isAnswer
                    ? 'bg-green-100 border-green-500'
                    : 'bg-white border-gray-200 hover:border-amber-400'
                }
              `}
            >
              {item.content}
              {showResult && item.isAnswer && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Check size={12} className="text-white" />
                </motion.div>
              )}
              {showResult && selected === item.id && !item.isAnswer && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X size={12} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 rounded-b-xl flex items-center justify-between border-t">
        <div className="text-sm text-gray-500">
          {showResult && (
            <span className={passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {passed ? '✓ Pattern recognized!' : '✗ Incorrect pattern'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-gray-400">Analyzing...</span>
        </div>
      </div>
    </motion.div>
  );
}
