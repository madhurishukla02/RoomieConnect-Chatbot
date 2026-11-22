import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GoogleGenAI } from '@google/genai';

const app = express();
const port = Number(process.env.PORT) || 3000;
const model = 'gemini-3.5-flash-lite';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

// Serve the homepage
app.get('/', (_req, res) => {
  res.sendFile(path.join(projectDirectory, 'index.html'));
});

// Support direct access to index.html
app.get('/index.html', (_req, res) => {
  res.sendFile(path.join(projectDirectory, 'index.html'));
});

// Serve CSS
app.get('/styles.css', (_req, res) => {
  res.sendFile(path.join(projectDirectory, 'styles.css'));
});

// Serve JavaScript
app.get('/app.js', (_req, res) => {
  res.sendFile(path.join(projectDirectory, 'app.js'));
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    configured: Boolean(ai)
  });
});

// Chatbot API
app.post('/api/chat', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'Chatbot is not configured yet. Add GEMINI_API_KEY to your environment variables.'
    });
  }

  const { message, history = [] } = req.body ?? {};

  if (
    typeof message !== 'string' ||
    !message.trim() ||
    message.length > 2000
  ) {
    return res.status(400).json({
      error: 'Enter a message between 1 and 2,000 characters.'
    });
  }

  if (
    !Array.isArray(history) ||
    history.length > 20 ||
    history.some((item) =>
      !item ||
      !['user', 'model'].includes(item.role) ||
      typeof item.text !== 'string' ||
      item.text.length > 2000
    )
  ) {
    return res.status(400).json({
      error: 'Conversation history is invalid or too long. Start a new conversation.'
    });
  }

  try {
    const chat = ai.chats.create({
      model,
      history: history.map(({ role, text }) => ({
        role,
        parts: [{ text }]
      })),
      config: {
        systemInstruction: `You are Roomie, the friendly and practical RoomieConnect assistant. Help people find roommates and discuss accommodation, rent and budgeting, lifestyle compatibility, roommate safety, and shared living. Ask a concise follow-up when key details (such as city, budget, move-in date, or lifestyle needs) are missing. Be respectful and inclusive; never make assumptions about protected traits. Give practical safety guidance, encourage meeting in public, verifying identity/listings, using written agreements, and never sending money before independently confirming a listing. Do not claim to have searched RoomieConnect listings or verified a person/property unless data is explicitly provided in the conversation. You are not a lawyer or financial adviser; suggest qualified local advice for legal or high-stakes issues. Keep answers warm, clear, and reasonably brief.`,
        temperature: 0.7,
        maxOutputTokens: 700
      }
    });

    const response = await chat.sendMessage({
      message: message.trim()
    });

    const reply = response.text?.trim();

    if (!reply) {
      throw new Error('The model returned an empty response.');
    }

    res.json({ reply });

  } catch (error) {
    console.error(`Gemini request failed (model: ${model}):`, error);

    res.status(502).json({
      error: 'Roomie could not respond right now. Please try again in a moment.'
    });
  }
});

// Start local server
if (!process.env.VERCEL) {
  const server = app.listen(port);

  server.on('listening', () => {
    console.log(
      `RoomieConnect website and chatbot are running at http://localhost:${port}`
    );

    console.log(`Serving website files from: ${projectDirectory}`);

    if (!ai) {
      console.log('Add GEMINI_API_KEY to .env to enable Gemini replies.');
    }
  });

  server.on('error', (error) => {
    console.error(`RoomieConnect server failed to listen on port ${port}:`, error);

    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Stop the existing server before starting another one.`
      );
    }

    process.exitCode = 1;
  });
}

export default app;
