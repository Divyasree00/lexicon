import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, Zap, Shield } from 'lucide-react';
import { useVocabularyStore } from '@/stores/vocabularyStore';
import { cn } from '@/lib/utils';

export function StreakDisplay() {
  const { currentStreak, longestStreak, lastActiveDate, weeklyStats } = useVocabularyStore();
  
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const isActive = weeklyStats.some((s) => s.date === dateStr) || lastActiveDate === dateStr;
    const isToday = i === 6;
    return { date, dateStr, isActive, isToday };
  });

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main streak display */}
      <motion.div
        variants={itemVariants}
        className="relative p-6 rounded-3xl overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-warm opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm" />
        
        {/* Animated orbs */}
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-accent/15 blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        />

        <div className="relative flex items-center justify-between">
          <div>
            <motion.div 
              className="flex items-center gap-2 mb-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-6 h-6 text-accent" />
              </motion.div>
              <span className="text-sm font-semibold text-accent">Current Streak</span>
            </motion.div>
            <motion.div 
              className="flex items-baseline gap-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <span className="text-6xl font-bold text-foreground tracking-tight">{currentStreak}</span>
              <span className="text-xl text-muted-foreground font-medium">days</span>
            </motion.div>
          </div>

          <motion.div 
            className="text-right"
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Best</span>
            </div>
            <span className="text-3xl font-bold">{longestStreak}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Weekly calendar */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card border border-border/40"
      >
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold">This Week</span>
        </div>

        <div className="flex justify-between">
          {last7Days.map(({ date, dateStr, isActive, isToday }, i) => (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-muted-foreground font-medium">{dayNames[date.getDay()]}</span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all',
                  isActive && 'gradient-warm text-white shadow-lg',
                  !isActive && !isToday && 'bg-secondary text-muted-foreground',
                  isToday && !isActive && 'bg-accent/10 text-accent ring-2 ring-accent/30'
                )}
              >
                {isActive ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  date.getDate()
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Streak freeze indicator */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border/40 cursor-pointer transition-all"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center"
            animate={{ 
              rotate: [0, 10, -10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Shield className="w-6 h-6 text-blue-500" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold">Streak Freeze</p>
            <p className="text-xs text-muted-foreground">Protects your streak for 1 missed day</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-success px-3 py-1 bg-success/10 rounded-full">Active</span>
      </motion.div>
    </motion.div>
  );
}
