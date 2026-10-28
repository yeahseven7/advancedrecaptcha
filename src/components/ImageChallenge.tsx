import { useState, useEffect } from 'react';
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

function generateGrid(category: string): GridImage[] {
  const emojis: Record<string, string[]> = {
    'traffic lights': ['🚦', '🚥', '🔴', '🟢', '🚗', '🏠', '🌳', '🚲', '🏢'],
    'bicycles': ['🚲', '🚴', '🚳', '🏍️', '🚗', '🛴', '🌳', '🏠', '🚶'],
    'crosswalks': ['🚶', '🚸', '🛤️', '🏃', '🚗', '🌳', '🏠', '🚲', '🚌'],
    'buses': ['🚌', '🚍', '🚐', '🚗', '🚕', '🚎', '🏠', '🌳', '🚲'],
    'mountains': ['⛰️', '🏔️', '🗻', '🌋', '🏠', '🌳', '🚗', '🌊', '🏖️'],
    'cars': ['🚗', '🚙', '🏎️', '🚕', '🚓', '🚘', '🚌', '🏠', '🌳'],
  };

  const targetEmojis = emojis[category] || ['🎯'];
  const distractors = ['🏠', '🌳', '🌊', '🏖️', '🌋', '🏢', '🎪', '🎭'];
  
  const gradients = [
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

  const grid: GridImage[] = [];
  const targetCount = 3 + Math.floor(Math.random() * 3);
  const indices = Array.from({ length: 9 }, (_, i) => i);
  
  // Shuffle indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < 9; i++) {
    const isTarget = indices.indexOf(i) < targetCount;
    const emojiList = isTarget ? targetEmojis : distractors;
    const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    
    grid.push({
      id: i,
      content: emoji,
      isTarget,
      selected: false,
      gradient: gradients[i],
    });
  }

  return grid;
}

export default function ImageChallenge({ onComplete }: ImageChallengeProps) {
  const [category, setCategory] = useState(CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]);
  const [grid, setGrid] = useState<GridImage[]>(() => generateGrid(category.name));
  const [startTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    setGrid(generateGrid(category.name));
  }, [category]);

  const toggleSelect = (id: number) => {
    setGrid(prev => prev.map(img => 
      img.id === id ? { ...img, selected: !img.selected } : img
    ));
  };

  const handleSubmit = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const correct = grid.every(img => img.selected === img.isTarget);
    setPassed(correct);
    setShowResult(true);
    
    setTimeout(() => {
      onComplete(correct, timeTaken);
    }, 1500);
  };

  const handleRefresh = () => {
    const newCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setCategory(newCategory);
    setGrid(generateGrid(newCategory.name));
    setShowResult(false);
  };

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
          >
            <RefreshCw size={20} />
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-1 p-3 bg-gray-100">
        <AnimatePresence>
          {grid.map((img) => (
            <motion.button
              key={img.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleSelect(img.id)}
              className={`relative aspect-square rounded-lg bg-gradient-to-br ${img.gradient} 
                flex items-center justify-center text-4xl cursor-pointer
                transition-all duration-200 overflow-hidden
                ${img.selected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}
                ${showResult && img.isTarget ? 'ring-4 ring-green-500' : ''}
                ${showResult && img.selected && !img.isTarget ? 'ring-4 ring-red-500' : ''}
              `}
            >
              <span className="text-5xl drop-shadow-lg">{img.content}</span>
              {img.selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
              {showResult && img.isTarget && !img.selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-3 rounded-b-xl flex items-center justify-between border-t">
        <div className="flex items-center gap-2">
          {showResult && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {passed ? <Check size={16} /> : <X size={16} />}
              {passed ? 'Verified' : 'Try again'}
            </motion.div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={showResult || grid.filter(i => i.selected).length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          Verify
        </motion.button>
      </div>
    </motion.div>
  );
}
