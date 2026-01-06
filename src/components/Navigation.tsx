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
          transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.3 }}
          className="glass glass-border rounded-3xl p-2 float-shadow"
        >
          <div className="flex items-center justify-around">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={cn(
                    'relative flex flex-col items-center gap-1 py-2.5 px-5 rounded-2xl transition-all duration-300',
                    isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-accent/10 rounded-2xl"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                  <motion.div
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <tab.icon className={cn(
                      'w-5 h-5 relative z-10 transition-colors',
                      isActive && tab.id === 'streak' && 'text-accent'
                    )} />
                  </motion.div>
                  <span className="text-[10px] font-semibold relative z-10 tracking-wide">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
