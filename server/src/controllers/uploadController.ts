import { Response } from 'express';
import { Upload } from '../models/Upload.js';
import { Manuscript } from '../models/Manuscript.js';
import { uploadImageToImageKit } from '../utils/imagekit.js';
import sharp from 'sharp';
import { generateUniqueFileName } from '../middleware/upload.js';
import { AuthRequest } from '../middleware/auth.js';
import { processManuscriptSync } from '../utils/manuscriptProcessor.js';

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

    // Only title, author, and origin are required
    // Language, category, description will be auto-detected by AI
    if (!title || !author || !origin) {
      return res.status(400).json({ error: 'Missing required fields: title, author, and origin' });
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

    const manuscriptUserId = req.userId || req.user?.email || '';

    // Create placeholder manuscript
    // AI will auto-detect language, category, and enhance description
    const placeholderManuscript = new Manuscript({
      userId: manuscriptUserId,
      title,
      author,
      description: description || 'AI analysis in progress...',
      category: category || 'General',
      origin,
      language: language || 'Auto-detecting...',
      location: location || '',
      imageUrl,
      summary: '',
      tags: ['ai-processing'],
      status: 'published',
    });

    await placeholderManuscript.save();

    // Link upload -> manuscript
    upload.manuscriptId = placeholderManuscript._id.toString();
    await upload.save();

    // Process with AI synchronously (no Redis required)
    try {
      await processManuscriptSync(
        placeholderManuscript._id.toString(),
        upload._id.toString(),
        optimizedUrl
      );

      res.status(201).json({
        uploadId: upload._id,
        manuscriptId: placeholderManuscript._id,
        message: 'Manuscript uploaded and processed successfully',
        imageUrl,
        optimizedUrl: upload.optimizedUrl,
        thumbnailUrl: upload.thumbnailUrl,
      });
    } catch (processingError: any) {
      console.error('AI processing error:', processingError);
      // Upload succeeded but processing failed
      res.status(201).json({
        uploadId: upload._id,
        manuscriptId: placeholderManuscript._id,
        message: 'Manuscript uploaded but AI processing failed',
        error: processingError.message,
        imageUrl,
        optimizedUrl: upload.optimizedUrl,
        thumbnailUrl: upload.thumbnailUrl,
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload manuscript' });
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
