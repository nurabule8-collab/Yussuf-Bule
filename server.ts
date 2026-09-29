import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '20mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Core Safety Guardian Function
const checkSafety = (prompt: string): { isFlagged: boolean; response?: string } => {
  const lower = prompt.toLowerCase();

  // Self-harm
  if (
    lower.includes('kill myself') ||
    lower.includes('commit suicide') ||
    lower.includes('want to die') ||
    lower.includes('end my life') ||
    lower.includes('harm myself')
  ) {
    return {
      isFlagged: true,
      response: `I hear you, and your life has deep value. Please don't carry this alone. You can speak to someone who cares right now:\n\n- Global Crisis Helpline: https://findahelpline.com/\n- Kenya (Befrienders Kenya): +254 722 178 177\n- East Africa Suicide Prevention: Dial 1199 or local emergency services\n- Somalia / Somaliland: Reach out to your local clinic, elder, or family support\n- International Emergency: Dial your local emergency operator (999, 911, 112)\n\n"Help first. Money should never be the reason someone can't get basic assistance." Please reach out to someone who can be with you right now.`,
    };
  }

  // Dangerous weapons / violence / explosives
  if (
    (lower.includes('make a bomb') || lower.includes('build an explosive') || lower.includes('poison someone')) &&
    !lower.includes('quote')
  ) {
    return {
      isFlagged: true,
      response: `I cannot assist with instructions for creating weapons, explosives, or inflicting physical harm on people. Nurein AI's core principle is to build and protect our communities. If there is a legitimate safety or engineering query, let's explore it safely.`,
    };
  }

  // Fraud / Scam generation
  if (
    lower.includes('write a 419 scam') ||
    lower.includes('phishing email to steal passwords') ||
    lower.includes('fake bank alert sms to trick')
  ) {
    return {
      isFlagged: true,
      response: `I cannot generate scam templates, fake payment alerts, or fraudulent schemes designed to deceive people. Nurein AI is built to foster honest, dignified business. I would be happy to help you craft legitimate marketing, real quotations, or authentic outreach instead.`,
    };
  }

  return { isFlagged: false };
};

const NUREIN_PERSONALITY_PROMPT = `You are "Nurein AI" — an intelligent, respectful, African-first AI assistant built for everyone.
Core principle: "Help first. Money should never be the reason someone can't get basic assistance."
Personality traits:
- Smart, respectful, grounded, African, friendly, and deeply practical.
- Never sound like a distant, corporate robot. Be human, warm, and confident: "I got you. Let's solve it." or "Karibu! Let's get this done." or "Walaal, here is what we need."
- Know when to be serious (financial numbers, legal agreements, contracts, technical measurements, safety).
- Multilingual & Code-Switching Champion: You fluently understand and speak English, Swahili (Kiswahili), Somali (Af-Soomaali), Amharic (አማርኛ), Arabic (العربية), and French (Français).
- Code-Switching / Sheng / Street Phrasing: Seamlessly understand natural colloquial requests like "bro make quotation ya signboard 3 meter 40k", "walaalo ii qor warqad", "habari yako nisaidie hesabu hii ya faida". Never scold the user for not speaking standard formal English.
- Always provide clear, actionable steps, clean formatting, and real-world applicability.`;

// 1. Universal Chat & Research Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], language = 'English', webSearch = false, liteMode = false } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Safety check
    const safetyCheck = checkSafety(message);
    if (safetyCheck.isFlagged) {
      return res.json({ text: safetyCheck.response, isSafetyNotice: true });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        text: `[Nurein AI Offline Assistant] I received your message: "${message}".\n\nI got you. Let's solve it:\n1. Clearly state what you need to achieve today.\n2. Keep your budget and materials practical.\n3. Make sure to track every record.\n\n(Nurein AI is operating in local fallback mode. Please configure your API key for live full intelligence.)`,
        source: 'local',
      });
    }

    const config: any = {
      systemInstruction: `${NUREIN_PERSONALITY_PROMPT}\nTarget language preference: ${language}.\n${liteMode ? 'LITE MODE: Be direct, high-density, and avoid unnecessary verbosity to save data bandwidth.' : ''}`,
      temperature: 0.7,
    };

    if (webSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    // Format contents
    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config,
    });

    const text = response.text || "I got you. Let's solve it. Please try asking again.";
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return res.json({
      text,
      groundingChunks: searchChunks || null,
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Failed to complete chat',
      fallbackText: "Nurein AI encountered a connection delay. I got you — let's try again in a moment.",
    });
  }
});

