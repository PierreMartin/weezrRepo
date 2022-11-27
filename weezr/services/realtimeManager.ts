import { io, Socket } from 'socket.io-client';
import { Store, AnyAction } from 'redux';
import { States } from "../reduxReducers/states";
import {
    newMessageAction,
    newSeenMessagesAction,
    typingAction,
    newThreadAction,
    setRealtimeNewLikeAction,
    setRealtimeNewVisitAction,
    setRealtimeNewRequestAction,
    setRealtimeNewRequestResponseAction,
    setRealtimeNewFollowAction,
    setRealtimeNewPrimaryNotificationAction,
    setRealtimeNewBlockAction
} from "../reduxActions/realtimeData";
import { IUserInteraction } from "../entities";

export function initRealtimeService(host: string, store: Store<States.IAppState, AnyAction>) {
    return new RealtimeManager(host, store);
}

export class RealtimeManager {
    // @ts-ignore
    private socketIo: Socket;

    initialized = false;

    constructor(public host: string, protected store: Store<States.IAppState, AnyAction>) {
        this.init();
    }

    init() {
        if (!this.initialized) {
            this.initialized = true;
            this.socketIo = io(this.host, { transports: ['websocket'], reconnectionDelayMax: 60000 });
            // this.socketIo.connect();
        }
    }

    public listenersAllEvents() {
        this.socketIo.on('startTypingServer', (typingReceive: any) => {
            typingAction(typingReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('stopTypingServer', (typingReceive: any) => {
            typingAction(typingReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newMessageServer', (dataReceive: any) => {
            newMessageAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newSeenMessagesServer', (dataReceive: any) => {
            newSeenMessagesAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newThreadServer', (dataReceive: any) => {
            newThreadAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newPrimaryNotificationServer', (dataReceive: any) => {
            setRealtimeNewPrimaryNotificationAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newLikeServer', (dataReceive: any) => {
            setRealtimeNewLikeAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newVisitServer', (dataReceive: any) => {
            setRealtimeNewVisitAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newRequestServer', (dataReceive: any) => {
            setRealtimeNewRequestAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newRequestResponseServer', (dataReceive: any) => {
            setRealtimeNewRequestResponseAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newFollowServer', (dataReceive: any) => {
            setRealtimeNewFollowAction(dataReceive)(this.store.dispatch, this.store.getState);
        });

        this.socketIo.on('newBlockServer', (dataReceive: any) => {
            setRealtimeNewBlockAction(dataReceive)(this.store.dispatch, this.store.getState);
        });
    }

    public cleanupAllEvents() {
        this.socketIo.off('newThreadServer');
        this.socketIo.off('startTypingServer');
        this.socketIo.off('stopTypingServer');
        this.socketIo.off('newMessageServer');
        this.socketIo.off('newSeenMessagesServer');
        this.socketIo.off('newLikeServer');
        this.socketIo.off('newVisitServer');
        this.socketIo.off('newRequestServer');
        this.socketIo.off('newRequestResponseServer');
        this.socketIo.off('newFollowServer');
        this.socketIo.off('newPrimaryNotificationServer');
        this.socketIo.off('newBlockServer');
    }

    public socketEvents() {
        return {
            emit: {
                // --------------------------- Room type user ---------------------------
                joinUser: (userId: string) => {
                    this.socketIo.emit('joinUser', userId);
                },

                leaveUser: (userId: string) => {
                    this.socketIo.emit('leaveUser', userId);
                },

                // --------------------------- Room type userInteractions ---------------------------
                /*
                joinUserInteractions: (wsRoomIds: string[]) => {
                    this.socketIo.emit('joinUserInteractions', wsRoomIds);
                },

                leaveUserInteractions: (wsRoomIds: string[]) => {
                    this.socketIo.emit('leaveUserInteractions', wsRoomIds);
                },
                */

                // --------------------------- Room type thread ---------------------------
                joinThreads: (threadIds: string[]) => {
                    this.socketIo.emit('joinThreads', threadIds);
                },

                leaveThreads: (threadIds: string[]) => {
                    this.socketIo.emit('leaveThreads', threadIds);
                },

                // --------------------------- Events: ---------------------------
                newMessage: (data: any) => {
                    this.socketIo.emit('newMessage', data);
                },

                newSeenMessages: (data: any) => {
                    this.socketIo.emit('newSeenMessages', data);
                },

                newThread: (data: any) => {
                    this.socketIo.emit('newThread', data);
                },

                startTyping: (data: any) => {
                    this.socketIo.emit('startTyping', data);
                },

                stopTyping: (data: any) => {
                    this.socketIo.emit('stopTyping', data);
                },

                newPrimaryNotification: (data: IUserInteraction) => {
                    this.socketIo.emit('newPrimaryNotification', data);
                },

                newLike: (data: IUserInteraction) => {
                    this.socketIo.emit('newLike', data);
                },

                newVisit: (data: IUserInteraction) => {
                    this.socketIo.emit('newVisit', data);
                },

                newRequest: (data: IUserInteraction) => {
                    this.socketIo.emit('newRequest', data);
                },

                newRequestResponse: (data: IUserInteraction) => {
                    this.socketIo.emit('newRequestResponse', data);
                },

                newFollow: (data: IUserInteraction) => {
                    this.socketIo.emit('newFollow', data);
                },

                newBlock: (data: IUserInteraction) => {
                    this.socketIo.emit('newBlock', data);
                }
            },
            on: {
                // listeners case by case, don't use it, expect special cases
            },
            cleanup: {
                // don't use it, expect special cases
                newThreadServer: () => { this.socketIo.off('newThreadServer'); },
                startTypingServer: () => { this.socketIo.off('startTypingServer'); },
                stopTypingServer: () => { this.socketIo.off('stopTypingServer'); },
                newMessageServer: () => { this.socketIo.off('newMessageServer'); },
                newSeenMessagesServer: () => { this.socketIo.off('newSeenMessagesServer'); },
                newLikeServer: () => { this.socketIo.off('newLikeServer'); },
                newVisitServer: () => { this.socketIo.off('newVisitServer'); },
                newRequestServer: () => { this.socketIo.off('newRequestServer'); },
                newRequestResponseServer: () => { this.socketIo.off('newRequestResponseServer'); },
                newFollowServer: () => { this.socketIo.off('newFollowServer'); },
                newPrimaryNotificationServer: () => { this.socketIo.off('newPrimaryNotificationServer'); },
                newBlockServer: () => { this.socketIo.off('newBlockServer'); }
            }
        };
    }
}
