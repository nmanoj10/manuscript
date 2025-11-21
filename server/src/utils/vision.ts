import { ImageAnnotatorClient } from '@google-cloud/vision';

let client: ImageAnnotatorClient | null = null;

function getClient() {
  if (!client) {
    // ImageAnnotatorClient uses GOOGLE_APPLICATION_CREDENTIALS or ADC
    client = new ImageAnnotatorClient();
  }
  return client;
}

export const isVisionConfigured = (): boolean => {
  // Basic check: either GOOGLE_APPLICATION_CREDENTIALS is set or running with ADC
  return !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
};

// Use documentTextDetection which performs better for dense documents and preserves layout
export const extractTextWithVision = async (buffer: Buffer): Promise<string> => {
  try {
    const client = getClient();
    // documentTextDetection returns fullTextAnnotation which contains the full extracted text
    const [result] = await client.documentTextDetection({ image: { content: buffer } });
    const annotation = (result.fullTextAnnotation as any) || null;
    if (annotation && annotation.text) {
      return annotation.text as string;
    }
    // Fallback to textAnnotations if documentTextDetection did not return text
    const textAnnotations = (result.textAnnotations as any[]) || [];
    if (textAnnotations.length > 0) {
      return textAnnotations[0].description || '';
    }
    return '';
  } catch (error) {
    console.error('Vision OCR error:', error);
    return '';
  }
};
