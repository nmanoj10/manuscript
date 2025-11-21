import mongoose, { Schema, Document } from 'mongoose';

export interface IUpload extends Document {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string; // email
  imageUrl: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  manuscriptId?: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const UploadSchema = new Schema<IUpload>(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, required: true },
    imageUrl: { type: String, required: true },
    fileUrl: String,
    thumbnailUrl: { type: String, default: '' },
    optimizedUrl: { type: String, default: '' },
    manuscriptId: { type: String, default: '' },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  },
  { timestamps: true }
);

export const Upload = mongoose.model<IUpload>('Upload', UploadSchema);
