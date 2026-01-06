import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, X, Trophy, Flame, Zap } from 'lucide-react';
import { getDailyWords, lookupWord } from '@/lib/dictionaryApi';
import { useVocabularyStore, Word } from '@/stores/vocabularyStore';
import { cn } from '@/lib/utils';

interface QuizState {
  currentIndex: number;
  showAnswer: boolean;
  answers: boolean[];
  isComplete: boolean;
}

export function DailyChallenge() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizState>({
    currentIndex: 0,
    showAnswer: false,
    answers: [],
    isComplete: false,
  });
  
  const { difficulty, markAsLearned, updateStreak, currentStreak, dailyChallenge, setDailyChallenge } = useVocabularyStore();

  useEffect(() => {
    const loadDailyWords = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      if (dailyChallenge?.date === today && dailyChallenge.completed) {
        setWords(dailyChallenge.words);
        setQuiz({
          currentIndex: 5,
          showAnswer: false,
          answers: Array(5).fill(true),
          isComplete: true,
        });
        setIsLoading(false);
        return;
      }
      
      const wordList = getDailyWords(difficulty);
      const loadedWords: Word[] = [];
      
      for (const wordText of wordList) {
        const word = await lookupWord(wordText);
        if (word) loadedWords.push(word);
      }
      
      setWords(loadedWords);
      setDailyChallenge({
        date: today,
        words: loadedWords,
        completed: false,
        correctAnswers: 0,
      });
      setIsLoading(false);
    };
    
    loadDailyWords();
  }, [difficulty, dailyChallenge, setDailyChallenge]);

  const currentWord = words[quiz.currentIndex];

  const handleKnew = () => {
    const newAnswers = [...quiz.answers, true];
    markAsLearned(currentWord);
    
    if (quiz.currentIndex === words.length - 1) {
      updateStreak();
      setQuiz({ ...quiz, answers: newAnswers, isComplete: true });
    } else {
      setQuiz({
        ...quiz,
        currentIndex: quiz.currentIndex + 1,
        showAnswer: false,
        answers: newAnswers,
      });
    }
  };

  const handleDidntKnow = () => {
    const newAnswers = [...quiz.answers, false];
    
    if (quiz.currentIndex === words.length - 1) {
      updateStreak();
      setQuiz({ ...quiz, answers: newAnswers, isComplete: true });
    } else {
      setQuiz({
        ...quiz,
        currentIndex: quiz.currentIndex + 1,
        showAnswer: false,
        answers: newAnswers,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-4">
        <motion.div
          className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-7 h-7 text-white" />
        </motion.div>
        <p className="text-sm text-muted-foreground font-medium">Loading today's words...</p>
      </div>
    );
  }

  if (quiz.isComplete) {
    const correctCount = quiz.answers.filter(Boolean).length;
    const percentage = Math.round((correctCount / words.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10 px-6"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2, damping: 12 }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl gradient-warm flex items-center justify-center shadow-xl"
        >
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold mb-2 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Challenge Complete!
        </motion.h2>
        <motion.p 
          className="text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          You knew <span className="font-semibold text-foreground">{correctCount}</span> out of <span className="font-semibold text-foreground">{words.length}</span> words ({percentage}%)
        </motion.p>
        
        <motion.div 
          className="flex items-center justify-center gap-3 mb-8 p-4 rounded-2xl bg-accent/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Flame className="w-8 h-8 text-accent" />
          </motion.div>
          <span className="text-4xl font-bold">{currentStreak}</span>
          <span className="text-muted-foreground font-medium">day streak</span>
        </motion.div>
        
        <div className="flex justify-center gap-2">
          {quiz.answers.map((correct, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center shadow-md',
                correct ? 'bg-success text-white' : 'bg-destructive text-white'
              )}
            >
              {correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-card border border-border/40">
      {/* Progress */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-4 h-4 text-accent" />
          </motion.div>
          <span className="text-sm font-semibold">Word {quiz.currentIndex + 1}</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {quiz.currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-secondary rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full gradient-warm rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((quiz.currentIndex) / words.length) * 100}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
      </div>

      {/* Word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord?.id}
          initial={{ opacity: 0, x: 60, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -60, rotateY: 10 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center mb-8"
        >
          <motion.h2
            className="text-5xl font-bold mb-3 tracking-tight"
            layoutId={`word-${currentWord?.id}`}
          >
            {currentWord?.word}
          </motion.h2>
          <p className="text-muted-foreground font-mono">{currentWord?.phonetic}</p>
        </motion.div>
      </AnimatePresence>

      {/* Show answer button or answer */}
      <AnimatePresence mode="wait">
        {!quiz.showAnswer ? (
          <motion.button
            key="reveal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setQuiz({ ...quiz, showAnswer: true })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-secondary hover:bg-secondary/80 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Reveal Definition
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="p-5 bg-secondary/50 rounded-2xl border border-border/30">
              <p className="text-sm leading-relaxed font-medium">{currentWord?.meaning}</p>
              {currentWord?.example && (
                <p className="text-sm text-muted-foreground mt-3 italic border-l-2 border-accent/30 pl-3">"{currentWord.example}"</p>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDidntKnow}
                className="flex-1 py-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Didn't Know
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleKnew}
                className="flex-1 py-4 gradient-warm text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                <Check className="w-4 h-4" />
                Knew It!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
