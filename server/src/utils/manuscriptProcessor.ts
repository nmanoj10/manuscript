import { Manuscript } from '../models/Manuscript.js';
import { Upload } from '../models/Upload.js';
import { analyzeManuscriptComprehensive, generateImageHint } from './gemini.js';
import { extractTextWithVision, cleanText } from './vision-ocr.js';

/**
 * Process a manuscript with comprehensive AI analysis
 * Uses Google Vision OCR + Gemini for full analysis
 */
export const processManuscriptSync = async (
    manuscriptId: string,
    uploadId: string,
    imageUrl: string
): Promise<void> => {
    try {
        console.log(`Processing manuscript ${manuscriptId} with comprehensive analysis...`);

        // Get the current manuscript to preserve user-provided data
        const manuscript = await Manuscript.findById(manuscriptId);
        if (!manuscript) {
            throw new Error('Manuscript not found');
        }

        // Update status to processing
        await Manuscript.findByIdAndUpdate(manuscriptId, { status: 'processing' });

        try {
            // Step 1: Extract text using Google Vision OCR
            console.log('Step 1: Running Google Vision OCR...');
            let ocrResult;
            let ocrText = '';
            let cleanedOcrText = '';
            let detectedLanguage = 'unknown';

            try {
                ocrResult = await extractTextWithVision(imageUrl);
                ocrText = ocrResult.text;
                cleanedOcrText = ocrResult.cleanedText;
                detectedLanguage = ocrResult.detectedLanguage;
                console.log(`✓ OCR extracted ${ocrText.length} characters, language: ${detectedLanguage}`);
            } catch (ocrError) {
                console.warn('Google Vision OCR failed, continuing without OCR:', ocrError);
                ocrText = '';
                cleanedOcrText = '';
            }

            // Step 2: Comprehensive analysis with Gemini
            console.log('Step 2: Running comprehensive Gemini analysis...');
            const analysis = await analyzeManuscriptComprehensive(imageUrl, cleanedOcrText, 'image/jpeg');

            // Step 3: Generate image hint
            console.log('Step 3: Generating image hint...');
            const imageHint = await generateImageHint(
                analysis.title !== 'Manuscript Analysis Pending' ? analysis.title : manuscript.title,
                analysis.description
            );

            // Step 4: Prepare update data
            const hasValidAnalysis = analysis.confidenceScores.language > 0 ||
                analysis.confidenceScores.script > 0;

            const updateData: any = {
                // OCR results
                ocrText: ocrText || analysis.ocrText,
                cleanedOcrText: cleanedOcrText || analysis.cleanedOcrText,
                detectedLanguage,

                // Enhanced summaries
                shortSummary: analysis.shortSummary,
                detailedSummary: analysis.detailedSummary,

                // Content analysis
                keywords: analysis.keywords,
                topics: analysis.topics,

                // Sentiment analysis
                sentiment: analysis.sentiment,

                // Named entities
                entities: analysis.entities,

                // Document structure
                outline: analysis.outline,
                highlights: analysis.highlights,

                // AI metadata
                scriptType: analysis.scriptType,
                estimatedCentury: analysis.estimatedCentury,
                materialType: analysis.materialType,
                confidenceScores: analysis.confidenceScores,
                tags: analysis.tags.length > 0 ? analysis.tags : manuscript.tags,
                imageHint,
                status: 'published',
            };

            // Only override user-provided fields if AI analysis was successful
            if (hasValidAnalysis) {
                updateData.title = analysis.title;
                updateData.description = analysis.description;
                updateData.summary = analysis.description; // Legacy field
                updateData.category = analysis.category;
                updateData.origin = analysis.origin;
                updateData.language = analysis.language;
                console.log(`✓ Using AI-generated metadata`);
            } else {
                // Preserve user input if AI failed
                console.log(`⚠ AI analysis incomplete, preserving user-provided metadata`);
            }

            // Step 5: Update Manuscript with all processed data
            await Manuscript.findByIdAndUpdate(manuscriptId, updateData);

            // Step 6: Update Upload status
            await Upload.findByIdAndUpdate(uploadId, { status: 'completed' });

            console.log(`✓ Manuscript ${manuscriptId} processed successfully with comprehensive analysis`);
            console.log(`  - Keywords: ${analysis.keywords.length}`);
            console.log(`  - Topics: ${analysis.topics.length}`);
            console.log(`  - Entities: ${Object.values(analysis.entities).flat().length} total`);
            console.log(`  - Outline sections: ${analysis.outline.length}`);
            console.log(`  - Highlights: ${analysis.highlights.length}`);

        } catch (aiError: any) {
            console.error(`AI processing error for manuscript ${manuscriptId}:`, aiError);

            // Even if AI fails, publish the manuscript with user-provided data
            await Manuscript.findByIdAndUpdate(manuscriptId, {
                status: 'published',
                tags: manuscript.tags.length > 0 ? manuscript.tags : ['manual-upload'],
            });

            // Mark upload as completed (with partial processing)
            await Upload.findByIdAndUpdate(uploadId, { status: 'completed' });

            console.log(`✓ Manuscript ${manuscriptId} published with user-provided metadata (AI processing failed).`);
        }
    } catch (error) {
        console.error(`Failed to process manuscript ${manuscriptId}:`, error);

        // Revert to draft state on critical error
        await Upload.findByIdAndUpdate(uploadId, { status: 'failed' });
        await Manuscript.findByIdAndUpdate(manuscriptId, { status: 'draft' });

        throw error;
    }
};
