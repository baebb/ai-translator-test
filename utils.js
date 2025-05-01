import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// Initialize Kuroshiro
const kuroshiro = new Kuroshiro();
let kuroshiroInitialized = false;

// Initialize Kuroshiro with Kuromoji analyzer
(async () => {
    try {
        const analyzer = new KuromojiAnalyzer();
        await kuroshiro.init(analyzer);
        kuroshiroInitialized = true;
    } catch (error) {
        console.error('Failed to initialize Kuroshiro:', error);
    }
})();

/**
 * Detects if the given text is primarily English or Japanese
 * @param {string} text - The text to analyze
 * @returns {string} - Returns 'EN' for English or 'JA' for Japanese
 */
export function detectLanguage(text) {
    if (!text || typeof text !== 'string') {
        return 'EN';
    }

    // Regular expressions for character detection
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g; // Hiragana, Katakana, Kanji
    const englishRegex = /[a-zA-Z]/g;

    // Count Japanese and English characters
    const japaneseChars = (text.match(japaneseRegex) || []).length;
    const englishChars = (text.match(englishRegex) || []).length;

    // If no characters of either type are found, default to English
    if (japaneseChars === 0 && englishChars === 0) {
        return 'EN';
    }

    // Give Japanese characters more weight (approximately 3x) since they carry more meaning per character
    const weightedJapaneseChars = japaneseChars * 2;
    const totalWeightedChars = weightedJapaneseChars + englishChars;
    
    // Calculate weighted ratios
    const japaneseRatio = weightedJapaneseChars / totalWeightedChars;
    const englishRatio = englishChars / totalWeightedChars;

    // Return JA if weighted Japanese ratio is higher, otherwise return EN
    return japaneseRatio > englishRatio ? 'JA' : 'EN';
}

/**
 * Converts Japanese text to romaji
 * @param {string} text - The Japanese text to convert
 * @returns {Promise<string|null>} - Returns the romanized text or null if conversion fails
 */
export async function romanizeJapanese(text) {
    if (!text || !kuroshiroInitialized) {
        return null;
    }

    try {
        return await kuroshiro.convert(text, {
            to: 'romaji',
            mode: 'spaced'
        });
    } catch (error) {
        console.error('Romanization error:', error);
        return null;
    }
} 