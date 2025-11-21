// Google Vision OCR utility for comprehensive text extraction
import { ImageAnnotatorClient } from '@google-cloud/vision';

let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
    if (!visionClient) {
        // Initialize with credentials from environment
        // If GOOGLE_APPLICATION_CREDENTIALS is set, it will use that
        // Otherwise, falls back to application default credentials
        visionClient = new ImageAnnotatorClient();
    }
    return visionClient;
}

export interface OCRResult {
    text: string;
    cleanedText: string;
    detectedLanguage: string;
    confidence: number;
    paragraphs: string[];
}

/**
 * Extract text from image using Google Vision OCR
 * Preserves paragraph structure and detects language
 */
export async function extractTextWithVision(imageUrl: string): Promise<OCRResult> {
    try {
        const client = getVisionClient();

        // Perform text detection WITHOUT language hints to support all languages
        // This prevents "language override unsupported" errors for Tamil, etc.
        const [result] = await client.textDetection({
            image: { source: { imageUri: imageUrl } },
            // Do not specify imageContext.languageHints to allow auto-detection of all languages
        });

        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return {
                text: '',
                cleanedText: '',
                detectedLanguage: 'unknown',
                confidence: 0,
                paragraphs: [],
            };
        }

        // First annotation contains the full text
        const fullText = detections[0].description || '';

        // Detect language from Vision API response
        const detectedLanguages = detections[0].locale ? [detections[0].locale] : [];
        const primaryLanguage = detectedLanguages[0] || detectLanguageFromText(fullText);

        // Extract paragraphs (split by double newlines)
        const paragraphs = fullText
            .split(/\n\n+/)
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0);

        // Clean the text
        const cleanedText = cleanText(fullText);

        // Calculate average confidence from all detections
        const confidenceScores = detections
            .slice(1) // Skip first one (full text)
            .map((d: any) => d.confidence || 0)
            .filter((c: number) => c > 0);

        const averageConfidence = confidenceScores.length > 0
            ? confidenceScores.reduce((a: number, b: number) => a + b, 0) / confidenceScores.length
            : 0.5;

        return {
            text: fullText,
            cleanedText,
            detectedLanguage: primaryLanguage,
            confidence: averageConfidence,
            paragraphs,
        };
    } catch (error: any) {
        console.error('Google Vision OCR error:', error);

        // If Vision API fails, return empty result
        return {
            text: '',
            cleanedText: '',
            detectedLanguage: 'unknown',
            confidence: 0,
            paragraphs: [],
        };
    }
}

/**
 * Clean OCR text by removing duplicates, noise, and artifacts
 */
export function cleanText(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove duplicate consecutive lines
    const lines = cleaned.split('\n');
    const uniqueLines: string[] = [];
    let previousLine = '';

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine !== previousLine && trimmedLine.length > 0) {
            uniqueLines.push(line);
            previousLine = trimmedLine;
        }
    }

    cleaned = uniqueLines.join('\n');

    // Remove common OCR artifacts
    cleaned = cleaned
        .replace(/[�]/g, '') // Remove replacement characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/([.!?])\1+/g, '$1') // Remove duplicate punctuation
        .trim();

    // Remove lines that are likely headers/footers (very short, often page numbers)
    const cleanedLines = cleaned.split('\n').filter((line: string) => {
        const trimmed = line.trim();
        // Keep lines that are longer than 3 characters or contain meaningful content
        return trimmed.length > 3 || /[a-zA-Z]/.test(trimmed);
    });

    cleaned = cleanedLines.join('\n');

    // Remove excessive newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
}

/**
 * Detect language from text using Unicode ranges (heuristic fallback)
 * Used when Vision API doesn't provide language information
 */
export function detectLanguageFromText(text: string): string {
    if (!text) return 'unknown';

    // Simple language detection heuristics based on Unicode ranges
    if (/[\u0900-\u097F]/.test(text)) return 'Hindi/Sanskrit (Devanagari)';
    if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil';
    if (/[\u0C00-\u0C7F]/.test(text)) return 'Telugu';
    if (/[\u0D00-\u0D7F]/.test(text)) return 'Malayalam';
    if (/[\u0600-\u06FF]/.test(text)) return 'Arabic/Urdu';
    if (/[\u4E00-\u9FFF]/.test(text)) return 'Chinese';
    if (/[a-zA-Z]/.test(text)) return 'English/Latin';

    return 'unknown';
}
