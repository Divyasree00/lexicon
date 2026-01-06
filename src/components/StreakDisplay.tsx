import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';
import { useVocabularyStore } from '@/stores/vocabularyStore';
import { cn } from '@/lib/utils';

export function StreakDisplay() {
  const { currentStreak, longestStreak, lastActiveDate, weeklyStats } = useVocabularyStore();
  
  // Generate last 7 days for calendar view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const isActive = weeklyStats.some((s) => s.date === dateStr) || lastActiveDate === dateStr;
    const isToday = i === 6;
    return { date, dateStr, isActive, isToday };
  });

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="space-y-6">
      {/* Main streak display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-6 rounded-2xl bg-gradient-to-br from-streak/10 to-streak/5 overflow-hidden"
      >
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-24 h-24 rounded-full bg-streak/20"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + (i % 2) * 60}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-6 h-6 text-streak animate-flame" />
              <span className="text-sm font-medium text-streak">Current Streak</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-xl text-muted-foreground">days</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-sm">Best</span>
            </div>
            <span className="text-2xl font-semibold">{longestStreak}</span>
          </div>
        </div>
      </motion.div>

      {/* Weekly calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">This Week</span>
        </div>

        <div className="flex justify-between">
          {last7Days.map(({ date, dateStr, isActive, isToday }, i) => (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs text-muted-foreground">{dayNames[date.getDay()]}</span>
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  isActive && 'bg-success text-success-foreground',
                  !isActive && !isToday && 'bg-secondary text-muted-foreground',
                  isToday && !isActive && 'bg-primary/10 text-primary ring-2 ring-primary/20'
                )}
              >
                {isActive ? (
                  <Zap className="w-4 h-4" />
                ) : (
                  date.getDate()
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Streak freeze indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <span className="text-lg">🧊</span>
          </div>
          <div>
            <p className="text-sm font-medium">Streak Freeze</p>
            <p className="text-xs text-muted-foreground">Protects your streak for 1 missed day</p>
          </div>
        </div>
        <span className="text-sm font-medium text-success">Active</span>
      </motion.div>
    </div>
  );
}
