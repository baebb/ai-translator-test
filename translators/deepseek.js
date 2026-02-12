import { detectLanguage, romanizeJapanese } from '../utils.js';

export async function deepseekTranslate(text, targetLang) {
    const startTime = Date.now();
    
    try {
        // Detect source language if AUTO is selected
        const sourceLang = targetLang === 'AUTO' ? await detectLanguage(text) : null;
        const finalTargetLang = targetLang === 'AUTO' 
            ? (sourceLang === 'JA' ? 'English' : 'Japanese')
            : targetLang;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator.
Translate the following text to ${finalTargetLang}.
Prefer to use common words and phrases and slightly more polite language. 
Only output the translation, no explanations.`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Translation failed');
        }

        const data = await response.json();
        const translation = data.choices[0].message.content.trim();

        // Get romanization for Japanese text
        let romanization = null;
        if (finalTargetLang === 'Japanese') {
            romanization = await romanizeJapanese(translation);
        } else if (sourceLang === 'JA') {
            romanization = await romanizeJapanese(text);
        }

        const endTime = Date.now();
        return {
            translation,
            responseTimeMs: endTime - startTime,
            romanization
        };
    } catch (error) {
        console.error('DeepSeek translation error:', error);
        throw error;
    }
} 