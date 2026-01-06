import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingBubble } from '@/components/FloatingBubble';
import { DailyChallenge } from '@/components/DailyChallenge';
import { StreakDisplay } from '@/components/StreakDisplay';
import { Analytics } from '@/components/Analytics';
import { Library } from '@/components/Library';
import { Navigation } from '@/components/Navigation';
import { useVocabularyStore } from '@/stores/vocabularyStore';
import { Sparkles, BookOpen } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('challenge');
  const { updateStreak, currentStreak, difficulty, setDifficulty } = useVocabularyStore();

  // Update streak on mount
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-border/50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
              >
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="font-semibold text-lg">Lexicon</h1>
                <p className="text-xs text-muted-foreground">Your floating dictionary</p>
              </div>
            </div>

            {/* Difficulty selector */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              className="text-xs bg-secondary px-3 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-ring/20"
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'challenge' && (
            <motion.div
              key="challenge"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Welcome section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-streak" />
                  <span className="text-sm font-medium">Daily Challenge</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">Learn 5 new words</h2>
                <p className="text-sm text-muted-foreground">
                  {currentStreak > 0
                    ? `Keep your ${currentStreak}-day streak going!`
                    : 'Start your learning streak today'}
                </p>
              </motion.div>

              <DailyChallenge />
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div
              key="library"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Library />
            </motion.div>
          )}

          {activeTab === 'streak' && (
            <motion.div
              key="streak"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <StreakDisplay />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Analytics />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating dictionary bubble */}
      <FloatingBubble />
    </div>
  );
};

export default Index;
