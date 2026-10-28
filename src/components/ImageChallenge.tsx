import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw } from 'lucide-react';

interface ImageChallengeProps {
  onComplete: (passed: boolean, timeTaken: number) => void;
}

const CATEGORIES = [
  { name: 'traffic lights', emoji: '🚦' },
  { name: 'bicycles', emoji: '🚲' },
  { name: 'crosswalks', emoji: '🚶' },
  { name: 'buses', emoji: '🚌' },
  { name: 'mountains', emoji: '⛰️' },
  { name: 'cars', emoji: '🚗' },
];

interface GridImage {
  id: number;
  content: string;
  isTarget: boolean;
  selected: boolean;
  gradient: string;
}

// Targets and distractors are now completely disjoint sets per category
const CATEGORY_DATA: Record<string, { targets: string[]; distractors: string[] }> = {
  'traffic lights': {
    targets: ['🚦', '🚥'],
    distractors: ['🚗', '🏠', '🌳', '🚲', '🏢', '🌊', '🎪', '🏖️'],
  },
  'bicycles': {
    targets: ['🚲', '🚴', '🚳'],
    distractors: ['🏍️', '🚗', '🛴', '🌳', '🏠', '🚶', '🌊', '🏖️'],
  },
  'crosswalks': {
    targets: ['🚶', '🚸', '🏃'],
    distractors: ['🚗', '🌳', '🏠', '🚲', '🚌', '🌊', '🏖️', '🎪'],
  },
  'buses': {
    targets: ['🚌', '🚍', '🚐', '🚎'],
    distractors: ['🚗', '🚕', '🏠', '🌳', '🚲', '🌊', '🏖️', '🎪'],
  },
  'mountains': {
    targets: ['⛰️', '🏔️', '🗻', '🌋'],
    distractors: ['🏠', '🌳', '🚗', '🌊', '🏖️', '🚌', '🎪', '🏢'],
  },
  'cars': {
    targets: ['🚗', '🚙', '🏎️', '🚕', '🚓', '🚘'],
    distractors: ['🚌', '🏠', '🌳', '🌊', '🏖️', '🚲', '🎪', '🏢'],
  },
};

