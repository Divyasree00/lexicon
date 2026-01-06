import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingBubble } from '@/components/FloatingBubble';
import { DailyChallenge } from '@/components/DailyChallenge';
import { StreakDisplay } from '@/components/StreakDisplay';
import { Analytics } from '@/components/Analytics';
import { Library } from '@/components/Library';
import { Navigation } from '@/components/Navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useVocabularyStore } from '@/stores/vocabularyStore';
import { Sparkles, BookOpen, Zap } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('challenge');
  const { updateStreak, currentStreak, difficulty, setDifficulty } = useVocabularyStore();

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  const pageVariants = {
    initial: { opacity: 0, y: 30, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: "easeOut" as const
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      transition: { duration: 0.2 }
    },
  };

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background pb-28 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-40 -right-32 w-80 h-80 rounded-full bg-accent/5 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b border-border/30">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 rounded-2xl gradient-warm flex items-center justify-center shadow-lg"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">Lexicon</h1>
                <p className="text-[11px] text-muted-foreground font-medium">Your floating dictionary</p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Difficulty selector */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                className="text-xs font-medium bg-secondary/80 px-3 py-2 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all cursor-pointer"
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
              
              <ThemeToggle />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'challenge' && (
            <motion.div
              key="challenge"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div variants={staggerContainer} initial="initial" animate="animate">
                {/* Hero section */}
                <motion.div
                  variants={staggerItem}
                  className="relative mb-6 p-6 rounded-3xl overflow-hidden"
                >
                  {/* Gradient background */}
                  <div className="absolute inset-0 gradient-warm opacity-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-card/60" />
                  
                  {/* Animated accent */}
                  <motion.div
                    className="absolute top-0 right-0 w-32 h-32 gradient-warm rounded-full blur-2xl opacity-30"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.4, 0.3],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    <motion.div 
                      className="flex items-center gap-2 mb-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Sparkles className="w-5 h-5 text-accent" />
                      </motion.div>
                      <span className="text-sm font-semibold text-accent">Daily Challenge</span>
                    </motion.div>
                    
                    <motion.h2 
                      className="text-3xl font-bold mb-2 tracking-tight"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Learn 5 new words
                    </motion.h2>
                    
                    <motion.div 
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {currentStreak > 0 ? (
                        <>
                          <Zap className="w-4 h-4 text-accent" />
                          <span className="text-sm text-muted-foreground">
                            Keep your <span className="font-semibold text-accent">{currentStreak}-day</span> streak going!
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Start your learning streak today
                        </span>
                      )}
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <DailyChallenge />
                </motion.div>
              </motion.div>
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
