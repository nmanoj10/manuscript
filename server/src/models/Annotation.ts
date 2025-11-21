import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnotation extends Document {
    manuscriptId: mongoose.Types.ObjectId;
    userId: string;
    content: string;
    tags: string[];
    upvotes: number;
    createdAt: Date;
    updatedAt: Date;
}

const AnnotationSchema = new Schema<IAnnotation>(
    {
        manuscriptId: { type: Schema.Types.ObjectId, ref: 'Manuscript', required: true, index: true },
        userId: { type: String, required: true },
        content: { type: String, required: true },
        tags: [{ type: String }],
        upvotes: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const Annotation = mongoose.model<IAnnotation>('Annotation', AnnotationSchema);
