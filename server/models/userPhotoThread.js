import mongoose from 'mongoose';

const userPhotoThreadSchema = new mongoose.Schema({
    threadId: String,
    fileId: String,
    messageId: String,
    authorId: String,
    size_130_130: String,
    size_320_400: String,
    createdAt: Date
});

export const UserPhotoThread = mongoose.model('UserPhotoThread', userPhotoThreadSchema);
