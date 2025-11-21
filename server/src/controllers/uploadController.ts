import { Response } from 'express';
import { Upload } from '../models/Upload.js';
import { Manuscript } from '../models/Manuscript.js';
import { uploadImageToImageKit } from '../utils/imagekit.js';
import sharp from 'sharp';
import { categorizeManuscript, summarizeManuscript, generateImageHint } from '../utils/gemini.js';
import { extractTextFromBuffer } from '../utils/ocr.js';
import { isVisionConfigured, extractTextWithVision } from '../utils/vision.js';
import { generateUniqueFileName } from '../middleware/upload.js';
import { AuthRequest } from '../middleware/auth.js';

export const uploadManuscript = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // Allow either a numeric/string userId from JWT or an email fallback from headers
    if (!req.userId && !req.user?.email) {
      return res.status(401).json({ error: 'User authentication required' });
    }
    
    const { title, author, description, category, origin, language, location } = req.body;
    
    if (!title || !author || !description || !origin || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const fileName = generateUniqueFileName(req.file.originalname);
    
    if (!fileName) {
      return res.status(400).json({ error: 'Failed to generate file name' });
    }
    
    // Compress and create thumbnail using sharp
    const optimizedBuffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();

    const thumbBuffer = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();

    // Upload optimized and thumbnail to ImageKit
    const optName = fileName.replace(/(\.[^.]+)$/, '-opt$1');
    const thumbName = fileName.replace(/(\.[^.]+)$/, '-thumb$1');

    const { url: optimizedUrl } = await uploadImageToImageKit(optimizedBuffer, optName, 'manuscripts');
    const { url: thumbnailUrl } = await uploadImageToImageKit(thumbBuffer, thumbName, 'manuscripts');

    const imageUrl = optimizedUrl;
    
    // Create upload record
    // Prefer storing the user's email as the uploader identifier when available,
    // otherwise fall back to userId. This keeps `getUserUploads` queries consistent.
    const uploaderId = req.user?.email || req.userId || '';

    const upload = new Upload({
      fileName: fileName || `upload-${Date.now()}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: uploaderId,
      imageUrl,
      optimizedUrl,
      thumbnailUrl,
      status: 'processing',
    });
    
    await upload.save();

    // Pass a consistent user identifier to the background processor as well
    // and use the same identifier for the placeholder manuscript.
    const manuscriptUserId = req.userId || req.user?.email || '';

    // Create a lightweight placeholder manuscript so the upload is visible immediately
    // and can be updated by the background processor. This avoids duplicates and
    // gives immediate feedback in the frontend.
    const placeholderManuscript = new Manuscript({
      userId: manuscriptUserId,
      title,
      author,
      description,
      category: category || 'General',
      origin,
      language,
      location: location || '',
      imageUrl,
      summary: '',
      tags: [],
      status: 'published',
    });

    await placeholderManuscript.save();

    // Link upload -> manuscript so background processor can update the same document
    upload.manuscriptId = placeholderManuscript._id.toString();
    await upload.save();

    // Process with AI in background; pass original buffer for OCR

    processManuscriptAsync(
      title,
      author,
      description,
      category,
      imageUrl,
      origin,
      language,
      location || '',
      manuscriptUserId,
      upload._id.toString(),
      req.file.buffer,
      optimizedUrl,
      thumbnailUrl
    );
    
    res.status(201).json({
      uploadId: upload._id,
      message: 'Manuscript uploaded and being processed',
      imageUrl,
      optimizedUrl: upload.optimizedUrl,
      thumbnailUrl: upload.thumbnailUrl,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload manuscript' });
  }
};

const processManuscriptAsync = async (
  title: string,
  author: string,
  description: string,
  category: string,
  imageUrl: string,
  origin: string,
  language: string,
  location: string,
  userId: string,
  uploadId: string,
  fileBuffer?: Buffer,
  optimizedUrl?: string,
  thumbnailUrl?: string
) => {
  try {
    let finalCategory = category;
    let tags: string[] = [];
    
    // Categorize using Gemini if category is generic
    if (!category || category === 'General') {
      const result = await categorizeManuscript(title, description, imageUrl);
      finalCategory = result.category;
      tags = result.tags;
    }
    
    // Extract OCR text from the image (if available)
    let ocrText = '';
    try {
      if (fileBuffer && fileBuffer.length > 0) {
        if (isVisionConfigured()) {
          // Prefer Google Vision when configured for better reliability
          ocrText = await extractTextWithVision(fileBuffer);
        } else {
          // Fallback to local/embedded OCR (may be stubbed)
          ocrText = await extractTextFromBuffer(fileBuffer);
        }
      }
    } catch (err) {
      console.error('OCR step failed:', err);
    }

    // Generate summary
    const summary = await summarizeManuscript(title, description + '\n' + (ocrText || ''));
    
    // Generate image hint
    const imageHint = await generateImageHint(title, description);
    
    // If an upload placeholder manuscript exists, update it; otherwise create a new manuscript
    const uploadDoc = await Upload.findById(uploadId);
    if (uploadDoc && uploadDoc.manuscriptId) {
      await Manuscript.findByIdAndUpdate(
        uploadDoc.manuscriptId,
        {
          userId,
          title,
          author,
          description,
          category: finalCategory,
          origin,
          language,
          location,
          ocrText,
          scriptType: '',
          dateWritten: '',
          period: '',
          significance: '',
          imageUrl,
          imageHint,
          summary,
          tags,
          thumbnailUrl: thumbnailUrl || '',
          optimizedUrl: optimizedUrl || '',
          status: 'published',
        },
        { new: true }
      );

      // Update upload status
      await Upload.findByIdAndUpdate(uploadId, {
        status: 'completed',
        optimizedUrl: optimizedUrl || '',
        thumbnailUrl: thumbnailUrl || '',
      });
    } else {
      const manuscript = new Manuscript({
        userId,
        title,
        author,
        description,
        category: finalCategory,
        origin,
        language,
        location,
        ocrText,
        scriptType: '',
        dateWritten: '',
        period: '',
        significance: '',
        imageUrl,
        imageHint,
        summary,
        tags,
        status: 'published',
      });

      await manuscript.save();

      // Update upload status and link to manuscript
      await Upload.findByIdAndUpdate(uploadId, {
        status: 'completed',
        manuscriptId: manuscript._id.toString(),
        optimizedUrl: optimizedUrl || '',
        thumbnailUrl: thumbnailUrl || '',
      });
    }
  } catch (error) {
    console.error('Error processing manuscript:', error);
    // Update upload status to failed
    try {
      await Upload.findByIdAndUpdate(uploadId, { status: 'failed' });
    } catch (updateError) {
      console.error('Error updating upload status:', updateError);
    }
  }
};

export const getUploadStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { uploadId } = req.params;
    
    const upload = await Upload.findById(uploadId);
    
    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    
    res.json(upload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upload status' });
  }
};

export const getUserUploads = async (req: AuthRequest, res: Response) => {
  try {
    const email = req.user?.email;
    const userId = req.userId;

    if (!email && !userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Match uploads where uploadedBy equals the email or the userId (for older records)
    const queryValues = [] as string[];
    if (email) queryValues.push(email);
    if (userId) queryValues.push(userId);

    const uploads = await Upload.find({ uploadedBy: { $in: queryValues } }).sort({ createdAt: -1 });
    
    res.json(uploads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
};
