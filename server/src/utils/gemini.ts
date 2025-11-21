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

export const categorizeManuscript = async (
  title: string,
  description: string,
  imageUrl?: string
): Promise<{ category: string; confidence: number; tags: string[] }> => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `You are an expert in manuscript classification and cultural heritage. 
    
Analyze this manuscript and provide:
1. A category (choose from: Literature, Poetry, Philosophy, History, Religion, Science, Art, Medicine, Other)
2. Confidence score (0-1)
3. Relevant tags (5-7 tags)

Manuscript Details:
Title: ${title}
Description: ${description}
${imageUrl ? `Image URL: ${imageUrl}` : ''}

Respond in JSON format:
{
  "category": "category_name",
  "confidence": 0.95,
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error categorizing manuscript:', error);
    return {
      category: 'Other',
      confidence: 0.5,
      tags: ['manuscript', 'historical', 'document']
    };
  }
};

export const summarizeManuscript = async (
  title: string,
  description: string,
  content?: string
): Promise<string> => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Create a concise summary (2-3 sentences) of this manuscript:

Title: ${title}
Description: ${description}
${content ? `Content: ${content.substring(0, 1000)}` : ''}

Provide only the summary, no additional text.`;

    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error('Error summarizing manuscript:', error);
    return description;
  }
};

export const generateImageHint = async (title: string, description: string): Promise<string> => {
  try {
    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = `Create a descriptive hint for an AI image generator to create a cover image for this manuscript:

Title: ${title}
Description: ${description}

Provide a single paragraph description suitable for image generation (artistic style, mood, colors, elements to include).`;

    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error('Error generating image hint:', error);
    return `Historical manuscript cover for "${title}"`;
  }
};
