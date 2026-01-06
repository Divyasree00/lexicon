import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Target, Clock, BarChart3, Sparkles } from 'lucide-react';
import { useVocabularyStore } from '@/stores/vocabularyStore';
import { cn } from '@/lib/utils';

export function Analytics() {
  const { totalWordsLearned, weeklyStats, learnedWords, currentStreak } = useVocabularyStore();

  const last7DaysWords = weeklyStats.slice(-7).reduce((acc, s) => acc + s.wordsLearned, 0);
  const averageAccuracy = weeklyStats.length > 0
    ? Math.round(weeklyStats.slice(-7).reduce((acc, s) => acc + s.accuracy, 0) / Math.min(weeklyStats.length, 7))
    : 0;

  const difficultyDistribution = learnedWords.reduce(
    (acc, word) => {
      acc[word.difficulty]++;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  const stats = [
    {
      label: 'Words Learned',
      value: totalWordsLearned,
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      label: 'This Week',
      value: last7DaysWords,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      label: 'Accuracy',
      value: `${averageAccuracy}%`,
      icon: Target,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'Day Streak',
      value: currentStreak,
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-500',
    },
  ];

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const stat = weeklyStats.find((s) => s.date === dateStr);
    return {
      date: dateStr,
      count: stat?.wordsLearned || 0,
      day: date.getDate(),
    };
  });

  const maxCount = Math.max(...last30Days.map((d) => d.count), 1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
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
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -2 }}
            className="relative p-5 rounded-2xl bg-card border border-border/40 overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
          >
            {/* Gradient orb */}
            <div className={cn(
              'absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20 blur-2xl bg-gradient-to-br',
              stat.gradient
            )} />
            
            <motion.div 
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br shadow-lg',
                stat.gradient
              )}
              whileHover={{ rotate: 5 }}
            >
              <stat.icon className="w-5 h-5 text-white" />
            </motion.div>
            <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Learning heatmap */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card border border-border/40"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">Learning Activity</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Last 30 days</span>
        </div>

        <div className="grid grid-cols-10 gap-1.5">
          {last30Days.map(({ date, count }, i) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.01 }}
              className="relative group"
            >
              <motion.div
                whileHover={{ scale: 1.3 }}
                className={cn(
                  'w-full aspect-square rounded-md transition-all cursor-pointer',
                  count === 0 && 'bg-secondary',
                  count > 0 && count <= maxCount * 0.33 && 'bg-success/30',
                  count > maxCount * 0.33 && count <= maxCount * 0.66 && 'bg-success/60',
                  count > maxCount * 0.66 && 'bg-success'
                )}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {count} words • {date}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground font-medium">
          <span>Less</span>
          {[0, 0.33, 0.66, 1].map((level, i) => (
            <div
              key={i}
              className={cn(
                'w-3.5 h-3.5 rounded-md',
                level === 0 && 'bg-secondary',
                level === 0.33 && 'bg-success/30',
                level === 0.66 && 'bg-success/60',
                level === 1 && 'bg-success'
              )}
            />
          ))}
          <span>More</span>
        </div>
      </motion.div>

      {/* Difficulty distribution */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-card border border-border/40"
      >
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-4 h-4 text-accent" />
          <p className="text-sm font-semibold">Difficulty Breakdown</p>
        </div>
        
        <div className="space-y-4">
          {[
            { label: 'Easy', count: difficultyDistribution.easy, color: 'bg-success', gradient: 'from-emerald-500 to-green-500' },
            { label: 'Medium', count: difficultyDistribution.medium, color: 'bg-accent', gradient: 'from-orange-500 to-amber-500' },
            { label: 'Hard', count: difficultyDistribution.hard, color: 'bg-destructive', gradient: 'from-red-500 to-pink-500' },
          ].map(({ label, count, gradient }, index) => {
            const total = totalWordsLearned || 1;
            const percentage = Math.round((count / total) * 100);
            
            return (
              <motion.div 
                key={label} 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.6 + index * 0.1, ease: 'easeOut' }}
                    className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
