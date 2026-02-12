import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { deeplTranslate } from './translators/deepl.js';
import { openaiTranslate } from './translators/openai.js';
import { deepseekTranslate } from './translators/deepseek.js';
import { googleTranslate } from './translators/google-v2.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve index.html at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Redirect old individual translator routes to unified template
app.get('/deepl', (req, res) => {
    res.redirect('/translator.html?service=deepl');
});

app.get('/openai', (req, res) => {
    res.redirect('/translator.html?service=openai');
});

app.get('/deepseek', (req, res) => {
    res.redirect('/translator.html?service=deepseek');
});

app.get('/google-v2', (req, res) => {
    res.redirect('/translator.html?service=google-v2');
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

app.post('/translate/google-v2', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const result = await googleTranslate(text, targetLang);
        res.json(result);
    } catch (error) {
        console.error('Google Translation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 