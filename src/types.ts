export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BusinessQuotationFlow {
  quotationNumber: string;
  invoiceNumber: string;
  receiptNumber: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientPhone: string;
  jobTitle: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  depositRequired: number;
  balanceOnCompletion: number;
  paymentTerms: string;
  paymentChannels: string;
  technicalSpecs?: {
    signageLengthMeters?: number;
    letterHeightCm?: number;
    lightingType?: string;
    estimatedPowerConsumption?: string;
    turnaroundDays?: string;
  };
  whatsAppMessage: string;
}

export interface CustomerJob {
  id: string;
  clientName: string;
  phone: string;
  jobTitle: string;
  amount: number;
  currency: string;
  status: 'quoted' | 'in-progress' | 'delivered' | 'paid';
  date: string;
  notes?: string;
}

export interface DesignAsset {
  title: string;
  designType: 'signage' | 'logo' | 'poster' | 'flyer' | 'business-card' | 'social-ad' | 'product-label';
  aspectRatio: string;
  svgCode: string;
  tips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isSafetyNotice?: boolean;
  groundingChunks?: any[];
  imageUrl?: string;
  docUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  language?: string;
  summary?: string;
}

export interface BusinessDocumentHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  promptUsed?: string;
  flow: BusinessQuotationFlow;
}

export interface TutorResult {
  conceptName: string;
  simpleSummary: string;
  everydayMetaphor: string;
  stepByStep: string[];
  commonMistakeToAvoid: string;
  practiceChallenge: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface TranslationResult {
  translatedText: string;
  detectedSource: string;
  targetLang: string;
  plainLanguageExplanation?: string;
  keyVocabulary?: Array<{ term: string; meaning: string }>;
  pronunciationGuide?: string;
}

export interface InvoiceData {
  id: string;
  type: 'invoice' | 'quotation';
  number: string;
  date: string;
  dueDate: string;
  currency: string;
  issuerName: string;
  issuerContact: string;
  clientName: string;
  clientContact: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'mpesa' | 'bank' | 'cash' | 'other';
  paymentDetails: string;
  paymentTerms: string;
  notes: string;
  status: 'draft' | 'sent' | 'paid';
}

export interface BrandPalette {
  name: string;
  colors: string[];
  rationale: string;
}

export interface BrandResult {
  brandNames: Array<{ name: string; rationale: string }>;
  taglines: string[];
  palettes: BrandPalette[];
  story: string;
  suggestedSymbol: string;
  svgSnippet: string;
}

export interface GraphicDesignResult {
  headline: string;
  subheadline: string;
  bodyText: string;
  callToAction: string;
  contactInfo: string;
  colorPalette: {
    bg: string;
    card: string;
    text: string;
    accent: string;
    highlight: string;
  };
  designTips: string[];
  svgCode: string;
}

export interface ImpactStats {
  freeQueriesDelivered: number;
  invoicesGenerated: number;
  studentsTutored: number;
  translationsMade: number;
  sponsoredTokenPoolRemaining: number;
  activeGrassrootsNodes: number;
  lowBandwidthDataSavedMb: number;
  businessModel: {
    corePromise: string;
    crossSubsidyMethod: string;
    communityPledge: string;
  };
}
