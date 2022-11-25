import mongoose from 'mongoose';

const userInterVisitSchema = new mongoose.Schema({
    entityName: { type: String, default: 'UserInterVisit' },
    senderId: { type: mongoose.ObjectId },
    receiverId: { type: mongoose.ObjectId },
    at: { type: Date },
    isSeenByReceiver: { type: Boolean, default: false }
});

userInterVisitSchema.virtual('sender', {
    ref: 'User',
    localField: 'senderId',
    foreignField: '_id',
    justOne: true
});

userInterVisitSchema.virtual('receiver', {
    ref: 'User',
    localField: 'receiverId',
    foreignField: '_id',
    justOne: true
});

export const UserInterVisit = mongoose.model('UserInterVisit', userInterVisitSchema);
