import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Routes
  app.post("/api/ai/analyze-pdf", async (req, res) => {
    try {
      const { text, fileName } = req.body;
      
      const prompt = `Você é um tutor especializado no concurso do CAU/SP (Conselho de Arquitetura e Urbanismo de São Paulo).
      Analise o seguinte conteúdo extraído de um PDF intitulado "${fileName}":
      
      "${text}"
      
      Gere:
      1. Um resumo estruturado e profissional.
      2. Uma lista de tópicos mais importantes para o concurso.
      3. 5 flashcards (pergunta e resposta).
      
      Retorne o resultado em formato JSON estrito.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["summary", "topics", "flashcards"]
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "Falha ao analisar conteúdo." });
    }
  });

  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { text, subject } = req.body;
      
      const prompt = `Gere um quiz com 5 questões sobre o assunto "${subject}" baseado no conteúdo: "${text}".
      As questões devem ser de nível concurso público, variando entre múltipla escolha e verdadeiro/falso.
      Inclua uma explicação detalhada para cada resposta.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["multiple-choice", "true-false"] },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "type", "correctAnswer", "explanation"]
            }
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("Quiz Generation Error:", error);
      res.status(500).json({ error: "Falha ao gerar quiz." });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "Você é o Tutor IA do EstudaCAU. Seu objetivo é ajudar alunos a passarem no concurso do CAU/SP. Seja didático, motivador e focado no edital."
        }
      });

      const lastMessage = messages[messages.length - 1].content;
      const response = await chat.sendMessage({ message: lastMessage });
      
      res.json({ text: response.text });
    } catch (error) {
      console.error("Chat Error:", error);
      res.status(500).json({ error: "Falha na comunicação com o tutor." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
