// Gemini utility for manuscript analysis
import { GoogleGenerativeAI } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export interface ManuscriptAnalysisResult {
  title: string;
  description: string;
  category: string;
  origin: string;
  language: string;
  scriptType: string;
  estimatedCentury: string;
  materialType: string;
  ocrText: string;
  confidenceScores: {
    script: number;
    language: number;
    century: number;
    region: number;
  };
  tags: string[];
}

export interface ComprehensiveAnalysisResult {
  // Basic metadata
  title: string;
  description: string;
  category: string;
  origin: string;
  language: string;
  scriptType: string;
  estimatedCentury: string;
  materialType: string;

  // OCR and text
  ocrText: string;
  cleanedOcrText: string;

  // Enhanced summaries
  shortSummary: string; // 1-2 sentences
  detailedSummary: string[]; // 3-5 bullet points

  // Content analysis
  keywords: string[]; // Top 10 keywords
  topics: string[]; // Multiple topic classifications

  // Sentiment analysis
  sentiment: {
    tone: string; // e.g., "neutral", "positive", "reverent", "scholarly"
    score: number; // 0-1
    description: string;
  };

  // Named entity extraction
  entities: {
    people: string[];
    places: string[];
    dates: string[];
    organizations: string[];
  };

  // Document structure
  outline: string[]; // Structured outline
  highlights: string[]; // 5-10 important sentences

  // Metadata
  confidenceScores: {
    script: number;
    language: number;
    century: number;
    region: number;
  };
  tags: string[];
}

/**
 * Analyze a manuscript image.
 * Supports manuscripts in all languages including Sanskrit.
 */
export const analyzeManuscript = async (
  imageUrl: string,
  mimeType: string = 'image/jpeg',
  userLanguage?: string
): Promise<ManuscriptAnalysisResult> => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Fetch the image
    const imageResp = await fetch(imageUrl);
    const imageBuffer = await imageResp.arrayBuffer();

    const prompt = `You are an expert in manuscript classification, paleography, and cultural heritage.

Analyze this manuscript image and return a structured JSON response with the following fields:
- title: A short, descriptive title (e.g., "Palm Leaf Manuscript of the Bhagavad Gita").
- description: A detailed description (2‑3 paragraphs) covering visual characteristics, condition, and content.
- category: The subject category (e.g., Religion, Medicine, Astronomy, Literature, History, Law, Art).
- origin: The likely region or cultural origin.
- language: The primary language of the text.
- scriptType: The script used (e.g., Tamil, Devanagari, Grantha, Naskh, Latin).
- estimatedCentury: Approximate century or era of creation.
- materialType: The material used (e.g., Palm leaf, Paper, Vellum, Birch bark, Copper plate).
- ocrText: Transcribe any readable text you can see (up to 500 words).
- confidenceScores: JSON object with numeric scores (0.0‑1.0) for 'script', 'language', 'century', and 'region'.
- tags: An array of 5‑10 relevant keywords.

Respond ONLY with the raw JSON object. Do not use markdown code blocks.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: Buffer.from(imageBuffer).toString('base64'),
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(jsonStr);
    return {
      title: data.title || 'Untitled Manuscript',
      description: data.description || 'No description available.',
      category: data.category || 'Uncategorized',
      origin: data.origin || 'Unknown',
      language: data.language || 'Unknown',
      scriptType: data.scriptType || 'Unknown',
      estimatedCentury: data.estimatedCentury || 'Unknown',
      materialType: data.materialType || 'Unknown',
      ocrText: data.ocrText || '',
      confidenceScores: {
        script: data.confidenceScores?.script ?? 0.5,
        language: data.confidenceScores?.language ?? 0.5,
        century: data.confidenceScores?.century ?? 0.5,
        region: data.confidenceScores?.region ?? 0.5,
      },
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch (error: any) {
    console.error('Error analyzing manuscript:', error);
    // Fallback for any unexpected error
    return {
      title: 'Manuscript Analysis Pending',
      description: 'AI analysis failed. Please provide metadata manually.',
      category: 'General',
      origin: 'Unknown',
      language: userLanguage || 'Unknown',
      scriptType: 'Unknown',
      estimatedCentury: 'Unknown',
      materialType: 'Unknown',
      ocrText: '',
      confidenceScores: { script: 0, language: 0, century: 0, region: 0 },
      tags: ['pending-analysis', 'manual-review-needed'],
    };
  }
};

export const generateImageHint = async (title: string, description: string): Promise<string> => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Create a descriptive hint for an AI image generator to create a cover image for this manuscript:\n\nTitle: ${title}\nDescription: ${description}\n\nProvide a single paragraph description suitable for image generation (artistic style, mood, colors, elements to include).`;
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error('Error generating image hint:', error);
    return `Historical manuscript cover for "${title}"`;
  }
};

/**
 * Comprehensive manuscript analysis with all enhanced features
 * Includes summaries, keywords, topics, sentiment, entities, outline, and highlights
 */
