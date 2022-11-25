import mongoose from 'mongoose';

const userInterSendLikeSchema = new mongoose.Schema({
    entityName: { type: String, default: 'UserInterSendLike' },
    senderId: { type: mongoose.ObjectId },
    receiverId: { type: mongoose.ObjectId },
    at: { type: Date },
    type: { type: String, default: 'heart' },
    isMutual: { type: Boolean, default: false },
    isSeenByReceiver: { type: Boolean, default: false }
});

userInterSendLikeSchema.virtual('sender', {
    ref: 'User', // the collection/model name
    localField: 'senderId',
    foreignField: '_id',
    justOne: true, // default is false
});

userInterSendLikeSchema.virtual('receiver', {
    ref: 'User', // the collection/model name
    localField: 'receiverId',
    foreignField: '_id',
    justOne: true, // default is false
});

export const UserInterSendLike = mongoose.model('UserInterSendLike', userInterSendLikeSchema);
