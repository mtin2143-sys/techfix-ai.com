import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of Gemini as instructed
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI features might fail.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON bodies
  app.use(express.json());

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API 2: Hardware / System Diagnose Endpoint
  app.post("/api/pc/diagnose", async (req, res) => {
    try {
      const { prompt, deviceType, errorCodes, contextHistory } = req.body;
      const ai = getGeminiClient();

      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          mocked: true,
          error: "GEMINI_API_KEY eksik. Önizleme modu aktif.",
          possibleCauses: [
            "Güç kaynağı (PSU) arızalı veya bağlantıları gevşek olabilir.",
            "RAM modülleri oksitlenmiş veya yuvasına tam oturmamış olabilir.",
            "Isınma kaynaklı termal koruma sistemi devreye giriyor olabilir."
          ],
          onlineRescueSteps: [
            "BIOS ayarlarını varsayılana ('Load Optimized Defaults') sıfırlayın.",
            "Güvenli Mod üzerinden ekran kartı sürücülerini DDU ile kaldırıp temiz kurulum yapın."
          ],
          offlineRescueSteps: [
            "Statik elektriği boşaltmak için güç kablosunu çekip açma düğmesine 30 saniye basılı tutun.",
            "RAM modüllerini söküp, sarı uçlarını yumuşak bir silgiyle temizleyip tekrar takın."
          ],
          powershellScript: `Write-Host "Sistem Dosya Kontrolü Başlatılıyor..."\nsfc /scannow\nWrite-Host "Disk Hataları Taranıyor..."\nchkdsk C: /f /r`,
          technicalReport: "Detaylı analiz için lütfen geçerli bir Gemini API Anahtarı tanımlayın."
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `PC Tamir ve Teşhis İstemi.
Kullanıcı Cihaz Tipi: ${deviceType || "Bilinmiyor"}
Hata / Belirti Tanımı: "${prompt}"
Varsa Alınan Hata Kodları: ${errorCodes || "Yok"}

Göreviniz, profesyonel bir bilgisayar donanım ve yazılım teknisyeni olarak bu sorunu teşhis etmektir. Yanıtı mutlaka Türkçe ve JSON yapısında vermelisiniz.

Döneceğiniz JSON formatının şeması şudur:
{
  "possibleCauses": [ "olası sebep 1", "olası sebep 2", ... ],
  "onlineRescueSteps": [ "online / internet bağlantılı veya canlı müdahale adımı 1", ... ],
  "offlineRescueSteps": [ "fiziksel / internet dökümanı / offline müdahale adımı 1", ... ],
  "powershellScript": "Sorunun tespiti ya da onarımı için kullanılabilecek Windows PowerShell veya terminal komutları / scripti",
  "technicalReport": "Teknisyen analiz raporu ve önerileri."
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              possibleCauses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Olası donanım veya yazılım hata nedenleri"
              },
              onlineRescueSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Online müdahale, uzak bağlantı veya sürücü güncelleme adımları"
              },
              offlineRescueSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Fiziksel sök-tak, statik elektrik alma veya BIOS gibi internet dışı müdahale adımları"
              },
              powershellScript: {
                type: Type.STRING,
                description: "Tek tıkla çalıştırılabilecek sorun giderici script veya CLI komut grubu"
              },
              technicalReport: {
                type: Type.STRING,
                description: "Uzman teknisyen teknik analizi ve ek güvenlik yönergeleri"
              }
            },
            required: ["possibleCauses", "onlineRescueSteps", "offlineRescueSteps", "powershellScript", "technicalReport"]
          }
        }
      });

      const dataText = response.text || "{}";
      res.json(JSON.parse(dataText));
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Teşhis işlemi sırasında bir sorun oluştu", details: err.message });
    }
  });

  // API 3: AI Agent Builder & Chat Interface
  app.post("/api/agent/run", async (req, res) => {
    try {
      const { agentConfig, message, history } = req.body;
      const ai = getGeminiClient();

      if (!message) {
        return res.status(400).json({ error: "Mesaj parametresi zorunludur" });
      }

      const activeConfig = agentConfig || {
        name: "Yapay Zeka Yardımcısı",
        systemInstruction: "Sen bilgisayarlar konusunda uzman pratik bir yapay zeka ajanısın.",
        temperature: 0.7,
        type: "general"
      };

      if (!process.env.GEMINI_API_KEY) {
        // Soft fallback for testing
        return res.json({
          text: `[Uyanık Ajan Çevrimdışı Önizleme - ${activeConfig.name}]: "${message}" sorunuza cevaben, bu ajan şu yönergeyle yapılandırılmıştı: "${activeConfig.systemInstruction}". Bu bir önizleme yanıtıdır çünkü GEMINI_API_KEY tanımlanmamış. Ancak bu ajanın yapay zeka kişiliği başarıyla oluşturuldu!`,
          mocked: true
        });
      }

      // Build history for conversational memory
      const contentsList: any[] = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contentsList.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content || msg.text }]
          });
        }
      }
      // Add existing message
      contentsList.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: activeConfig.systemInstruction,
          temperature: parseFloat(activeConfig.temperature) || 0.7,
        }
      });

      res.json({
        text: response.text || "Herhangi bir yanıt üretilemedi."
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Yapay Zeka ajanı yanıt üretemedi", details: err.message });
    }
  });

  // Vite development or production routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
