import { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { BookOpen, X, Flame, Search } from 'lucide-react';
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
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full glass glass-border float-shadow flex items-center justify-center cursor-grab active:cursor-grabbing group"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="book"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <BookOpen className="w-5 h-5 text-foreground" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Streak indicator */}
          {currentStreak > 0 && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-streak flex items-center justify-center text-[10px] font-semibold text-white streak-glow"
            >
              <Flame className="w-3 h-3 animate-flame" />
            </motion.div>
          )}

          {/* Hover ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-foreground/10"
            initial={false}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
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
