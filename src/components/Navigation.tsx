import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Flame, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'challenge', label: 'Challenge', icon: Sparkles },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'streak', label: 'Streak', icon: Flame },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pb-safe">
      <div className="max-w-md mx-auto px-4 pb-4">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass glass-border rounded-2xl p-2 float-shadow"
        >
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-secondary rounded-xl"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                  <tab.icon className={cn('w-5 h-5 relative z-10', isActive && tab.id === 'streak' && 'animate-flame')} />
                  <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
