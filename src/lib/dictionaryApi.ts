import { get, set } from 'idb-keyval';
import { Word } from '@/stores/vocabularyStore';

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

interface DictionaryResponse {
  word: string;
  phonetic?: string;
  phonetics: { text?: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string; synonyms?: string[]; antonyms?: string[] }[];
    synonyms?: string[];
    antonyms?: string[];
  }[];
}

const getDifficulty = (word: string): 'easy' | 'medium' | 'hard' => {
  if (word.length <= 5) return 'easy';
  if (word.length <= 8) return 'medium';
  return 'hard';
};

export async function lookupWord(word: string): Promise<Word | null> {
  const cacheKey = `word-${word.toLowerCase()}`;
  
  // Check cache first
  try {
    const cached = await get(cacheKey);
    if (cached) return cached as Word;
  } catch (e) {
    console.log('Cache miss or error:', e);
  }
  
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data: DictionaryResponse[] = await response.json();
    const entry = data[0];
    
    const phonetic = entry.phonetics.find((p) => p.text)?.text || entry.phonetic || '';
    const meaning = entry.meanings[0];
    const definition = meaning?.definitions[0];
    
    const result: Word = {
      id: `${word}-${Date.now()}`,
      word: entry.word,
      phonetic,
      meaning: definition?.definition || 'No definition available',
      example: definition?.example || `The word "${entry.word}" is commonly used in everyday language.`,
      synonyms: (meaning?.synonyms || definition?.synonyms || []).slice(0, 5),
      antonyms: (meaning?.antonyms || definition?.antonyms || []).slice(0, 5),
      difficulty: getDifficulty(entry.word),
      learned: false,
      timesReviewed: 0,
    };
    
    // Cache the result
    try {
      await set(cacheKey, result);
    } catch (e) {
      console.log('Failed to cache:', e);
    }
    
    return result;
  } catch (error) {
    console.error('Dictionary API error:', error);
    return null;
  }
}

export function getAudioUrl(word: string): string {
  return `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`;
}

// Daily challenge words pool
const wordPools = {
  beginner: [
    'happy', 'brave', 'quick', 'calm', 'bright', 'gentle', 'honest', 'kind',
    'proud', 'wise', 'eager', 'fair', 'humble', 'jolly', 'keen', 'loyal',
    'merry', 'noble', 'plain', 'quiet', 'rare', 'safe', 'true', 'warm',
  ],
  intermediate: [
    'eloquent', 'profound', 'resilient', 'vibrant', 'serene', 'diligent',
    'tenacious', 'versatile', 'meticulous', 'empathetic', 'pragmatic',
    'candid', 'zealous', 'prudent', 'jovial', 'amiable', 'astute', 'benign',
  ],
  advanced: [
    'ephemeral', 'ubiquitous', 'serendipity', 'mellifluous', 'ineffable',
    'quintessential', 'surreptitious', 'perfidious', 'loquacious', 'perspicacious',
    'magnanimous', 'ostentatious', 'vicissitude', 'pernicious', 'inexorable',
  ],
  expert: [
    'pulchritudinous', 'sesquipedalian', 'defenestration', 'pneumonoultramicroscopicsilicovolcanoconiosis',
    'floccinaucinihilipilification', 'antidisestablishmentarianism', 'supercalifragilisticexpialidocious',
    'hippopotomonstrosesquippedaliophobia', 'pseudopseudohypoparathyroidism',
  ],
};

export function getDailyWords(difficulty: keyof typeof wordPools, count: number = 5): string[] {
  const pool = wordPools[difficulty];
  const today = new Date().toISOString().split('T')[0];
  
  // Use date as seed for consistent daily words
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  
  const shuffled = [...pool].sort((a, b) => {
    const hashA = (a.charCodeAt(0) + seed) % pool.length;
    const hashB = (b.charCodeAt(0) + seed) % pool.length;
    return hashA - hashB;
  });
  
  return shuffled.slice(0, count);
}
