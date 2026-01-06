import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Volume2, BookmarkPlus, Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { lookupWord, getAudioUrl } from '@/lib/dictionaryApi';
import { useVocabularyStore, Word } from '@/stores/vocabularyStore';
import { cn } from '@/lib/utils';

interface DictionaryPanelProps {
  onClose: () => void;
}

export function DictionaryPanel({ onClose }: DictionaryPanelProps) {
  const [query, setQuery] = useState('');
  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { addToHistory, markAsLearned, learnedWords, searchHistory } = useVocabularyStore();
  
  const isLearned = word && learnedWords.some((w) => w.word === word.word);

  useEffect(() => {
    inputRef.current?.focus();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    
    const result = await lookupWord(query.trim());
    
    if (result) {
      setWord(result);
      addToHistory(result);
    } else {
      setError('Word not found. Check spelling or try another word.');
      setWord(null);
    }
    
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const playAudio = () => {
    if (!word) return;
    const audio = new Audio(getAudioUrl(word.word));
    audio.play().catch(() => {
      console.log('Audio not available');
    });
  };

  const difficultyColors = {
    easy: 'bg-success/15 text-success border border-success/20',
    medium: 'bg-accent/15 text-accent border border-accent/20',
    hard: 'bg-destructive/15 text-destructive border border-destructive/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 30 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-44 right-6 w-[400px] max-h-[520px] z-50 glass glass-border rounded-3xl float-shadow overflow-hidden"
    >
      {/* Search header */}
      <div className="p-5 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a word..."
            className="w-full pl-11 pr-12 py-3.5 bg-secondary/60 rounded-2xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          />
          {isLoading ? (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin" />
          ) : query && (
            <motion.button
              onClick={handleSearch}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-accent flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto max-h-[400px]">
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-destructive text-center py-8"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {word && (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5"
            >
              {/* Word header */}
              <div className="flex items-start justify-between">
                <div>
                  <motion.h2 
                    className="text-3xl font-bold text-foreground tracking-tight"
                    layoutId={`word-${word.word}`}
                  >
                    {word.word}
                  </motion.h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground font-mono">{word.phonetic}</span>
                    <motion.button
                      onClick={playAudio}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </div>
                </div>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn('px-3 py-1 rounded-full text-xs font-semibold', difficultyColors[word.difficulty])}
                >
                  {word.difficulty}
                </motion.span>
              </div>

              {/* Definition */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Definition</h3>
                <p className="text-sm text-foreground leading-relaxed">{word.meaning}</p>
              </motion.div>

              {/* Example */}
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Example</h3>
                <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-accent/30 pl-3">"{word.example}"</p>
              </motion.div>

              {/* Synonyms & Antonyms */}
              {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {word.synonyms.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Synonyms</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {word.synonyms.map((syn, i) => (
                          <motion.button
                            key={syn}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + i * 0.03 }}
                            onClick={() => setQuery(syn)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                          >
                            {syn}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  {word.antonyms.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Antonyms</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {word.antonyms.map((ant, i) => (
                          <motion.button
                            key={ant}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + i * 0.03 }}
                            onClick={() => setQuery(ant)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                          >
                            {ant}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Learn button */}
              <motion.button
                onClick={() => !isLearned && markAsLearned(word)}
                disabled={!!isLearned}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={!isLearned ? { scale: 1.02 } : {}}
                whileTap={!isLearned ? { scale: 0.98 } : {}}
                className={cn(
                  'w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
                  isLearned
                    ? 'bg-success/15 text-success cursor-default'
                    : 'gradient-warm text-white shadow-lg hover:shadow-xl'
                )}
              >
                {isLearned ? (
                  <>
                    <Check className="w-4 h-4" />
                    Learned
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    Mark as Learned
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent searches */}
        {!word && !error && searchHistory.length > 0 && (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Recent Searches
            </h3>
            <div className="space-y-1.5">
              {searchHistory.slice(0, 5).map((w, i) => (
                <motion.button
                  key={w.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setQuery(w.word);
                    setWord(w);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/60 transition-colors text-left group"
                >
                  <span className="text-sm font-medium group-hover:text-accent transition-colors">{w.word}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', difficultyColors[w.difficulty])}>
                    {w.difficulty}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!word && !error && searchHistory.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <BookmarkPlus className="w-7 h-7 text-accent" />
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium">Type a word to look up its meaning</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
