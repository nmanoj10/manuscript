import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'contributor';
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'contributor'], default: 'user' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
