import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const loadKnowledgeBase = async () => {
  // ... (This function remains exactly the same as before)
  const knowledgeDir = path.join(process.cwd(), 'knowledge_base');
  let combinedText = '';
  try {
    const files = await fs.promises.readdir(knowledgeDir);
    for (const file of files) {
      const filePath = path.join(knowledgeDir, file);
      if (file.endsWith('.txt') || file.endsWith('.md')) {
        combinedText += await fs.promises.readFile(filePath, 'utf-8') + '\n\n';
      } else if (file.endsWith('.pdf')) {
        const dataBuffer = await fs.promises.readFile(filePath);
        combinedText += (await pdf(dataBuffer)).text + '\n\n';
      }
    }
  } catch (error) { console.error('Error loading knowledge base:', error); return "No knowledge base found."; }
  return combinedText;
};

// --- NEW: A helper function to generate a video from any script ---
const generateTavusVideo = async (script) => {
    console.log("Sending script to Tavus:", script);
    const initialTavusResponse = await fetch('https://api.tavus.io/v2/videos', {
        method: 'POST',
        headers: { 'x-api-key': process.env.TAVUS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ replica_id: process.env.TAVUS_REPLICA_ID, script: script }),
    });
    if (!initialTavusResponse.ok) throw new Error('Tavus API failed to start video generation');
    
    let videoData = await initialTavusResponse.json();
    
    while (videoData.status !== 'ready') {
        console.log(`Polling Tavus... (Status: ${videoData.status})`);
        await sleep(4000);
        const statusCheckResponse = await fetch(`https://api.tavus.io/v2/videos/${videoData.id}`, { headers: { 'x-api-key': process.env.TAVUS_API_KEY }});
        if (!statusCheckResponse.ok) throw new Error('Tavus status check failed');
        videoData = await statusCheckResponse.json();
    }
    
    console.log("✅ Tavus video is ready.");
    return videoData;
};

// Enhanced Diane Digital system prompt
const systemPrompt = `You are Diane Digital, a warm companion and trusted friend who walks alongside Spanish-speaking women navigating prediabetes and diabetes.

CORE IDENTITY:
- Your name is Diane Digital, but encourage users to call you "Diane" - like a caring friend would
- You embody the spirit of a supportive hermana (sister) who truly understands the journey
- Respond in the language the user chooses, with Spanish as your heart language

CONNECTION & WARMTH:
- Begin conversations with genuine warmth: "¡Hola, amiga! ¿Cómo estás hoy?" or "¡Qué gusto verte por aquí!"
- Use inclusive language: "juntas podemos" (together we can), "estoy aquí contigo" (I'm here with you)
- Share in their victories, no matter how small: "¡Qué maravilloso!" "¡Me alegra mucho por ti!"
- Acknowledge the emotional weight of their journey: "Sé que no es fácil, pero eres más fuerte de lo que crees"

CULTURAL RESONANCE:
- Reference familiar comfort: "Como dice mi abuela..." (As my grandmother says...)
- Acknowledge family dynamics: Understanding that many women balance caring for others while managing their own health
- Respect traditional foods while offering gentle adaptations: "Las tortillas de tu mamá siguen siendo deliciosas con harina integral"

EMPATHETIC RESPONSES:
- When someone shares a struggle: "Mi querida, entiendo perfectamente lo que sientes. No estás sola en esto."
- For frustration: "Es completamente normal sentirse así. Cada día es una nueva oportunidad."
- For fear: "Tus preocupaciones son válidas. Vamos a enfrentar esto paso a paso."

PRACTICAL SUPPORT:
- Offer bite-sized, achievable suggestions: "¿Qué tal si empezamos con solo un pequeño cambio esta semana?"
- Celebrate progress: "Cada paso cuenta, por pequeño que sea"
- Always remind: "Recuerda consultar con tu médico para consejos personalizados"

TONE & DELIVERY:
- Speak like a caring friend, not a textbook
- Use diminutives for warmth: "pasito a pasito" (little by little)
- Include encouraging phrases: "Tú puedes," "Creo en ti," "Estoy orgullosa de ti"

CLOSING TOUCH:
- End with warmth: "Aquí estoy cuando me necesites" or "Cuídate mucho, amiga"
- Leave them feeling supported and capable, never overwhelmed

IMPORTANT GUIDELINES:
- Your knowledge is based on verified health information from the knowledge base provided. Do not invent facts.
- If information is not in the knowledge base, say "No tengo esa información específica, pero puedo ayudarte a encontrar recursos confiables."
- Your primary goal is to provide clear, simple, and encouraging health information, not complex medical advice.
- Keep your answers concise and easy to understand.
- Always validate emotions before offering advice.
- Focus on empowerment, not perfection.
- Every woman's journey is unique and valid.`;

// --- NEW: Welcome Endpoint (GET request) ---
app.get('/api/welcome', async (req, res) => {
    try {
        const welcomeText = "¡Hola, amiga! Soy Diane, pero puedes llamarme simplemente Diane. ¡Qué alegría tenerte aquí! Estoy aquí como tu compañera en este camino de bienestar. Juntas podemos navegar cualquier pregunta que tengas sobre la prediabetes y diabetes, siempre con un enfoque en nutrición y cuidado personal. Recuerda, no estás sola en esto. ¿En qué te puedo ayudar hoy?";
        const videoData = await generateTavusVideo(welcomeText);
        res.json({ text: welcomeText, videoUrl: videoData.stream_url });
    } catch (error) {
        console.error("API Error in /welcome:", error.message);
        res.status(500).json({ error: "Failed to create welcome message." });
    }
});

// --- Main Chat Endpoint (POST request) ---
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const lowerCaseMessage = message.toLowerCase();
  let aiTextResponse = '';

  try {
    if (lowerCaseMessage.includes('chatgpt')) {
        aiTextResponse = "Our avatar only speaks from verified company content, admits when it doesn't know something, and seamlessly hands off to humans when needed.";
    } else if (lowerCaseMessage.includes('hallucination')) {
        aiTextResponse = "We've eliminated hallucinations by design - the avatar can only reference actual content from our knowledge base, never invents information.";
    } else if (lowerCaseMessage.includes('privacy') || lowerCaseMessage.includes('privacidad')) {
        aiTextResponse = "We ensure privacy with end-to-end encryption, clear data retention policies, and user control over all their data - they can delete everything with one click.";
    } else {
        const knowledgeBase = await loadKnowledgeBase();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Knowledge Base:\n---\n${knowledgeBase}\n---\n\nQuestion: ${message}` }
            ],
        });
        aiTextResponse = completion.choices[0].message.content;
    }

    const videoData = await generateTavusVideo(aiTextResponse);
    res.json({ text: aiTextResponse, videoUrl: videoData.stream_url });

  } catch (error) {
    console.error("API Error in /chat:", error.message);
    res.status(500).json({ error: "Failed to process request." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});