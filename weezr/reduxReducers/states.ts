import { IThreadMessage, IUser, IUserInteraction } from "../entities";

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace States {
    interface INotificationsState {
        countAllUnreadMessages: number;

        countAllNotSeenPrimaryNotifications: number; // Include (countAllNotSeenVisitors + countAllNotSeenFollowers)
        countAllNotSeenLikes: number;
        countAllNotSeenRequests: number;
        countAllNotSeenVisitors?: number;
        countAllNotSeenFollowers?: number;

        idsAllNotSeenVisitors?: string[];
    }

    type ICacheData = {
        index?: number;
        data: any[] | null;
    };

    interface ICacheDatas {
        users?: ICacheData;
        threads?: ICacheData;
        threadMessages?: ICacheData;
        likes?: ICacheData;
        requests?: ICacheData;
        primaryNotifications?: ICacheData;
    }

    interface IAppState {
        user: IUserState;
        authenticatedState: IAuthenticatedState;
        notifications: INotificationsState;
        realtimeData: IRealtimeData;
        cacheData?: ICacheDatas;
    }

    type IMe = IUser;
    type IMyBlockedProfiles = string[];

    interface IUserState {
        me: IMe;
        myBlockedProfiles: IMyBlockedProfiles;
    }

    type IAuthenticatedState = null | 'connected' | 'disconnected' | 'error' | 'loading';

    type ITyping = {
        isTyping: boolean;
        threadId: string;
        userId?: string;
    };

    type INewThread = any;
    type INewMessage = IThreadMessage;
    type INewLike = IUserInteraction;
    type INewVisit = IUserInteraction;
    type INewFollow = IUserInteraction;
    type INewBlock = IUserInteraction;
    type INewRequest = IUserInteraction;
    type INewPrimaryNotification = IUserInteraction;

    interface IRealtimeData {
        newThread?: INewThread;
        newMessage: INewMessage;
        newLike: INewLike;
        newVisit: INewVisit;
        newFollow: INewFollow;
        newBlock: INewBlock;
        newRequest: INewRequest;
        newRequestResponse: INewRequest;
        newPrimaryNotification: INewPrimaryNotification; // Include (newVisit + newFollow)
        typing: ITyping
    }
}
