import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    email: { type: String, lowercase: true, trim: true },
    isEmailVerified: { type: Boolean },
    password: { type: String },
    incorrectPasswordInput: { type: Number, default: 0 },
    phone: {
        number: { type: String },
        countryId: { type: String },
        countryCode: { type: String },
        isVerified: { type: Boolean }
    },
    gender: { type: String, default: '' },
    birthAt: { type: Date },
    displayName: { type: String, default: '' },
    isOnboardingNeverUsed: { type: Boolean, default: true },
    about: {
        aboutMe: String,
        desiredMeetingType: String,
        sexualOrientation: String,
        relationship: String,
        spokenLanguages: String,
        children: String
    },
    poi: [String], // pointOfInterest, tags
    career: {
        job: String,
        employer: String,
        school: String
    },
    physicalAppearance: {
        height: Number,
        weight: Number,
        tattoo: String,
        hairiness: String,
        beard: String
    },
    preferencesFilter: {
        desiredGender: { type: String, default: 'everybody' },
        desiredAgeRange: { type: [Number] },
        profileWithPhotoOnly: { type: Boolean }
    },
    preferencePushNotification: {
        userSendsMessage: { type: Boolean, default: false },
        userSendsFriendRequest: { type: Boolean, default: false },
    },
    preferenceAccount: {
        unitSystem: String,
        language: String,
    },
    privacy: {
        showMyDistance: { type: Boolean, default: true },
        showMyLocationOnMap: { type: Boolean, default: false },
        blockedUsers: { type: [String] },
    },
    basedLocation: { type: String, default: "" }, // City or country
    currentLocation: {
        accuracy: Number,
        course: Number,
        floor: Number,
        latitude: Number,
        longitude: Number,
        speed: Number,
        timestamp: Number,
        type: { type: String, default: "Point" },
        coordinates: { type: [Number] }
    },
    isOnline: { type: Boolean, default: false },
    roles: [String], // ['ADMIN', 'MEMBER']
    account: {
        isVerified: { type: Boolean },
        isVerifiedAt: { type: Date },
        blocked: { type: Boolean },
        blockedAt: { type: Date },
        disabled: { type: Boolean },
        disabledAt: { type: Date },
        deleted: { type: Boolean },
        deletedAt: { type: Date },
        lastLoginAt: { type: Date },
        createdAt: { type: Date },
        modifiedAt: { type: Date }
    },
    images: {
        forwardFileId: { type: String },
        list: [{
            fileId: String,
            size_40_40: String, // Small, for mini preview in chat, comments, ...
            size_130_130: String, // Medium, for grids
            size_320_400: String, // Large, for full size previews
            provider: { type: String, default: 'local' },
            album: { type: String, default: 'public' }
        }]
    },
    tokens: [String],
    provider: { type: String, default: 'local' }
});

UserSchema.index({ 'currentLocation.coordinates': '2dsphere' });

// AuthPassport:
function encryptPassword(next) {
    const user = this;
    if (!user.isModified('password')) { return next(); }

    return bcrypt.genSalt(5, (saltErr, salt) => {
        if (saltErr) { return next(saltErr); }

        return bcrypt.hash(user.password, salt, (hashErr, hash) => {
            if (hashErr) { return next(hashErr); }

            user.password = hash; // Store hash in DB
            return next();
        });
    });
}

UserSchema.pre('save', encryptPassword);

export const User = mongoose.model('User', UserSchema);