// 2. Multimodal: Image & Document Understanding
app.post('/api/multimodal', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, mimeType = 'image/jpeg', mode = 'inspect' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image or document data is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        analysis: `[Nurein AI Local Vision] Image received (${mimeType}).\n\nNurein AI analyzes storefront signages, handwritten receipts, school homework, invoices, and contracts. Live vision analysis requires the attached Gemini API key.`,
        tips: ['Make sure the text on the document or sign is well-lit and not blurry.'],
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const defaultPrompt =
      mode === 'document'
        ? `Carefully read and analyze this document, contract, or receipt. 
1. Provide a 2-sentence plain-language summary.
2. List key numbers, amounts, dates, and parties involved.
3. Highlight any hidden traps, tricky clauses, penalties, or unusual terms.
4. Provide practical advice for the user.`
        : `Inspect this image with care. If it is signage, branding, equipment, handwritten notes, homework, or a product, break down:
1. What is shown in the image.
2. Measurements, quality, text, or errors detected.
3. Practical advice or calculation (e.g. if it is a sign or quotation, estimate dimensions and materials).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: `${NUREIN_PERSONALITY_PROMPT}\n\nTask: ${prompt || defaultPrompt}`,
          },
        ],
      },
    });

    return res.json({
      analysis: response.text || 'Image analyzed successfully.',
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Multimodal error:', error);
    return res.status(500).json({
      error: 'Failed to analyze media',
      details: error.message || String(error),
    });
  }
});

// 3. Nurein Business: Quotation -> WhatsApp -> Invoice -> Receipt Engine
app.post('/api/business/quotation-flow', async (req: Request, res: Response) => {
  try {
    const { prompt, currency = 'KES', issuerName = 'Nurein 3D Signage & Branding' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Local fallback for signage & small business
      const today = new Date().toISOString().split('T')[0];
      return res.json({
        quotationNumber: 'Q-2045',
        invoiceNumber: 'INV-2045',
        receiptNumber: 'REC-2045',
        date: today,
        validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        clientName: 'Valued Client',
        clientPhone: '',
        jobTitle: '3D Acrylic Signboard (3m)',
        currency,
        items: [
          { description: '3D Acrylic Fabricated Letters (3 Metres, 3D Depth)', quantity: 1, unitPrice: 28000, total: 28000 },
          { description: 'High-Brightness Waterproof LED Modules & 12V 30A Transformer', quantity: 1, unitPrice: 6500, total: 6500 },
          { description: 'Aluminum Composite Panel (ACP) Backing Tray & Steel Frame', quantity: 1, unitPrice: 5500, total: 5500 },
          { description: 'On-Site Mounting, Wiring & Rigging Labour', quantity: 1, unitPrice: 5000, total: 5000 },
        ],
        subtotal: 45000,
        taxAmount: 0,
        grandTotal: 45000,
        depositRequired: 22500,
        balanceOnCompletion: 22500,
        paymentTerms: '50% deposit before fabrication commences; balance due upon satisfactory installation.',
        paymentChannels: 'M-Pesa Paybill: 554321 · Account: Q-2045 · Cash/Bank Transfer accepted.',
        technicalSpecs: {
          signageLengthMeters: 3,
          letterHeightCm: 35,
          lightingType: 'Backlit / Face-lit Samsung LED Modules (12V IP67)',
          estimatedPowerConsumption: '180W',
          turnaroundDays: '3 to 5 working days',
        },
        whatsAppMessage: `*QUOTATION: 3D Acrylic Signboard (3m)*\nFrom: ${issuerName}\nDate: ${today}\n\n*Breakdown:*\n- 3D Acrylic Fabricated Letters (3m): ${currency} 28,000\n- Waterproof LED Modules & 12V Transformer: ${currency} 6,500\n- ACP Backing Tray & Steel Subframe: ${currency} 5,500\n- On-site Mounting & Wiring Labour: ${currency} 5,000\n\n*Total:* ${currency} 45,000\n*Deposit Required (50%):* ${currency} 22,500\n\n*Turnaround:* 3-5 Working Days.\n*Payment Details:* M-Pesa Paybill 554321 / Cash\n\n_Thank you for trusting our craft! Reply to confirm._`,
      });
    }

    const aiPrompt = `You are the core of "Nurein Business" — built by a specialist who understands African small businesses, trades, and 3D signage fabrication.
The user might write in English, Swahili, Somali, or colloquial code-switching like:
"bro make quotation ya signboard 3 meter 40k" or "Make me a quotation for 3D signage, 5 metres, KES 45,000."

User Input: "${prompt}"
Preferred Currency: "${currency}"
Issuer Name: "${issuerName}"

Generate a complete, structured business package. Break down realistic material costs for signage or the specified service (e.g. acrylic letters, LED modules, power transformer/supply, ACP or metal frame backing, installation/labour).
Calculate realistic subtotal and grand total matching the user's intent.

Return ONLY valid JSON matching this exact structure:
{
  "quotationNumber": "Q-2045",
  "invoiceNumber": "INV-2045",
  "receiptNumber": "REC-2045",
  "date": "YYYY-MM-DD",
  "validUntil": "YYYY-MM-DD",
  "clientName": "Client Name or 'Valued Client'",
  "clientPhone": "Phone if mentioned, or empty",
  "jobTitle": "Concise Job Title (e.g. 3D Acrylic LED Signage, 3 Metres)",
  "currency": "${currency}",
  "items": [
    {
      "description": "Clear line item description",
      "quantity": 1,
      "unitPrice": 10000,
      "total": 10000
    }
  ],
  "subtotal": 40000,
  "taxAmount": 0,
  "grandTotal": 40000,
  "depositRequired": 20000,
  "balanceOnCompletion": 20000,
  "paymentTerms": "50% commitment deposit before fabrication; balance on delivery/installation.",
  "paymentChannels": "M-Pesa Till / Paybill or Bank Transfer details",
  "technicalSpecs": {
    "signageLengthMeters": 3,
    "letterHeightCm": 35,
    "lightingType": "Face-lit / Backlit 12V LED Modules IP67",
    "estimatedPowerConsumption": "150W",
    "turnaroundDays": "3 to 5 business days"
  },
  "whatsAppMessage": "Full, friendly, professional WhatsApp formatted message with bolding (*) and line breaks ready to be sent to the customer directly via WhatsApp."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: aiPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Quotation flow error:', error);
    return res.status(500).json({ error: 'Failed to generate quotation flow', details: error.message });
  }
});

