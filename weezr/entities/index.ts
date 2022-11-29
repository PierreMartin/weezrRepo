/* eslint-disable @typescript-eslint/naming-convention */

interface IEntity {
    id?: string;
    _id?: string;
}

export type ILanguage = 'en' | 'fr';
export type IAlbum = 'public' | 'private' | 'threadMessage' | 'album1' | 'album2';
export type PrivatePhotosGranted = 'granted' | 'declined' | 'null';

export interface ILocation {
    accuracy?: number;
    course?: number;
    floor?: number;
    latitude: number;
    longitude: number;
    speed?: number;
    timestamp?: number;
    coordinates?: number[];
    type?: string
}

export interface IUserImagesList {
    fileId: string;
    size_40_40: string; // Small, for mini preview in chat, comments, ...
    size_130_130: string; // Medium, for grids
    size_320_400: string; // Large, for full size previews
    provider?: string;
    album?: IAlbum;
    createdAt?: Date;
}

export interface IUserInteraction {
    id: string;
    entityName?: string;
    senderId?: string;
    sender?: IUser;
    receiverId?: string;
    receiver?: IUser;
    at: Date;
    type?: string;
    isMutual?: boolean;
    privatePhotosGranted?: PrivatePhotosGranted;
    privatePhotosGrantedAt?: Date;
    isRemoved?: boolean;
    isSeenByReceiver?: boolean;
    hasAlreadyInteracted?: boolean;
    threadId?: string;
    isNewThread?: boolean;
    // wsRoomId?: string;
}

export interface UserInterSendLike extends IUserInteraction {}
export interface UserInterVisit extends IUserInteraction {}
export interface UserInterFollow extends IUserInteraction {}
export interface UserInterBlock extends IUserInteraction {}
export interface UserInterSendRequest extends IUserInteraction {}

export interface IUserInteractions {
    sent: IUserInteraction | null;
    received: IUserInteraction | null;
}

export interface IUser extends IEntity {
    email: string;
    displayName?: string;
    isEmailVerified?: boolean;
    incorrectPasswordInput?: number;
    isOnline?: boolean;
    isOnboardingNeverUsed: boolean;
    phone?: {
        number: string;
        countryId: string;
        countryCode: string;
        isVerified: boolean;
    };
    gender?: string;
    birthAt?: Date;
    age?: number; // client side only
    career?: {
        job?: string;
        employer?: string;
        school?: string;
    },
    physicalAppearance?: {
        height?: number;
        weight?: number;
        tattoo?: 'not' | 'some' | 'many';
        hairiness?: 'smooth' | 'shaved' | 'notVery' | 'hairy' | 'veryHairy';
        beard?: 'without' | 'threeDayBeard' | 'mustache' | 'goatee' | 'beard';
    },
    poi?: string[]; // pointOfInterest, tags
    about?: {
        aboutMe?: string;
        sexualOrientation?: string;
        spokenLanguages?: string;
        children?: string;
        relationship?: 'single' | 'married';
        desiredMeetingType?: 'meetings' | 'friends' | 'loveRelationship';
    };
    basedLocation?: string; // City or country
    currentLocation: ILocation;
    preferencesFilter?: {
        desiredGender?: string;
        desiredAgeRange?: number[];
        profileWithPhotoOnly?: boolean;
    };
    preferenceAccount?: {
        unitSystem?: 'imperial' | 'metric';
        language?: ILanguage;
    },
    distanceComparedToMe?: number;
    unreadMessages?: number | string; // Generate client side
    roles: string[]; // ['ADMIN', 'MEMBER']
    password?: string,
    account: {
        isVerified?: boolean;
        isVerifiedAt?: Date;
        blocked?: boolean;
        blockedAt?: Date;
        disabled?: boolean;
        disabledAt?: Date;
        deleted?: boolean;
        deletedAt?: Date;
        lastLoginAt: Date;
        createdAt: Date;
        modifiedAt?: Date;
    };
    images?: {
        forwardFileId?: string;
        list?: IUserImagesList[];
    };
    tokens?: string[];
    provider?: string;
    userInteractions: {
        myLike: IUserInteractions;
        myVisit: IUserInteractions;
        myBlock: IUserInteractions;
        myRequest: IUserInteractions;
        myFollow: IUserInteractions;
    },
    hasPrivatePhotos?: boolean;
}

export interface IUserPhotoThread extends IEntity {
    id: string;
    threadId: string;
    fileId: string;
    messageId?: string;
    authorId: string;
    size_40_40?: string;
    size_130_130: string;
    size_320_400: string;
}

export interface IThread extends IEntity {
    id: string;
    author: IUser; // populated
    participants: IUser[]; // populated
    unreadMessages?: number;
    latestMessage?: any;
    userInteractions: {
        myRequest: IUserInteractions;
    }
}

export interface IThreadMessage extends IEntity {
    author?: IUser | string; // populated
    user?: IUser; // populated

    text?: string;
    image?: string;
    video?: string;
    audio?: string;
    requestId?: string;
    request?: any;
    location?: ILocation;

    threadId: string;
    createdAt: Date;

    sent?: boolean;
    received?: boolean;
    pending?: boolean;

    readBy?: [{
        user: IUser | string;
        at: Date;
    }];

    replyBy?: [{
        author: IUser;

        text?: string;
        image?: string;
        video?: string;
        audio?: string;

        createdAt: Date;
        readBy?: [{
            user: IUser | string;
            at: Date;
        }];
    }];

    isFirstMessageInThread?: boolean; // Generate client side
}

export interface IEvent extends IEntity {
    author: IUser;
    participants: IUser[];
}
