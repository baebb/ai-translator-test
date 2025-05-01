import OpenAI from 'openai';
import dotenv from 'dotenv';
import { romanizeJapanese } from './utils.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function openaiTranslate(text, targetLang) {
    const startTime = process.hrtime();
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: `You are a professional translator. Translate the following text to ${targetLang}. Only respond with the translation, no explanations or additional text.`
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

    // Add romanization if target language is Japanese
    let romanization = null;
    if (targetLang === 'Japanese') {
        romanization = await romanizeJapanese(translation);
    }

    return {
        translation,
        openaiResponseTimeMs,
        romanization
    };
} 