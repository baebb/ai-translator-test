import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { romanizeJapanese } from './utils.js';

dotenv.config();

const API_KEY = process.env.DEEPL_API_KEY;
const API_URL = 'https://api-free.deepl.com/v2/translate';

export async function deeplTranslate(text, targetLang) {
    const params = new URLSearchParams();
    params.append('auth_key', API_KEY);
    params.append('text', text);
    params.append('target_lang', targetLang);
    params.append('formality', 'prefer_more');

    const startTime = process.hrtime();
    const response = await fetch(API_URL, {
        method: 'POST',
        body: params
    });
    const data = await response.json();
    const endTime = process.hrtime(startTime);
    const deeplResponseTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));

    // Add romanization if target language is Japanese
    let romanization = null;
    if (targetLang === 'JA') {
        romanization = await romanizeJapanese(data.translations[0].text);
    }

    return {
        ...data,
        deeplResponseTimeMs,
        romanization
    };
} 