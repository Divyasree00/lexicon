import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  learned: boolean;
  learnedAt?: string;
  timesReviewed: number;
}

export interface DailyChallenge {
  date: string;
  words: Word[];
  completed: boolean;
  correctAnswers: number;
}

interface VocabularyState {
  // Word history
  searchHistory: Word[];
  addToHistory: (word: Word) => void;
  
  // Learned words
  learnedWords: Word[];
  markAsLearned: (word: Word) => void;
  
  // Daily challenge
  dailyChallenge: DailyChallenge | null;
  setDailyChallenge: (challenge: DailyChallenge) => void;
  updateChallengeProgress: (wordId: string, correct: boolean) => void;
  
  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakFreezeUsed: boolean;
  updateStreak: () => void;
  
  // Settings
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  setDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert') => void;
  
  // Analytics
  totalWordsLearned: number;
  weeklyStats: { date: string; wordsLearned: number; accuracy: number }[];
  addWeeklyStat: (stat: { date: string; wordsLearned: number; accuracy: number }) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      // Word history
      searchHistory: [],
      addToHistory: (word) =>
        set((state) => ({
          searchHistory: [
            word,
            ...state.searchHistory.filter((w) => w.word !== word.word),
          ].slice(0, 100),
        })),
      
      // Learned words
      learnedWords: [],
      markAsLearned: (word) =>
        set((state) => ({
          learnedWords: [
            { ...word, learned: true, learnedAt: new Date().toISOString() },
            ...state.learnedWords.filter((w) => w.word !== word.word),
          ],
          totalWordsLearned: state.totalWordsLearned + 1,
        })),
      
      // Daily challenge
      dailyChallenge: null,
      setDailyChallenge: (challenge) => set({ dailyChallenge: challenge }),
      updateChallengeProgress: (wordId, correct) =>
        set((state) => {
          if (!state.dailyChallenge) return state;
          const words = state.dailyChallenge.words.map((w) =>
            w.id === wordId ? { ...w, learned: true } : w
          );
          const allLearned = words.every((w) => w.learned);
          return {
            dailyChallenge: {
              ...state.dailyChallenge,
              words,
              completed: allLearned,
              correctAnswers: state.dailyChallenge.correctAnswers + (correct ? 1 : 0),
            },
          };
        }),
      
      // Streak
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakFreezeUsed: false,
      updateStreak: () =>
        set((state) => {
          const today = getToday();
          const lastDate = state.lastActiveDate;
          
          if (lastDate === today) return state;
          
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          let newStreak = state.currentStreak;
          let freezeUsed = state.streakFreezeUsed;
          
          if (lastDate === yesterdayStr) {
            newStreak += 1;
            freezeUsed = false;
          } else if (lastDate && !freezeUsed) {
            // Check if within freeze window (1 day grace)
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
            
            if (lastDate === twoDaysAgoStr) {
              freezeUsed = true;
            } else {
              newStreak = 1;
              freezeUsed = false;
            }
          } else if (!lastDate) {
            newStreak = 1;
          } else {
            newStreak = 1;
            freezeUsed = false;
          }
          
          return {
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActiveDate: today,
            streakFreezeUsed: freezeUsed,
          };
        }),
      
      // Settings
      difficulty: 'beginner',
      setDifficulty: (difficulty) => set({ difficulty }),
      
      // Analytics
      totalWordsLearned: 0,
      weeklyStats: [],
      addWeeklyStat: (stat) =>
        set((state) => ({
          weeklyStats: [...state.weeklyStats.slice(-30), stat],
        })),
    }),
    {
      name: 'vocabulary-storage',
    }
  )
);
