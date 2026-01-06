import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, X, Trophy, Flame } from 'lucide-react';
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
      
      // Check if we already have today's challenge
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
      <div className="flex items-center justify-center h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (quiz.isComplete) {
    const correctCount = quiz.answers.filter(Boolean).length;
    const percentage = Math.round((correctCount / words.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center"
        >
          <Trophy className="w-10 h-10 text-success" />
        </motion.div>
        
        <h2 className="text-2xl font-semibold mb-2">Challenge Complete!</h2>
        <p className="text-muted-foreground mb-6">
          You knew {correctCount} out of {words.length} words ({percentage}%)
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <Flame className="w-6 h-6 text-streak animate-flame" />
          <span className="text-3xl font-bold">{currentStreak}</span>
          <span className="text-muted-foreground">day streak</span>
        </div>
        
        <div className="flex justify-center gap-2">
          {quiz.answers.map((correct, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                correct ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
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
    <div className="p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-streak" />
          <span className="text-sm font-medium">Daily Challenge</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {quiz.currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-secondary rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((quiz.currentIndex) / words.length) * 100}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
      </div>

      {/* Word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord?.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="text-center mb-8"
        >
          <motion.h2
            className="text-4xl font-bold mb-2"
            layoutId={`word-${currentWord?.id}`}
          >
            {currentWord?.word}
          </motion.h2>
          <p className="text-muted-foreground">{currentWord?.phonetic}</p>
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
            className="w-full py-4 bg-secondary hover:bg-secondary/80 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            Reveal Definition
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm leading-relaxed">{currentWord?.meaning}</p>
              {currentWord?.example && (
                <p className="text-sm text-muted-foreground mt-2 italic">"{currentWord.example}"</p>
              )}
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDidntKnow}
                className="flex-1 py-4 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Didn't Know
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleKnew}
                className="flex-1 py-4 bg-success/10 hover:bg-success/20 text-success rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
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
