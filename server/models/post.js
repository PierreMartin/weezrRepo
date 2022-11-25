import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    content: { type: String, default: '' },
    category: { type: String },
    isPrivate: { type: Boolean, default: false },
    createdAt: { type: Date },
    modifiedAt: { type: Date }
});

export const Post = mongoose.model('Post', PostSchema);
