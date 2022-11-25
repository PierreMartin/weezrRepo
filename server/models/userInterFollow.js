import mongoose from 'mongoose';

const userInterFollowSchema = new mongoose.Schema({
    entityName: { type: String, default: 'UserInterFollow' },
    senderId: { type: mongoose.ObjectId },
    receiverId: { type: mongoose.ObjectId },
    at: { type: Date },
    isSeenByReceiver: { type: Boolean, default: false }
});

userInterFollowSchema.virtual('sender', {
    ref: 'User',
    localField: 'senderId',
    foreignField: '_id',
    justOne: true
});

userInterFollowSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiverId',
    foreignField: '_id',
    justOne: true
});

export const UserInterFollow = mongoose.model('UserInterFollow', userInterFollowSchema);
