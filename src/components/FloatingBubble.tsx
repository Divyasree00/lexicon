import { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { BookOpen, X, Flame } from 'lucide-react';
import { DictionaryPanel } from './DictionaryPanel';
import { useVocabularyStore } from '@/stores/vocabularyStore';

export function FloatingBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const { currentStreak } = useVocabularyStore();

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Drag constraints container */}
      <div
        ref={constraintsRef}
        className="fixed inset-4 pointer-events-none z-40"
      />

      {/* Floating bubble */}
      <motion.div
        drag
        dragControls={dragControls}
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          setPosition({ x: info.offset.x, y: info.offset.y });
        }}
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.5 }}
        className="fixed bottom-28 right-6 z-50"
      >
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-2xl gradient-warm float-shadow flex items-center justify-center cursor-grab active:cursor-grabbing group"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="book"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streak indicator */}
          {currentStreak > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-accent flex items-center justify-center text-[10px] font-bold text-accent shadow-lg"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse" />
            </motion.div>
          )}

          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl gradient-warm"
            initial={false}
            animate={{
              scale: [1, 1.4, 1.4],
              opacity: [0.4, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </motion.button>
      </motion.div>

      {/* Dictionary Panel */}
      <AnimatePresence>
        {isOpen && <DictionaryPanel onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
