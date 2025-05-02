import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { deeplTranslate } from './deepl.js';
import { openaiTranslate } from './openai.js';
import { deepseekTranslate } from './deepseek.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve index.html at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve openai.html at /openai path
app.get('/openai', (req, res) => {
    res.sendFile(path.join(__dirname, 'openai.html'));
});

// Serve deepseek.html at /deepseek path
app.get('/deepseek', (req, res) => {
    res.sendFile(path.join(__dirname, 'deepseek.html'));
});

app.post('/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const result = await deeplTranslate(text, targetLang);
        res.json(result);
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/translate/openai', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const result = await openaiTranslate(text, targetLang);
        res.json(result);
    } catch (error) {
        console.error('OpenAI Translation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/translate/deepseek', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const result = await deepseekTranslate(text, targetLang);
        res.json(result);
    } catch (error) {
        console.error('DeepSeek Translation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 