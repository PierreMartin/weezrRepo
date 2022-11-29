import mongoose from 'mongoose';

const ThreadMessageSchema = new mongoose.Schema({
    author: { type: String, ref: 'User' },
    threadId: { type: mongoose.ObjectId },
    // content: { type: String, default: '' },
    text: String,
    image: String,
    video: String,
    audio: String,
    location: Object,
    requestId: { type: mongoose.ObjectId },
    createdAt: { type: Date },
    sent: { type: Boolean, default: false },
    readBy: [{
        user: { type: String, ref: 'User' },
        at: { type: Date, default: null }
    }],
    replyBy: [{
        author: { type: String, ref: 'User' },
        // content: { type: String, default: '' },
        text: String,
        image: String,
        video: String,
        audio: String,
        createdAt: { type: Date },
        sent: { type: Boolean, default: false },
        readBy: [{
            user: { type: String, ref: 'User' },
            at: { type: Date, default: null }
        }]
    }]
});

ThreadMessageSchema.virtual('request', {
    ref: 'UserInterSendRequest',
    localField: 'requestId',
    foreignField: '_id',
    justOne: true
});

export const ThreadMessage = mongoose.model('ThreadMessage', ThreadMessageSchema);
