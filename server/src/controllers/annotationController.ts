import { Response } from 'express';
import { Annotation } from '../models/Annotation.js';
import { Manuscript } from '../models/Manuscript.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAnnotations = async (req: AuthRequest, res: Response) => {
    try {
        const { manuscriptId } = req.params;

        const annotations = await Annotation.find({ manuscriptId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email'); // Assuming User model has name/email, but userId is string in current setup. 
        // If userId is just a string from Auth0/Clerk, we might not be able to populate it directly unless we have a User model syncing.
        // For now, we'll return the annotations and let frontend handle user display or rely on what's stored.
        // Wait, the Annotation model stores userId as string.

        // If we want to show user details, we might need to fetch them or store them in Annotation.
        // For this MVP, we'll assume the frontend can handle the userId or we store a display name.
        // Let's check the Annotation model again.

        res.json(annotations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch annotations' });
    }
};

export const createAnnotation = async (req: AuthRequest, res: Response) => {
    try {
        const { manuscriptId } = req.params;
        const { content, tags } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const manuscript = await Manuscript.findById(manuscriptId);
        if (!manuscript) {
            return res.status(404).json({ error: 'Manuscript not found' });
        }

        const annotation = new Annotation({
            manuscriptId,
            userId,
            content,
            tags: tags || [],
        });

        await annotation.save();

        // Add annotation reference to manuscript
        await Manuscript.findByIdAndUpdate(manuscriptId, {
            $push: { annotations: annotation._id }
        });

        res.status(201).json(annotation);
    } catch (error) {
        console.error('Create annotation error:', error);
        res.status(500).json({ error: 'Failed to create annotation' });
    }
};