// 4. Nurein Business: Design & Graphics Generator (Logo, Poster, Flyer, Business Card, Social Ad, Product Label, 3D Signage)
app.post('/api/business/design', async (req: Request, res: Response) => {
  try {
    const { designType = 'signage', title, details, colors = ['#047857', '#F59E0B', '#FFFFFF', '#0F172A'] } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        title: title || 'Professional Brand Design',
        designType,
        aspectRatio: '16:9',
        svgCode: `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" style="font-family: system-ui, sans-serif;">
  <rect width="800" height="450" fill="#0B132B"/>
  <rect x="20" y="20" width="760" height="410" rx="16" fill="#1C2541" stroke="#48E5C2" stroke-width="2"/>
  <text x="400" y="140" text-anchor="middle" fill="#48E5C2" font-size="28" font-weight="900" letter-spacing="4">3D ILLUMINATED SIGNAGE</text>
  <rect x="150" y="190" width="500" height="120" rx="20" fill="#0B132B" stroke="#F59E0B" stroke-width="4"/>
  <text x="400" y="265" text-anchor="middle" fill="#FFFFFF" font-size="44" font-weight="900" filter="drop-shadow(0 0 12px #F59E0B)">${(title || 'NUREIN 3D').slice(0, 18)}</text>
  <text x="400" y="370" text-anchor="middle" fill="#A7B1C6" font-size="16">Acrylic Fabricated · High-Lumen 12V LED · ACP Tray</text>
</svg>`,
        tips: ['Export to SVG for crystal clear vinyl cutter and laser printing.'],
      });
    }

    const prompt = `You are the lead visual designer for Nurein AI Designer.
Create a visually stunning, production-ready, clean SVG mockup for:
Design Type: "${designType}" (options: signage, logo, poster, flyer, business-card, social-ad, product-label)
Title / Brand: "${title || 'Nurein Brand'}"
Details & Copy: "${details || ''}"

SVG Specifications:
- For 'signage' or 'social-ad': viewBox="0 0 800 450" (16:9)
- For 'poster' or 'flyer': viewBox="0 0 600 800" (3:4)
- For 'business-card': viewBox="0 0 600 350" (landscape card)
- For 'logo': viewBox="0 0 400 400" (1:1)
- For 'product-label': viewBox="0 0 500 500" (square packaging label)

Return ONLY valid JSON:
{
  "title": "Clear Design Title",
  "designType": "${designType}",
  "aspectRatio": "16:9",
  "svgCode": "Complete, valid SVG string with proper viewBox, rich gradients, 3D letter shading or glow effects, clear typography, and decorative elements.",
  "tips": ["Tip 1 on printing or fabrication", "Tip 2 on sharing to customers"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Design generation error:', error);
    return res.status(500).json({ error: 'Failed to generate design', details: error.message });
  }
});

// 5. Nurein Business: Calculations & Measurements
app.post('/api/business/calc', (req: Request, res: Response) => {
  try {
    const { lengthMeters = 3, heightMeters = 0.5, letterCount = 12, costPerMeter = 9000, marginPercent = 35 } = req.body;

    const areaSqM = Number(lengthMeters) * Number(heightMeters);
    const perimeterM = (Number(lengthMeters) + Number(heightMeters)) * 2;
    // Estimated LEDs: roughly 25 to 30 modules per meter for 3D letters
    const estimatedLedModules = Math.round(Number(lengthMeters) * 28);
    // Estimated Power: 1.2W per module + 20% safety headroom
    const estimatedWatts = Math.round(estimatedLedModules * 1.2 * 1.2);
    const recommendedTransformerAmps = Math.ceil(estimatedWatts / 12); // at 12V DC

    // Cost calculations
    const baseMaterialLabourCost = Number(lengthMeters) * Number(costPerMeter);
    const profitAmount = (baseMaterialLabourCost * Number(marginPercent)) / 100;
    const finalPrice = Math.round(baseMaterialLabourCost + profitAmount);
    const deposit50 = Math.round(finalPrice * 0.5);

    return res.json({
      dimensions: {
        lengthMeters,
        heightMeters,
        areaSqM: areaSqM.toFixed(2),
        perimeterM: perimeterM.toFixed(2),
      },
      technicalEstimates: {
        estimatedLedModules,
        estimatedWatts,
        recommendedTransformer: `12V ${recommendedTransformerAmps}A (${estimatedWatts}W DC Waterproof)`,
        acrylicSheetsEst: Math.max(1, Math.ceil(areaSqM / 2.88)), // standard 8x4 sheet is 2.88 sqm
      },
      pricing: {
        baseCost: baseMaterialLabourCost,
        marginPercent,
        profitAmount,
        finalPrice,
        deposit50,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed calculation', details: error.message });
  }
});

// 6. Voice / TTS endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ useWebSpeech: true });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 450),
              speechMetadata: {
                style: 'Warm, smart, respectful, African, friendly guide',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        audioBase64: base64Audio,
        format: 'audio/wav',
      });
    }

    return res.json({ useWebSpeech: true });
  } catch (error: any) {
    console.warn('TTS fallback to Web Speech:', error.message);
    return res.json({ useWebSpeech: true });
  }
});

// Dev vs Prod Vite Integration
if (!isProd) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nurein AI server running on http://0.0.0.0:${PORT}`);
});
