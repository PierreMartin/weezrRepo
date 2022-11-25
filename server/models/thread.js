import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
    author: { type: String, ref: 'User' },
    participants: [{ type: String, ref: 'User' }]
    // participantsWhoSentRequestsPrivatePhotos: [{ type: String, ref: 'User' }]
});

export const Thread = mongoose.model('Thread', ThreadSchema);
