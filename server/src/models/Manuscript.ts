import mongoose, { Schema, Document } from 'mongoose';

export interface IManuscript extends Document {
  userId: string;
  title: string;
  author: string;
  description: string;
  category: string;
  origin: string;
  language: string;
  scriptType?: string;
  dateWritten?: string;
  period?: string;
  ocrText?: string;
  significance?: string;
  imageUrl: string;
  imageHint?: string;
  fileUrl?: string;
  summary?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  views: number;
  tags: string[];
}

const ManuscriptSchema = new Schema<IManuscript>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, index: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    origin: { type: String, required: true },
    language: { type: String, required: true },
      scriptType: { type: String, default: '' },
      dateWritten: { type: String, default: '' },
      period: { type: String, default: '' },
      ocrText: { type: String, default: '' },
      significance: { type: String, default: '' },
    location: { type: String, default: '' },
    imageUrl: { type: String, required: true },
      thumbnailUrl: { type: String, default: '' },
      optimizedUrl: { type: String, default: '' },
    imageHint: String,
    fileUrl: String,
    summary: String,
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Create a text index for full-text search across title, author, description and OCR text
ManuscriptSchema.index({ title: 'text', author: 'text', description: 'text', ocrText: 'text', tags: 'text' });

export const Manuscript = mongoose.model<IManuscript>('Manuscript', ManuscriptSchema);
