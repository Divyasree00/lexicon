import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Volume2, ChevronRight, Download } from 'lucide-react';
import { useVocabularyStore, Word } from '@/stores/vocabularyStore';
import { getAudioUrl } from '@/lib/dictionaryApi';
import { cn } from '@/lib/utils';

export function Library() {
  const [search, setSearch] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const { learnedWords, searchHistory } = useVocabularyStore();

  const allWords = [...learnedWords, ...searchHistory.filter((w) => !learnedWords.some((lw) => lw.word === w.word))];
  
  const filteredWords = allWords.filter((word) =>
    word.word.toLowerCase().includes(search.toLowerCase())
  );

  const playAudio = (word: string) => {
    const audio = new Audio(getAudioUrl(word));
    audio.play().catch(() => console.log('Audio not available'));
  };

  const exportData = () => {
    const data = {
      learnedWords,
      searchHistory,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const difficultyColors = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-streak/10 text-streak',
    hard: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Library</h2>
          <p className="text-sm text-muted-foreground">{learnedWords.length} words learned</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportData}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <Download className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your vocabulary..."
          className="w-full pl-10 pr-4 py-3 bg-secondary/50 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
        />
      </div>

      {/* Word list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredWords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No words yet. Start learning!</p>
            </motion.div>
          ) : (
            filteredWords.map((word, i) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => setSelectedWord(selectedWord?.id === word.id ? null : word)}
                className="p-4 rounded-xl bg-card border border-border/50 cursor-pointer hover-lift"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio(word.word);
                      }}
                      className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <div>
                      <p className="font-medium">{word.word}</p>
                      <p className="text-xs text-muted-foreground">{word.phonetic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {word.learned && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success">
                        Learned
                      </span>
                    )}
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', difficultyColors[word.difficulty])}>
                      {word.difficulty}
                    </span>
                    <ChevronRight className={cn(
                      'w-4 h-4 text-muted-foreground transition-transform',
                      selectedWord?.id === word.id && 'rotate-90'
                    )} />
                  </div>
                </div>

                <AnimatePresence>
                  {selectedWord?.id === word.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-border/50 space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Definition</p>
                          <p className="text-sm">{word.meaning}</p>
                        </div>
                        {word.example && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Example</p>
                            <p className="text-sm italic text-muted-foreground">"{word.example}"</p>
                          </div>
                        )}
                        {word.synonyms.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Synonyms</p>
                            <div className="flex flex-wrap gap-1.5">
                              {word.synonyms.map((syn) => (
                                <span key={syn} className="px-2 py-0.5 text-xs rounded-md bg-secondary">
                                  {syn}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
