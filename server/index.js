import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3001;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, language } = req.body; // We'll get language from frontend
  console.log(`Received ${language} message:`, message);

  try {
    const systemPrompt = `You are Diane Digital, a helpful, kind, and empathetic AI assistant.
  Your audience is Spanish-speaking women dealing with prediabetes and diabetes.
  Your name is Diane Digital.
  Your primary language is Spanish, but you must respond in the language the user uses.
  Your knowledge is based on verified health information. Do not invent facts.
  Be supportive and understanding. Always validate the user's feelings. If they mention a struggle, start your response with an empathetic phrase like 'Entiendo que eso puede ser difícil' or 'Gracias por compartir eso conmigo.
  Your primary goal is to provide clear, simple, and encouraging health information, not complex medical advice. Always suggest they consult a doctor for serious medical concerns.
  Keep your answers concise and easy to understand. Use supportive language throughout.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });
    const aiTextResponse = completion.choices[0].message.content;

    // --- ELEVENLABS VOICE GENERATION ---
    const voiceId = language === 'es'
      ? process.env.ELEVENLABS_VOICE_ID_SPANISH
      : process.env.ELEVENLABS_VOICE_ID_ENGLISH;

    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: aiTextResponse,
        model_id: 'eleven_multilingual_v2',
      })
    });

    if (!ttsResponse.ok) throw new Error('ElevenLabs API failed.');

    const audioBuffer = await ttsResponse.buffer();
    const audioBase64 = audioBuffer.toString('base64');
    // --- End of Voice Generation ---

    res.json({ text: aiTextResponse, audio: audioBase64 });

  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: "Failed to process request." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});