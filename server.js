import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const API_KEY = process.env.DEEPL_API_KEY;
const API_URL = 'https://api-free.deepl.com/v2/translate';

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

// Serve index.html at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        
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

        // Add romanization if target language is Japanese and Kuroshiro is initialized
        let romanization = null;
        if (targetLang === 'JA' && kuroshiroInitialized) {
            try {
                romanization = await kuroshiro.convert(data.translations[0].text, {
                    to: 'romaji',
                    mode: 'spaced'
                });
            } catch (error) {
                console.error('Romanization error:', error);
            }
        }

        res.json({
            ...data,
            deeplResponseTimeMs,
            romanization
        });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 