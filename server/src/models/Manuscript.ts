import mongoose, { Schema, Document } from 'mongoose';

export interface IManuscript extends Document {
  userId: string;
  title: string;
  author?: string;
  description: string;
  category: string; // subjectCategory
  origin: string; // region
  language: string;
  scriptType?: string; // detectedScript
  estimatedCentury?: string;
  materialType?: string;

  // OCR fields
  ocrText?: string;
  cleanedOcrText?: string;
  detectedLanguage?: string;

  // Enhanced summaries
  shortSummary?: string; // 1-2 sentences
  detailedSummary?: string[]; // 3-5 bullet points

  // Content analysis
  keywords?: string[]; // Top 10 keywords
  topics?: string[]; // Multiple topic classifications

  // Sentiment analysis
  sentiment?: {
    tone: string;
    score: number;
    description: string;
  };

  // Named entity extraction
  entities?: {
    people: string[];
    places: string[];
    dates: string[];
    organizations: string[];
  };

  // Document structure
  outline?: string[]; // Structured outline
  highlights?: string[]; // 5-10 important sentences

  // Translation
  translatedText?: {
    language: string;
    text: string;
  };

  confidenceScores?: {
    script?: number;
    language?: number;
    century?: number;
    region?: number;
  };
  imageUrl: string;
  imageHint?: string;
  fileUrl?: string;
  summary?: string; // Legacy field
  location?: string; // Physical location/museum
  status: 'draft' | 'published' | 'archived' | 'processing';
  views: number;
  tags: string[];
  annotations: mongoose.Types.ObjectId[];
  metadataHistory?: Array<{
    updatedBy: string;
    updatedAt: Date;
    changes: any;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ManuscriptSchema = new Schema<IManuscript>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, index: true },
    author: { type: String, default: '' },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    origin: { type: String, required: true },
    language: { type: String, required: true },
    scriptType: { type: String, default: '' },
    estimatedCentury: { type: String, default: '' },
    materialType: { type: String, default: '' },

    // OCR fields
    ocrText: { type: String, default: '' },
    cleanedOcrText: { type: String, default: '' },
    detectedLanguage: { type: String, default: '' },

    // Enhanced summaries
    shortSummary: { type: String, default: '' },
    detailedSummary: [{ type: String }],

    // Content analysis
    keywords: [{ type: String }],
    topics: [{ type: String }],

    // Sentiment analysis
    sentiment: {
      tone: { type: String, default: 'neutral' },
      score: { type: Number, default: 0.5 },
      description: { type: String, default: '' },
    },

    // Named entity extraction
    entities: {
      people: [{ type: String }],
      places: [{ type: String }],
      dates: [{ type: String }],
      organizations: [{ type: String }],
    },

    // Document structure
    outline: [{ type: String }],
    highlights: [{ type: String }],

    // Translation
    translatedText: {
      language: String,
      text: String,
    },

    confidenceScores: {
      script: Number,
      language: Number,
      century: Number,
      region: Number,
    },
    imageUrl: { type: String, required: true },
    imageHint: String,
    fileUrl: String,
    summary: String, // Legacy field
    location: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'processing'],
      default: 'published'
    },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    annotations: [{ type: Schema.Types.ObjectId, ref: 'Annotation' }],
    metadataHistory: [{
      updatedBy: String,
      updatedAt: Date,
      changes: Schema.Types.Mixed,
    }],
  },
  { timestamps: true }
);

// Create a text index for full-text search across title, author, description and OCR text
ManuscriptSchema.index({ title: 'text', author: 'text', description: 'text', ocrText: 'text', tags: 'text' });

export const Manuscript = mongoose.model<IManuscript>('Manuscript', ManuscriptSchema);
