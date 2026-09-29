import { BusinessQuotationFlow, BusinessDocumentHistoryItem, ChatSession, ChatMessage } from '../types';

const CHAT_SESSIONS_KEY = 'nurein_chat_sessions_v1';
const CURRENT_CHAT_ID_KEY = 'nurein_current_chat_id_v1';
const BUSINESS_HISTORY_KEY = 'nurein_business_history_v1';
const ACTIVE_BUSINESS_FLOW_KEY = 'nurein_active_business_flow_v1';

export const generateId = (prefix = 'item'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
};

export const createDefaultWelcomeMessage = (): ChatMessage => ({
  id: 'welcome',
  role: 'assistant',
  content: `Karibu! I am **Nurein AI** — your intelligent assistant.
Core principle: *“Help first. Money should never be the reason someone can't get basic assistance.”*

Feel free to write in English, Swahili (Kiswahili), Somali (Af-Soomaali), Amharic, Arabic, French, or everyday colloquial language (Sheng). What are we working on today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export const summarizePromptTitle = (text: string): string => {
  if (!text) return 'New Conversation';
  const clean = text.replace(/[\n\r]+/g, ' ').replace(/[#*_`]/g, '').trim();
  if (clean.length <= 42) return clean;
  return clean.substring(0, 42).trim() + '...';
};

// ================= CHAT HISTORY STORAGE =================

export const getStoredChatSessions = (): ChatSession[] => {
  try {
    const raw = localStorage.getItem(CHAT_SESSIONS_KEY);
    if (!raw) {
      const defaultSession: ChatSession = {
        id: 'session-welcome',
        title: 'Karibu & Introduction',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [createDefaultWelcomeMessage()],
        language: 'English / Kiswahili',
        summary: 'Karibu to Nurein AI - African-First universal assistant',
      };
      localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify([defaultSession]));
      localStorage.setItem(CURRENT_CHAT_ID_KEY, defaultSession.id);
      return [defaultSession];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [];
  } catch (err) {
    console.error('Failed to parse chat sessions from localStorage:', err);
    return [];
  }
};

export const saveChatSession = (session: ChatSession): void => {
  try {
    const sessions = getStoredChatSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    const updatedSession: ChatSession = {
      ...session,
      updatedAt: new Date().toISOString(),
    };

    let newSessions: ChatSession[];
    if (existingIndex >= 0) {
      newSessions = [...sessions];
      newSessions[existingIndex] = updatedSession;
    } else {
      newSessions = [updatedSession, ...sessions];
    }

    // Keep up to 60 most recent conversations to prevent quota overflow
    const trimmed = newSessions.slice(0, 60);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(trimmed));
    localStorage.setItem(CURRENT_CHAT_ID_KEY, session.id);
  } catch (err) {
    console.error('Failed to save chat session to localStorage:', err);
  }
};

export const deleteStoredChatSession = (id: string): ChatSession[] => {
  try {
    const sessions = getStoredChatSessions().filter((s) => s.id !== id);
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
    if (localStorage.getItem(CURRENT_CHAT_ID_KEY) === id) {
      localStorage.removeItem(CURRENT_CHAT_ID_KEY);
    }
    return sessions;
  } catch (err) {
    console.error('Failed to delete chat session from localStorage:', err);
    return [];
  }
};

export const clearAllChatSessions = (): void => {
  try {
    localStorage.removeItem(CHAT_SESSIONS_KEY);
    localStorage.removeItem(CURRENT_CHAT_ID_KEY);
  } catch (err) {
    console.error('Failed to clear chat sessions from localStorage:', err);
  }
};

export const getCurrentChatSessionId = (): string | null => {
  try {
    return localStorage.getItem(CURRENT_CHAT_ID_KEY);
  } catch {
    return null;
  }
};

export const setCurrentChatSessionId = (id: string): void => {
  try {
    localStorage.setItem(CURRENT_CHAT_ID_KEY, id);
  } catch (err) {
    console.error('Failed to set current chat id:', err);
  }
};

