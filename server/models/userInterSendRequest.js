import mongoose from 'mongoose';

const userInterSendRequestSchema = new mongoose.Schema({
    entityName: { type: String, default: 'UserInterSendRequest' },
    senderId: { type: mongoose.ObjectId },
    receiverId: { type: mongoose.ObjectId },
    at: { type: Date },
    isSeenByReceiver: { type: Boolean, default: false },
    privatePhotosGranted: { type: String, default: 'null' }, // 'granted' | 'declined' | 'null'
    privatePhotosGrantedAt: { type: Date },
});

userInterSendRequestSchema.virtual('sender', {
    ref: 'User',
    localField: 'senderId',
    foreignField: '_id',
    justOne: true
});

userInterSendRequestSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiverId',
    foreignField: '_id',
    justOne: true
});

export const UserInterSendRequest = mongoose.model('UserInterSendRequest', userInterSendRequestSchema);
