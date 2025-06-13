import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import fs from 'fs'; // Node.js File System module
import path from 'path';
// We are using the dotenv package to securely load your API keys from the .env file
import 'dotenv/config'; 

const app = express();
const port = 3001;

// --- API KEYS are now securely loaded from your .env file ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_REPLICA_ID = process.env.TAVUS_REPLICA_ID;
// -------------------------------------------------------------

// Initialize OpenAI Client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const loadKnowledgeBase = async () => {
  const knowledgeDir = path.join(process.cwd(), 'knowledge_base');
  let combinedText = '';
  try {
    const files = await fs.promises.readdir(knowledgeDir);
    for (const file of files) {
      const filePath = path.join(knowledgeDir, file);
      console.log(`Processing file: ${file}`);
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        combinedText += content + '\n\n';
      }
    }
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return "No knowledge base found.";
  }
  return combinedText;
};

const generateTavusVideo = async (script, backgroundUrl = null) => {
    console.log(`Sending script to Tavus. Background: ${backgroundUrl || 'default'}`);
    const payload = { replica_id: TAVUS_REPLICA_ID, script: script };
    if (backgroundUrl) {
      payload.background_image_url = backgroundUrl;
    }
    const initialTavusResponse = await fetch('https://api.tavus.io/v2/videos', {
        method: 'POST',
        headers: { 'x-api-key': TAVUS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!initialTavusResponse.ok) {
      const errorBody = await initialTavusResponse.text();
      throw new Error(`Tavus API failed to start video generation: ${errorBody}`);
    }
    let videoData = await initialTavusResponse.json();
    while (videoData.status !== 'ready') {
        console.log(`Polling Tavus... (Status: ${videoData.status})`);
        await sleep(4000);
        const statusCheckResponse = await fetch(`https://api.tavus.io/v2/videos/${videoData.id}`, { headers: { 'x-api-key': TAVUS_API_KEY }});
        if (!statusCheckResponse.ok) throw new Error('Tavus status check failed');
        videoData = await statusCheckResponse.json();
    }
    console.log("✅ Tavus video is ready.");
    return videoData;
};

app.get('/', (req, res) => {
  res.send('✅ Diane Digital Backend is running!');
});

app.get('/api/welcome', async (req, res) => {
    try {
        const welcomeText = "¡Hola! Soy Diane Digital. Bienvenida a nuestro espacio. Estoy aquí para ayudarte a responder cualquier pregunta que tengas sobre cómo manejar la prediabetes y diabetes con un enfoque en nutrición y bienestar. ¿En qué te puedo ayudar hoy?";
        const videoData = await generateTavusVideo(welcomeText);
        res.json({ text: welcomeText, videoUrl: videoData.stream_url });
    } catch (error) {
        console.error("API Error in /welcome:", error.message);
        res.status(500).json({ error: "Failed to create welcome message." });
    }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const lowerCaseMessage = message.toLowerCase();
  let aiTextResponse = '';
  let backgroundUrl = null;
  if (lowerCaseMessage.includes('nutrición') || lowerCaseMessage.includes('nutrition') || lowerCaseMessage.includes('food') || lowerCaseMessage.includes('comida')) {
    backgroundUrl = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';
  } else if (lowerCaseMessage.includes('mindset') || lowerCaseMessage.includes('support') || lowerCaseMessage.includes('estrés') || lowerCaseMessage.includes('ayuda')) {
    backgroundUrl = 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg';
  }
  try {
    if (lowerCaseMessage.includes('chatgpt')) {
        aiTextResponse = "Our avatar only speaks from verified company content, admits when it doesn't know something, and seamlessly hands off to humans when needed.";
    } else if (lowerCaseMessage.includes('hallucination')) {
        aiTextResponse = "We've eliminated hallucinations by design - the avatar can only reference actual content from our knowledge base, never invents information.";
    } else if (lowerCaseMessage.includes('privacy') || lowerCaseMessage.includes('privacidad')) {
        aiTextResponse = "We ensure privacy with end-to-end encryption, clear data retention policies, and user control over all their data - they can delete everything with one click.";
    } else {
        const knowledgeBase = await loadKnowledgeBase();
        const systemPrompt = `You are Diane Digital, a helpful AI assistant. You will be given a question from a user and a knowledge base of text to use for context. Your task is to answer the user's question based ONLY on the provided knowledge base. - Do NOT use any external knowledge. - If the answer is not found in the knowledge base, you MUST respond with: "Lo siento, no tengo información sobre ese tema en mi base de conocimiento. ¿Hay algo más en lo que te pueda ayudar?" - Answer in the same language as the user's question.`;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Knowledge Base:\n---\n${knowledgeBase}\n---\n\nQuestion: ${message}` }
            ],
        });
        aiTextResponse = completion.choices[0].message.content;
    }
    const videoData = await generateTavusVideo(aiTextResponse, backgroundUrl);
    res.json({ text: aiTextResponse, videoUrl: videoData.stream_url });
  } catch (error) {
    console.error("API Error in /chat:", error.message);
    res.status(500).json({ error: "Failed to process request." });
  }
});

app.listen(port, () => {
  console.log(`✅ Final server is running on http://localhost:${port}`);
});