export const analyzeManuscriptComprehensive = async (
  imageUrl: string,
  ocrText: string,
  mimeType: string = 'image/jpeg'
): Promise<ComprehensiveAnalysisResult> => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Fetch the image
    const imageResp = await fetch(imageUrl);
    const imageBuffer = await imageResp.arrayBuffer();

    const prompt = `You are an expert in manuscript analysis, paleography, and cultural heritage.

Analyze this manuscript image and the extracted OCR text to return a COMPREHENSIVE JSON response with ALL the following fields:

OCR Text Reference:
${ocrText.substring(0, 2000)}${ocrText.length > 2000 ? '...[truncated]' : ''}

Required JSON Structure (respond with ONLY the JSON, no markdown blocks):
{
  "title": "Short descriptive title",
  "description": "Detailed 2-3 paragraph description",
  "category": "Subject category (Religion/Medicine/Literature/etc)",
  "origin": "Cultural/regional origin",
  "language": "Primary language",
  "scriptType": "Script used (Devanagari/Tamil/etc)",
  "estimatedCentury": "Approximate era",
  "materialType": "Material (Palm leaf/Paper/etc)",
  "ocrText": "${ocrText ? 'Use provided OCR text' : 'Transcribe readable text'}",
  "cleanedOcrText": "Cleaned version of OCR text",
  "shortSummary": "1-2 sentence summary of content",
  "detailedSummary": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "keywords": ["keyword1", "keyword2", ... up to 10],
  "topics": ["topic1", "topic2", ... multiple classifications],
  "sentiment": {
    "tone": "neutral/scholarly/reverent/etc",
    "score": 0.5,
    "description": "Brief sentiment description"
  },
  "entities": {
    "people": ["Name1", "Name2"],
    "places": ["Place1", "Place2"],
    "dates": ["Date1", "Date2"],
    "organizations": ["Org1", "Org2"]
  },
  "outline": ["Section 1", "Section 2", ... structured outline],
  "highlights": ["Important quote 1", "Important quote 2", ... 5-10 key sentences],
  "confidenceScores": {
    "script": 0.8,
    "language": 0.9,
    "century": 0.6,
    "region": 0.7
  },
  "tags": ["tag1", "tag2", ... 5-10 relevant tags]
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: Buffer.from(imageBuffer).toString('base64'),
          mimeType: mimeType,
        },
      },
    ]);

    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(jsonStr);

    return {
      title: data.title || 'Untitled Manuscript',
      description: data.description || 'No description available.',
      category: data.category || 'Uncategorized',
      origin: data.origin || 'Unknown',
      language: data.language || 'Unknown',
      scriptType: data.scriptType || 'Unknown',
      estimatedCentury: data.estimatedCentury || 'Unknown',
      materialType: data.materialType || 'Unknown',
      ocrText: data.ocrText || ocrText || '',
      cleanedOcrText: data.cleanedOcrText || ocrText || '',
      shortSummary: data.shortSummary || 'No summary available.',
      detailedSummary: Array.isArray(data.detailedSummary) ? data.detailedSummary : [],
      keywords: Array.isArray(data.keywords) ? data.keywords.slice(0, 10) : [],
      topics: Array.isArray(data.topics) ? data.topics : [],
      sentiment: {
        tone: data.sentiment?.tone || 'neutral',
        score: data.sentiment?.score || 0.5,
        description: data.sentiment?.description || 'No sentiment analysis available',
      },
      entities: {
        people: Array.isArray(data.entities?.people) ? data.entities.people : [],
        places: Array.isArray(data.entities?.places) ? data.entities.places : [],
        dates: Array.isArray(data.entities?.dates) ? data.entities.dates : [],
        organizations: Array.isArray(data.entities?.organizations) ? data.entities.organizations : [],
      },
      outline: Array.isArray(data.outline) ? data.outline : [],
      highlights: Array.isArray(data.highlights) ? data.highlights.slice(0, 10) : [],
      confidenceScores: {
        script: data.confidenceScores?.script ?? 0.5,
        language: data.confidenceScores?.language ?? 0.5,
        century: data.confidenceScores?.century ?? 0.5,
        region: data.confidenceScores?.region ?? 0.5,
      },
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch (error: any) {
    console.error('Error in comprehensive analysis:', error);

    // Return fallback with provided OCR text
    return {
      title: 'Manuscript Analysis Pending',
      description: 'Comprehensive AI analysis could not be performed. Please review manually.',
      category: 'General',
      origin: 'Unknown',
      language: 'Unknown',
      scriptType: 'Unknown',
      estimatedCentury: 'Unknown',
      materialType: 'Unknown',
      ocrText: ocrText || '',
      cleanedOcrText: ocrText || '',
      shortSummary: 'Analysis pending.',
      detailedSummary: [],
      keywords: [],
      topics: [],
      sentiment: { tone: 'neutral', score: 0.5, description: 'Not analyzed' },
      entities: { people: [], places: [], dates: [], organizations: [] },
      outline: [],
      highlights: [],
      confidenceScores: { script: 0, language: 0, century: 0, region: 0 },
      tags: ['pending-analysis'],
    };
  }
};

/**
 * Translate text using Gemini
 */
export const translateText = async (text: string, targetLanguage: string = 'English'): Promise<string> => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Translate the following text to ${targetLanguage}. Preserve the meaning and cultural context:\n\n${text}`;
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original if translation fails
  }
};

