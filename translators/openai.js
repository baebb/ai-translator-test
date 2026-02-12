import OpenAI from 'openai';
import dotenv from 'dotenv';
import { romanizeJapanese, detectLanguage } from '../utils.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Map language codes to full names for OpenAI
const languageMap = {
    'JA': 'Japanese',
    'EN': 'English',
    'DE': 'German',
    'FR': 'French',
    'ES': 'Spanish',
    'IT': 'Italian',
    'ZH': 'Chinese'
};

export async function openaiTranslate(text, targetLang) {
    // Handle auto language detection
    let finalTargetLang = targetLang;
    if (targetLang === 'AUTO') {
        const detectedLang = detectLanguage(text);
        finalTargetLang = detectedLang === 'EN' ? 'JA' : 'EN';
    }

    const targetLanguageName = languageMap[finalTargetLang] || finalTargetLang;

    const startTime = process.hrtime();
    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
            {
                role: "system",
                content: `You are a professional translator. 
Translate the following text to ${targetLanguageName}. 
Prefer to use common words and phrases and slightly more polite language. 
Only output the translation, no explanations.`
            },
            {
                role: "user",
                content: text
            }
        ],
        temperature: 0.3,
    });
    const endTime = process.hrtime(startTime);
    const openaiResponseTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));

    const translation = completion.choices[0].message.content;

    // Add romanization if target language is Japanese or if source text is Japanese
    let romanization = null;
    if (finalTargetLang === 'JA') {
        romanization = await romanizeJapanese(translation);
    } else if (detectLanguage(text) === 'JA') {
        romanization = await romanizeJapanese(text);
    }

    return {
        translation,
        responseTimeMs: openaiResponseTimeMs,
        romanization
    };
} 