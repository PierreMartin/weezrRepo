import mongoose from 'mongoose';

const userInterBlockSchema = new mongoose.Schema({
    entityName: { type: String, default: 'UserInterBlock' },
    senderId: { type: mongoose.ObjectId },
    receiverId: { type: mongoose.ObjectId },
    at: { type: Date },
    isSeenByReceiver: { type: Boolean, default: false }
});

userInterBlockSchema.virtual('sender', {
    ref: 'User',
    localField: 'senderId',
    foreignField: '_id',
    justOne: true
});

userInterBlockSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiverId',
    foreignField: '_id',
    justOne: true
});

export const UserInterBlock = mongoose.model('UserInterBlock', userInterBlockSchema);
