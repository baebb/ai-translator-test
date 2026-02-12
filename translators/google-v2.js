import { romanizeJapanese, detectLanguage } from '../utils.js';

const API_KEY = process.env.GOOGLE_TRANSLATION_API_KEY;
const API_URL = 'https://translation.googleapis.com/language/translate/v2';

export async function googleTranslate(text, targetLang) {
    const startTime = process.hrtime();
    
    try {
        // Handle auto language detection
        let finalTargetLang = targetLang;
        if (targetLang === 'AUTO') {
            const detectedLang = detectLanguage(text);
            finalTargetLang = detectedLang === 'EN' ? 'JA' : 'EN';
        }

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: finalTargetLang.toLowerCase(),
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const translation = data.data.translations[0].translatedText;

        // Add romanization if target language is Japanese or if source text is Japanese
        let romanization = null;
        if (finalTargetLang === 'JA') {
            romanization = await romanizeJapanese(translation);
        } else if (detectLanguage(text) === 'JA') {
            romanization = await romanizeJapanese(text);
        }

        const endTime = process.hrtime(startTime);
        const googleResponseTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));

        return {
            translation,
            responseTimeMs: googleResponseTimeMs,
            romanization
        };
    } catch (error) {
        console.error('Google Translation error:', error);
        throw new Error('Failed to translate text using Google Translation API');
    }
} 