import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Target, Clock, BarChart3 } from 'lucide-react';
import { useVocabularyStore } from '@/stores/vocabularyStore';
import { cn } from '@/lib/utils';

export function Analytics() {
  const { totalWordsLearned, weeklyStats, learnedWords, currentStreak } = useVocabularyStore();

  // Calculate weekly progress
  const last7DaysWords = weeklyStats.slice(-7).reduce((acc, s) => acc + s.wordsLearned, 0);
  const averageAccuracy = weeklyStats.length > 0
    ? Math.round(weeklyStats.slice(-7).reduce((acc, s) => acc + s.accuracy, 0) / Math.min(weeklyStats.length, 7))
    : 0;

  // Difficulty distribution
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
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'This Week',
      value: last7DaysWords,
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Accuracy',
      value: `${averageAccuracy}%`,
      icon: Target,
      color: 'text-streak',
      bg: 'bg-streak/10',
    },
    {
      label: 'Day Streak',
      value: currentStreak,
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
  ];

  // Learning heatmap data (last 30 days)
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

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-card border border-border/50 hover-lift"
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Learning heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Learning Activity</span>
          <span className="text-xs text-muted-foreground ml-auto">Last 30 days</span>
        </div>

        <div className="grid grid-cols-10 gap-1">
          {last30Days.map(({ date, count, day }, i) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.01 }}
              className="relative group"
            >
              <div
                className={cn(
                  'w-full aspect-square rounded-sm transition-all',
                  count === 0 && 'bg-secondary',
                  count > 0 && count <= maxCount * 0.33 && 'bg-success/30',
                  count > maxCount * 0.33 && count <= maxCount * 0.66 && 'bg-success/60',
                  count > maxCount * 0.66 && 'bg-success'
                )}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {count} words • {date}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 0.33, 0.66, 1].map((level, i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-sm',
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-card border border-border/50"
      >
        <p className="text-sm font-medium mb-4">Difficulty Breakdown</p>
        
        <div className="space-y-3">
          {[
            { label: 'Easy', count: difficultyDistribution.easy, color: 'bg-success' },
            { label: 'Medium', count: difficultyDistribution.medium, color: 'bg-streak' },
            { label: 'Hard', count: difficultyDistribution.hard, color: 'bg-destructive' },
          ].map(({ label, count, color }) => {
            const total = totalWordsLearned || 1;
            const percentage = Math.round((count / total) * 100);
            
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className={cn('h-full rounded-full', color)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