// ================= BUSINESS DOCUMENT HISTORY STORAGE =================

export const getStoredBusinessHistory = (): BusinessDocumentHistoryItem[] => {
  try {
    const raw = localStorage.getItem(BUSINESS_HISTORY_KEY);
    if (!raw) {
      const now = new Date().toISOString();
      const initialSeed: BusinessDocumentHistoryItem[] = [
        {
          id: 'doc-seed-1',
          title: '3D Fabricated Acrylic LED Signboard (5 Metres)',
          createdAt: now,
          updatedAt: now,
          promptUsed: 'Make me a quotation for 3D signage, 5 metres, KES 45,000.',
          flow: {
            quotationNumber: 'Q-3088',
            invoiceNumber: 'INV-3088',
            receiptNumber: 'REC-3088',
            date: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            clientName: 'Sunrise Plaza Enterprises',
            clientPhone: '+254 712 345 678',
            jobTitle: '3D Fabricated Acrylic LED Signboard (5 Metres)',
            currency: 'KES',
            items: [
              { id: '1', description: '3D Fabricated Acrylic Letters (5m Span, 40cm Height, 3D Depth)', quantity: 1, unitPrice: 28000, total: 28000 },
              { id: '2', description: 'High-Brightness Waterproof 12V LED Modules (140 modules)', quantity: 1, unitPrice: 7500, total: 7500 },
              { id: '3', description: 'Heavy-Duty 12V 30A Rainproof Power Supply & Transformer', quantity: 1, unitPrice: 3500, total: 3500 },
              { id: '4', description: 'Aluminum Composite Panel (ACP) Subframe Backing Tray', quantity: 1, unitPrice: 4000, total: 4000 },
              { id: '5', description: 'On-Site Rigging, Wiring & Professional Installation Labour', quantity: 1, unitPrice: 2000, total: 2000 },
            ],
            subtotal: 45000,
            taxAmount: 0,
            grandTotal: 45000,
            depositRequired: 22500,
            balanceOnCompletion: 22500,
            paymentTerms: '50% deposit before laser cutting and acrylic fabrication starts; 50% upon completed installation.',
            paymentChannels: 'M-Pesa Paybill / Till: 554321 · Account: Q-3088 · Bank Transfer: Equity Bank A/C 0123456789',
            technicalSpecs: {
              signageLengthMeters: 5,
              letterHeightCm: 40,
              lightingType: 'Front-lit 12V Injection Samsung LED Modules IP68',
              estimatedPowerConsumption: '220W',
              turnaroundDays: '4 to 6 business days',
            },
            whatsAppMessage: `*QUOTATION: 3D Fabricated Acrylic Signage (5 Metres)*\n*To:* Sunrise Plaza Enterprises\n*Date:* ${new Date().toISOString().split('T')[0]}\n\n*Scope & Materials Breakdown:*\n• 3D Acrylic Fabricated Letters (5m length, 40cm height): KES 28,000\n• Waterproof 12V LED Modules (140 pcs): KES 7,500\n• 12V 30A Rainproof Transformer: KES 3,500\n• ACP Subframe Backing Tray: KES 4,000\n• On-site Mounting & Wiring Labour: KES 2,000\n\n*TOTAL PRICE:* KES 45,000\n*Deposit Required (50%):* KES 22,500\n*Balance on Installation:* KES 22,500\n\n*Turnaround:* 4–6 business days\n*Payment:* M-Pesa Till 554321 / Cash / Bank\n\n_Thank you for trusting Nurein Signage & Branding! Reply YES to confirm production._`,
          },
        },
        {
          id: 'doc-seed-2',
          title: 'Light-box Menu Board & Window Graphics (2.5 Metres)',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          promptUsed: 'Make quotation for 2.5m lightbox menu board for Mama Halima KES 18,500',
          flow: {
            quotationNumber: 'Q-2940',
            invoiceNumber: 'INV-2940',
            receiptNumber: 'REC-2940',
            date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
            clientName: 'Mama Halima Fresh Kitchen',
            clientPhone: '+254 722 998 877',
            jobTitle: 'Light-box Menu Board & Window Graphics (2.5 Metres)',
            currency: 'KES',
            items: [
              { id: '1', description: 'Double-Sided Aluminum Lightbox Profile 2.5m x 0.8m', quantity: 1, unitPrice: 9500, total: 9500 },
              { id: '2', description: 'Translucent High-Resolution Backlit Film Print with Matte Lamination', quantity: 1, unitPrice: 4000, total: 4000 },
              { id: '3', description: 'Edge-Lit LED Strips & Waterproof Driver 100W', quantity: 1, unitPrice: 3000, total: 3000 },
              { id: '4', description: 'Wall Mounting Brackets & Electrical Fitting', quantity: 1, unitPrice: 2000, total: 2000 },
            ],
            subtotal: 18500,
            taxAmount: 0,
            grandTotal: 18500,
            depositRequired: 9250,
            balanceOnCompletion: 9250,
            paymentTerms: '50% deposit on order placement; 50% upon handover and power-on testing.',
            paymentChannels: 'M-Pesa Buy Goods Till: 654321 · Cash accepted',
            technicalSpecs: {
              signageLengthMeters: 2.5,
              letterHeightCm: 25,
              lightingType: 'Edge-Lit High Lumen 12V LED Strip',
              estimatedPowerConsumption: '100W',
              turnaroundDays: '2 to 3 business days',
            },
            whatsAppMessage: `*QUOTATION: Light-box Menu Board (2.5 Metres)*\n*To:* Mama Halima Fresh Kitchen\n\n*Items:*\n• Lightbox Profile: KES 9,500\n• Backlit Printed Graphic: KES 4,000\n• LED Strips & Driver: KES 3,000\n• Installation & Bracket: KES 2,000\n\n*TOTAL:* KES 18,500 (Deposit KES 9,250)\n*M-Pesa Till:* 654321`,
          },
        },
      ];
      localStorage.setItem(BUSINESS_HISTORY_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return [];
  } catch (err) {
    console.error('Failed to parse business history from localStorage:', err);
    return [];
  }
};

export const saveBusinessDocumentToHistory = (
  flow: BusinessQuotationFlow,
  promptUsed?: string,
  customTitle?: string
): BusinessDocumentHistoryItem => {
  const title = customTitle || flow.jobTitle || `${flow.quotationNumber} - ${flow.clientName}`;
  const now = new Date().toISOString();

  const newItem: BusinessDocumentHistoryItem = {
    id: generateId('doc'),
    title,
    createdAt: now,
    updatedAt: now,
    promptUsed,
    flow: { ...flow },
  };

  try {
    const history = getStoredBusinessHistory();
    // Check if item with identical quote number and job title exists to avoid duplicate stacking
    const filtered = history.filter(
      (item) => item.flow.quotationNumber !== flow.quotationNumber || item.flow.jobTitle !== flow.jobTitle
    );
    const updated = [newItem, ...filtered].slice(0, 50); // limit to 50 docs
    localStorage.setItem(BUSINESS_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save business document to localStorage:', err);
  }

  return newItem;
};

export const deleteStoredBusinessDocument = (id: string): BusinessDocumentHistoryItem[] => {
  try {
    const history = getStoredBusinessHistory().filter((item) => item.id !== id);
    localStorage.setItem(BUSINESS_HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (err) {
    console.error('Failed to delete business document from localStorage:', err);
    return [];
  }
};

export const clearAllBusinessHistory = (): void => {
  try {
    localStorage.removeItem(BUSINESS_HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear business history:', err);
  }
};

export const getStoredActiveBusinessFlow = (): BusinessQuotationFlow | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_BUSINESS_FLOW_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse active business flow from localStorage:', err);
    return null;
  }
};

export const setStoredActiveBusinessFlow = (flow: BusinessQuotationFlow): void => {
  try {
    localStorage.setItem(ACTIVE_BUSINESS_FLOW_KEY, JSON.stringify(flow));
  } catch (err) {
    console.error('Failed to save active business flow to localStorage:', err);
  }
};
