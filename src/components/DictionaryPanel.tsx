import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Volume2, BookmarkPlus, Check, Loader2, Sparkles } from 'lucide-react';
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
      // Fallback: try alternative pronunciation
      console.log('Audio not available');
    });
  };

  const difficultyColors = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-streak/10 text-streak',
    hard: 'bg-destructive/10 text-destructive',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-24 right-6 w-[380px] max-h-[520px] z-50 glass glass-border rounded-2xl float-shadow overflow-hidden"
    >
      {/* Search header */}
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a word..."
            className="w-full pl-10 pr-4 py-3 bg-secondary/50 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-[400px]">
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive text-center py-8"
          >
            {error}
          </motion.p>
        )}

        {word && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Word header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{word.word}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{word.phonetic}</span>
                  <button
                    onClick={playAudio}
                    className="p-1.5 rounded-full hover:bg-secondary transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', difficultyColors[word.difficulty])}>
                {word.difficulty}
              </span>
            </div>

            {/* Definition */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Definition</h3>
              <p className="text-sm text-foreground leading-relaxed">{word.meaning}</p>
            </div>

            {/* Example */}
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Example</h3>
              <p className="text-sm text-muted-foreground italic leading-relaxed">"{word.example}"</p>
            </div>

            {/* Synonyms & Antonyms */}
            {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {word.synonyms.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Synonyms</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {word.synonyms.map((syn) => (
                        <button
                          key={syn}
                          onClick={() => setQuery(syn)}
                          className="px-2 py-0.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          {syn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {word.antonyms.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Antonyms</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {word.antonyms.map((ant) => (
                        <button
                          key={ant}
                          onClick={() => setQuery(ant)}
                          className="px-2 py-0.5 text-xs rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          {ant}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Learn button */}
            <motion.button
              onClick={() => !isLearned && markAsLearned(word)}
              disabled={!!isLearned}
              whileHover={!isLearned ? { scale: 1.02 } : {}}
              whileTap={!isLearned ? { scale: 0.98 } : {}}
              className={cn(
                'w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all',
                isLearned
                  ? 'bg-success/10 text-success cursor-default'
                  : 'bg-primary text-primary-foreground hover:opacity-90'
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

        {/* Recent searches */}
        {!word && !error && searchHistory.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Recent Searches
            </h3>
            <div className="space-y-1">
              {searchHistory.slice(0, 5).map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    setQuery(w.word);
                    setWord(w);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <span className="text-sm font-medium">{w.word}</span>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', difficultyColors[w.difficulty])}>
                    {w.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!word && !error && searchHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <BookmarkPlus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Type a word to look up its meaning</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