const GRADIENTS = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
  'from-cyan-400 to-cyan-600',
  'from-red-400 to-red-600',
  'from-yellow-400 to-yellow-600',
  'from-indigo-400 to-indigo-600',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateGrid(categoryName: string): GridImage[] {
  const data = CATEGORY_DATA[categoryName];
  if (!data) {
    // Fallback
    return Array.from({ length: 9 }, (_, i) => ({
      id: i,
      content: '❓',
      isTarget: false,
      selected: false,
      gradient: GRADIENTS[i],
    }));
  }

  const { targets, distractors } = data;
  const targetCount = 3 + Math.floor(Math.random() * 2); // 3 or 4 targets

  // Build positions array: first `targetCount` positions are targets
  const positions = Array.from({ length: 9 }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  const targetPositions = new Set(positions.slice(0, targetCount));

  const grid: GridImage[] = [];
  for (let i = 0; i < 9; i++) {
    const isTarget = targetPositions.has(i);
    const emoji = isTarget ? pickRandom(targets) : pickRandom(distractors);

    grid.push({
      id: i,
      content: emoji,
      isTarget,
      selected: false,
      gradient: GRADIENTS[i],
    });
  }

  return grid;
}

function pickRandomCategory() {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

export default function ImageChallenge({ onComplete }: ImageChallengeProps) {
  const [category, setCategory] = useState(pickRandomCategory);
  const [grid, setGrid] = useState<GridImage[]>(() => generateGrid(category.name));
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Use ref for startTime so we can reset it
  const startTimeRef = useRef(Date.now());

  const toggleSelect = (id: number) => {
    if (showResult) return; // Prevent changes after submission
    setGrid(prev =>
      prev.map(img =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const handleSubmit = () => {
    if (showResult) return;

    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    const correct = grid.every(img => img.selected === img.isTarget);
    const selectedCount = grid.filter(img => img.selected).length;

    // Must select at least one item
    if (selectedCount === 0) return;

    setPassed(correct);
    setShowResult(true);
    setAttempts(prev => prev + 1);

    setTimeout(() => {
      if (correct) {
        onComplete(true, timeTaken);
      } else if (attempts + 1 >= maxAttempts) {
        // Out of attempts
        onComplete(false, timeTaken);
      }
      // If not correct and still has attempts, user can retry via refresh
    }, 1800);
  };

  const handleRefresh = useCallback(() => {
    // Pick a new category (try to avoid same one)
    let newCategory = pickRandomCategory();
    if (CATEGORIES.length > 1) {
      while (newCategory.name === category.name) {
        newCategory = pickRandomCategory();
      }
    }

    setCategory(newCategory);
    setGrid(generateGrid(newCategory.name));
    setShowResult(false);
    setPassed(false);
    startTimeRef.current = Date.now();
  }, [category.name]);

  const selectedCount = grid.filter(img => img.selected).length;
  const targetCount = grid.filter(img => img.isTarget).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Select all images with</p>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">{category.emoji}</span>
              {category.name}
            </h3>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="New challenge"
          >
            <RefreshCw size={20} />
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1.5 p-3 bg-gray-100">
        <AnimatePresence mode="popLayout">
          {grid.map((img) => {
            // Determine ring styling based on state
            let ringClass = '';
            if (showResult) {
              if (img.isTarget && img.selected) {
                // Correctly selected — green
                ringClass = 'ring-4 ring-green-500 ring-offset-1';
              } else if (img.isTarget && !img.selected) {
                // Missed target — green dashed
                ringClass = 'ring-4 ring-green-400 ring-offset-1 ring-dashed';
              } else if (!img.isTarget && img.selected) {
                // Wrongly selected — red
                ringClass = 'ring-4 ring-red-500 ring-offset-1';
              }
            } else if (img.selected) {
              ringClass = 'ring-4 ring-blue-500 ring-offset-2';
            }

            return (
              <motion.button
                key={img.id}
                layout
                whileHover={!showResult ? { scale: 1.05 } : {}}
                whileTap={!showResult ? { scale: 0.95 } : {}}
                onClick={() => toggleSelect(img.id)}
                disabled={showResult}
                className={`relative aspect-square rounded-lg bg-gradient-to-br ${img.gradient} 
                  flex items-center justify-center cursor-pointer
                  transition-all duration-200 overflow-hidden
                  ${ringClass}
                  ${showResult ? 'cursor-default' : ''}
                `}
              >
                <span className="text-5xl drop-shadow-lg select-none">{img.content}</span>

                {/* Selection checkmark (during selection phase) */}
                {img.selected && !showResult && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md"
                  >
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}

                {/* Result indicators */}
                {showResult && img.isTarget && img.selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md"
                  >
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
                {showResult && img.isTarget && !img.selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-md"
                  >
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
                {showResult && !img.isTarget && img.selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                  >
                    <X size={14} className="text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 rounded-b-xl flex items-center justify-between border-t">
        <div className="flex items-center gap-2">
          {showResult ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
                ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {passed ? <Check size={16} /> : <X size={16} />}
              {passed ? 'Verified!' : 'Incorrect'}
            </motion.div>
          ) : (
            <span className="text-xs text-gray-400">
              {selectedCount} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!showResult && attempts > 0 && (
            <span className="text-xs text-gray-400">
              Attempt {attempts + 1}/{maxAttempts}
            </span>
          )}
          {showResult && !passed && attempts < maxAttempts && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg font-medium
                hover:bg-gray-300 transition-colors"
            >
              Try Again
            </motion.button>
          )}
          <motion.button
            whileHover={!showResult && selectedCount > 0 ? { scale: 1.05 } : {}}
            whileTap={!showResult && selectedCount > 0 ? { scale: 0.95 } : {}}
            onClick={handleSubmit}
            disabled={showResult || selectedCount === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            Verify
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
