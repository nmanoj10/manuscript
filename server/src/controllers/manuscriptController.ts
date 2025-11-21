import { Response } from 'express';
import { Manuscript } from '../models/Manuscript.js';
import { AuthRequest } from '../middleware/auth.js';
import { isVisionConfigured, extractTextWithVision } from '../utils/vision.js';

export const getAllManuscripts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, language, search, userId, page = 1, limit = 12 } = req.query;
    
    const filter: any = { status: 'published' };
    
    // Filter by userId if provided
    if (userId) {
      filter.userId = userId;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (language) {
      filter.language = language;
    }
    
      if (search) {
        // Prefer full-text $text search (includes OCR text) when available
        // If the MongoDB text index is present, this will run a full-text search across indexed fields
        filter.$text = { $search: String(search) };
        // Also allow legacy regex fallback for partial matches
        // (This will be ignored if $text matches are used by MongoDB)
        // filter.$or = [
        //   { title: { $regex: search, $options: 'i' } },
        //   { author: { $regex: search, $options: 'i' } },
        //   { description: { $regex: search, $options: 'i' } },
        // ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
      // If using $text search, sort by text score relevance
      let query = Manuscript.find(filter);
      if (filter.$text) {
        query = Manuscript.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' }, createdAt: -1 });
      } else {
        query = Manuscript.find(filter).sort({ createdAt: -1 });
      }
      const manuscripts = await query.skip(skip).limit(Number(limit));
    
    const total = await Manuscript.countDocuments(filter);
    
    res.json({
      data: manuscripts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manuscripts' });
  }
};
  // When using $text, countDocuments with the same filter is appropriate

export const getManuscriptById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const manuscript = await Manuscript.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }
    
    res.json(manuscript);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manuscript' });
  }
};

export const createManuscript = async (req: AuthRequest, res: Response) => {
  try {
    const { title, author, description, category, origin, language, imageUrl, location, summary, tags } = req.body;
    
    if (!req.userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    const manuscript = new Manuscript({
      userId: req.userId,
      title,
      author,
      description,
      category,
      origin,
      language,
      location: location || '',
      imageUrl,
      summary,
      tags: tags || [],
      status: 'published',
    });
    
    await manuscript.save();
    
    res.status(201).json(manuscript);
  } catch (error) {
    console.error('Create manuscript error:', error);
    res.status(500).json({ error: 'Failed to create manuscript' });
  }
};

export const updateManuscript = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const manuscript = await Manuscript.findByIdAndUpdate(id, updates, { new: true });
    
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }
    
    res.json(manuscript);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update manuscript' });
  }
};

export const deleteManuscript = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const manuscript = await Manuscript.findById(id);
    
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }
    
    // Check ownership or admin role
    if (manuscript.userId !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this manuscript' });
    }
    
    await Manuscript.findByIdAndDelete(id);
    
    res.json({ message: 'Manuscript deleted successfully' });
  } catch (error) {
    console.error('Delete manuscript error:', error);
    res.status(500).json({ error: 'Failed to delete manuscript' });
  }
};

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Manuscript.distinct('category', { status: 'published' });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getLanguages = async (req: AuthRequest, res: Response) => {
  try {
    const languages = await Manuscript.distinct('language', { status: 'published' });
    res.json({ languages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
};

export const reRunOcr = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const manuscript = await Manuscript.findById(id);
    if (!manuscript) {
      return res.status(404).json({ error: 'Manuscript not found' });
    }

    // Only owner or admin may re-run OCR
    if (manuscript.userId !== req.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to run OCR on this manuscript' });
    }

    if (!isVisionConfigured()) {
      return res.status(400).json({ error: 'Google Vision not configured on server' });
    }

    if (!manuscript.imageUrl) {
      return res.status(400).json({ error: 'No image URL available for this manuscript' });
    }

    // Fetch image bytes
    const resp = await fetch(manuscript.imageUrl);
    if (!resp.ok) {
      return res.status(502).json({ error: 'Failed to fetch manuscript image for OCR' });
    }

    const arrayBuffer = await resp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ocrText = await extractTextWithVision(buffer);

    manuscript.ocrText = ocrText || manuscript.ocrText;
    await manuscript.save();

    res.json({ message: 'OCR completed', ocrText });
  } catch (error) {
    console.error('Re-run OCR error:', error);
    res.status(500).json({ error: 'Failed to re-run OCR' });
  }
};
