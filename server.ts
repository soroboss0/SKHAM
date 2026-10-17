import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Audio Transcription Endpoint
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const ai = getGeminiClient();
    const cleanBase64 = audioData.includes('base64,')
      ? audioData.split('base64,')[1]
      : audioData;

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0] || 'audio/webm',
        data: cleanBase64,
      },
    };

    let transcriptText = '';
    try {
      // First attempt with gemini-3.5-transcribe
      const transcribeResponse = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: 'Transcribe this spoken dream recording verbatim. Capture every nuance, dream fragment, hesitation, and sentence as accurately as possible. Output only the transcription without commentary.',
            },
          ],
        },
      });
      transcriptText = transcribeResponse.text || '';
    } catch (transcribeErr: any) {
      console.warn('Transcription model fallback to gemini-3.8-flash:', transcribeErr?.message);
      // Fallback to gemini-3.8-flash multimodal audio processing
      const flashResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            audioPart,
            {
              text: 'Please listen to this audio recording of a dream and provide a clean, complete, verbatim transcription of what the speaker said.',
            },
          ],
        },
      });
      transcriptText = flashResponse.text || '';
    }

    res.json({ transcript: transcriptText.trim() });
  } catch (error: any) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to transcribe audio recording',
    });
  }
});

// 2. Structured Jungian Archetype & Dream Analysis Endpoint
app.post('/api/analyze-dream', async (req, res) => {
  try {
    const { transcript, wakingMood = 'Reflective', language = 'en' } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Dream transcript is required' });
    }

    const ai = getGeminiClient();

    const langInstruction = language === 'fr'
      ? 'IMPORTANT: All output values in the JSON (title, summary, coreEmotionalTheme, wakingMoodAnalysis, archetypes, shadowWork, symbols, individuationReflection, journalPrompt, suggestedSurrealistPrompt) MUST be eloquently written in French.'
      : 'All output values in the JSON should be written in English.';

    const prompt = `You are a world-renowned depth psychologist and Jungian dream analyst. Analyze the following raw dream recorded immediately upon waking.
Waking Mood noted by dreamer: "${wakingMood}"
Language requirement: ${langInstruction}
Dream Transcript:
"""
${transcript}
"""

Perform a deep, structured psychological interpretation grounded in recognized Jungian archetypes (e.g., The Shadow, The Anima/Animus, The Persona, The Self, The Trickster, The Great Mother, The Wise Old Man, The Threshold Guardian, Metamorphosis, The Labyrinth, The Devouring Water/Abyss, etc.).

Return a strictly valid JSON object matching this schema:
{
  "title": "Evocative, poetic dream title (e.g., 'The Obsidian Mirror and the Brass Clockwork')",
  "summary": "1 to 2 sentences summarizing the core narrative arc of the dream",
  "coreEmotionalTheme": "The core emotional theme and tension (e.g., 'A confrontation between conscious perfectionism and instinctual desire')",
  "wakingMoodAnalysis": "Insight into how their waking mood connects to the dream's psychic compensation",
  "archetypes": [
    {
      "name": "Archetype name (e.g. The Shadow, The Anima, The Persona, The Self)",
      "description": "Definition in depth psychology",
      "manifestation": "Exact element, character, or force representing it in this dream",
      "significance": "What this reveals regarding the dreamer's psychic balance",
      "weight": 85
    }
  ],
  "shadowWork": {
    "suppressedElement": "The unacknowledged or feared aspect seeking recognition",
    "wakingCompensation": "What waking attitude or belief is being challenged or balanced",
    "integrationAdvice": "Practical guidance for embracing and integrating this shadow energy"
  },
  "symbols": [
    {
      "symbol": "Specific object, figure, or setting (e.g., 'The Iron Key', 'The Rising Tide', 'The Faceless Watcher')",
      "archetype": "Associated archetype",
      "collectiveMeaning": "Universal mythological and collective unconscious meaning",
      "questionForDreamer": "A penetrating question for the dreamer to explore their personal association"
    }
  ],
  "individuationReflection": "A synthesis of how this dream relates to the dreamer's individuation process (becoming whole)",
  "journalPrompt": "A single profound waking contemplation or morning journaling question",
  "suggestedSurrealistPrompt": "A rich, vivid prompt to paint this dream's core emotional theme as a surrealist masterpiece (incorporating surreal juxtaposition, symbolic dream logic, atmospheric lighting, painterly texture, reminiscent of Salvador Dalí, René Magritte, or Leonora Carrington)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseErr) {
      // In case of markdown backticks or minor parsing anomaly
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Dream analysis error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze dream archetypes',
    });
  }
});

// 3. Surrealist Image Generation Endpoint
// Uses gemini-3-pro-image-preview as required, with affordance for 1K, 2K, 4K
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      imageSize = '1K', // '1K' | '2K' | '4K'
      aspectRatio = '1:1', // '1:1' | '16:9' | '4:3' | '9:16'
      surrealistStyle = 'dali', // 'dali' | 'magritte' | 'carrington' | 'chirico' | 'varo' | 'visionary'
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Image prompt is required' });
    }

    const ai = getGeminiClient();

    // Style prompt enrichment
    const styleModifiers: Record<string, string> = {
      dali: 'Surrealist oil painting in the style of Salvador Dalí. Melting distorted reality, vast desolate dream horizon, long dramatic shadows, hyper-detailed visionary dreamscape, mysterious psychological symbolism, fine classical glazing.',
      magritte: 'Surrealist composition in the enigmatic style of René Magritte. Poetic conceptual juxtaposition, crisp quiet daylight mixed with twilight mystery, uncanny ordinary objects in impossible relationships, contemplative elegance.',
      carrington: 'Mystical surrealist painting in the style of Leonora Carrington. Alchemical bestiary, nocturnal occult ritual, ethereal luminous pigments, Celtic mythological dream beasts, ancient esoteric dream-space.',
      chirico: 'Metaphysical surrealist painting in the style of Giorgio de Chirico. Melancholy empty Mediterranean piazza, stark geometric arcades, elongated late-afternoon shadows, silent enigmatic statues and train smoke in the distance.',
      varo: 'Visionary surrealist painting in the style of Remedios Varo. Delicate alchemical machinery, spinning threads of starlight, cloistered esoteric laboratory, luminous jewel tones, sacred quest for consciousness.',
      visionary: 'Surrealist fine art painting depicting the deep unconscious mind. Ethereal atmospheric glow, impossible oneiric architecture, floating symbolic elements, dream logic, museum-quality oil canvas texture.',
    };

    const chosenModifier = styleModifiers[surrealistStyle] || styleModifiers.dali;
    const finalPrompt = `Fine art surrealist masterpiece representing the core emotional theme of a dream: ${prompt}. ${chosenModifier}. Highly detailed, evocative, masterpiece quality, no watermark, no text.`;

    // Validate size: 1K, 2K, 4K
    const validSizes = ['1K', '2K', '4K'];
    const resolvedSize = validSizes.includes(imageSize) ? imageSize : '1K';
    const validAspectRatios = ['1:1', '16:9', '4:3', '9:16', '3:4'];
    const resolvedAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let imageUrl = '';
    let modelUsed = 'gemini-3-pro-image-preview';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: finalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: resolvedAspectRatio,
            imageSize: resolvedSize,
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (primaryErr: any) {
      console.warn('gemini-3-pro-image-preview failed, attempting fallback to gemini-3.1-flash-lite-image:', primaryErr?.message);
      modelUsed = 'gemini-3.1-flash-lite-image';

      // Fallback with gemini-3.1-flash-lite-image (does not take imageSize)
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: finalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: resolvedAspectRatio,
          },
        },
      });

      if (fallbackResponse.candidates?.[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error('No image was returned by the generative model');
    }

    res.json({
      imageUrl,
      modelUsed,
      imageSize: resolvedSize,
      aspectRatio: resolvedAspectRatio,
      surrealistStyle,
      promptUsed: finalPrompt,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate surrealist dream image',
    });
  }
});

// 4. Multi-Turn Symbol & Archetype Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages = [],
      dreamContext,
      model = 'gemini-3.8-flash', // 'gemini-3.8-flash' (general) | 'gemini-4-argon' (complex) | 'gemini-3.1-flash-lite' (fast)
      language = 'en',
    } = req.body;

    if (!messages.length) {
      return res.status(400).json({ error: 'Messages list is required' });
    }

    const ai = getGeminiClient();

    // Contextual system prompt for Jungian Analyst & Symbologist
    let systemInstruction = `You are Dr. Carl V. Sandman, an erudite, empathetic Jungian dream analyst and depth mythologist.
Your role is to help the dreamer explore the rich symbolic architecture of their dream through active imagination, archetypal psychology, and Socratic inquiry.
Tone: Warm, reflective, intellectually rich, poetic, and encouraging.
Never offer clinical diagnosis or psychiatric prescription; frame all insights through metaphor, personal associations, and archetypal motifs.
${language === 'fr' ? 'IMPORTANT: You must reply in French with elegance, psychological depth, and warm introspective vocabulary.' : 'Reply in English.'}

Dream Context:`;

    if (dreamContext) {
      systemInstruction += `
- Title: ${dreamContext.title || 'Untitled Dream'}
- Transcript: """${dreamContext.transcript || ''}"""
- Core Emotional Theme: ${dreamContext.coreEmotionalTheme || 'N/A'}
- Waking Mood: ${dreamContext.wakingMood || 'N/A'}
- Identified Archetypes: ${JSON.stringify(dreamContext.archetypes || [])}
- Extracted Symbols: ${JSON.stringify(dreamContext.symbols || [])}
- Shadow Work: ${JSON.stringify(dreamContext.shadowWork || {})}
`;
    } else {
      systemInstruction += `\nNo specific dream active; discuss dream symbolism and Jungian concepts generally.`;
    }

    systemInstruction += `
Instruction for follow-up questions:
1. Address the specific symbol, character, or sensation the user asks about.
2. Unpack both the collective/mythological archetype (Jung, Campbell) and prompt the user about their personal subjective history with that symbol.
3. Keep answers focused, engaging, using elegant formatting (bullet points, italics, key questions) without being overly verbose.`;

    // Map conversation history
    // Gemini SDK expects contents array with role: 'user' | 'model' and parts: [{ text }]
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Choose model from approved list
    const allowedModels = ['gemini-3.8-flash', 'gemini-4-argon', 'gemini-3.1-flash-lite'];
    const chosenModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

    const chatResponse = await ai.models.generateContent({
      model: chosenModel,
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = chatResponse.text || 'I find myself pondering that symbol in silence... Could you share more about the sensation you felt when you encountered it?';

    res.json({
      role: 'model',
      content: reply,
      modelUsed: chosenModel,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to process dream analysis chat',
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Oneiric server listening on port ${port}`);
});
