import pkg from 'deepl-node';
const { Translator } = pkg;
import dotenv from 'dotenv';
import { romanizeJapanese, detectLanguage } from '../utils.js';

dotenv.config();

const API_KEY = process.env.DEEPL_API_KEY;
const translator = new Translator(API_KEY);

export async function deeplTranslate(text, targetLang) {
    // Handle auto language detection
    let finalTargetLang = targetLang;
    if (targetLang === 'AUTO') {
        const detectedLang = detectLanguage(text);
        finalTargetLang = detectedLang === 'EN' ? 'JA' : 'en-US';
    }

    const startTime = process.hrtime();
    const result = await translator.translateText(text, null, finalTargetLang, {
        formality: 'prefer_more'
    });
    const endTime = process.hrtime(startTime);
    const deeplResponseTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));

    // Add romanization if target language is Japanese or if source text is Japanese
    let romanization = null;
    if (finalTargetLang === 'JA') {
        romanization = await romanizeJapanese(result.text);
    } else if (detectLanguage(text) === 'JA') {
        romanization = await romanizeJapanese(text);
    }

    return {
        translations: [{ text: result.text }],
        deeplResponseTimeMs,
        romanization
    };
} 