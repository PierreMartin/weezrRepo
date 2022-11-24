import * as React from 'react';
import { useFocusEffect } from "@react-navigation/native";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import RNLocation from "react-native-location";
import _ from "lodash";
import { Center } from "native-base";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { updateUserAction} from "../reduxActions/user";
import {
    setCountAllNotSeenLikesAction,
    setCountAllNotSeenRequestsAction,
    setCountAllUnreadMessagesAction,
    setCountAllNotSeenPrimaryNotificationsAction
} from "../reduxActions/notifications";
import {
    setRealtimeNewLikeAction,
    newMessageAction,
    newThreadAction,
    setRealtimeNewRequestAction,
    setRealtimeNewPrimaryNotificationAction
} from "../reduxActions/realtimeData";
import BottomTabNavigator from "../navigation/BottomTabNavigator";
import { Text } from "./index";
import { SocketEvents } from "../context/SocketEvents";
import { NotificationsContext } from "../context/NotificationsContext";
import { IThread, IUser } from "../entities";
import { States } from "../reduxReducers/states";
import getStyles from "./GetDataComponent.styles";

const styles = getStyles();

interface IGetLocationComponent {
    me: IUser;
    updateUserActionProps: (data: any) => any;
    setCountAllUnreadMessagesActionProps: (dataForFetchQuery: any, dataForUpdateState?: number) => any;
    setCountAllNotSeenLikesActionProps: (dataForFetchQuery: any, dataForUpdateState?: number) => any;
    setCountAllNotSeenRequestsActionProps: (dataForFetchQuery: any, dataForUpdateState?: number) => any;
    setCountAllNotSeenPrimaryNotificationsActionProps: (dataForFetchQuery: any, dataForUpdateState?: any) => any;
    realtimeNewMessage: States.INewMessage;
    realtimeNewThread: States.INewThread;
    realtimeNewLike: States.INewLike;
    realtimeNewRequest: States.INewRequest;
    realtimeNewPrimaryNotification: States.INewPrimaryNotification;
    realtimeNewBlock: States.INewBlock;
    newMessageActionProps: (data: any) => void;
    newThreadActionProps: (data?: any) => void;
    setRealtimeNewLikeActionProps: (data?: any) => void;
    setRealtimeNewRequestActionProps: (data?: any) => void;
    setRealtimeNewPrimaryNotificationActionProps: (data?: any) => void;
    countAllUnreadMessages: number;
    countAllNotSeenPrimaryNotifications: number;
    countAllNotSeenLikes: number;
    countAllNotSeenVisitors: number;
    countAllNotSeenRequests: number;
    countAllNotSeenFollowers: number;
    idsAllNotSeenVisitors?: string[];
}

const THREADS = gql`
    query ($filter: Thread_Filter, $offset: Int, $limit: Int) {
        threads(filter: $filter, offset: $offset, limit: $limit) {
            data {
                _id
                unreadMessages
            }
        }
    }
`;

const UPDATE_LOCATION_USER = gql`
    mutation ($filter: User_Filter, $data: User_Data) {
        updateUser(filter: $filter, data: $data) {
            updatedPageInfo {
                success
                message
            }
            updatedData {
                id
                currentLocation {
                    latitude
                    longitude
                    coordinates
                }
            }
        }
    }
`;

function GetDataComponent({
    me,
    updateUserActionProps,
    setCountAllUnreadMessagesActionProps,
    setCountAllNotSeenLikesActionProps,
    setCountAllNotSeenRequestsActionProps,
    setCountAllNotSeenPrimaryNotificationsActionProps,
    realtimeNewMessage,
    realtimeNewThread,
    realtimeNewLike,
    realtimeNewRequest,
    realtimeNewPrimaryNotification,
    realtimeNewBlock,
    countAllUnreadMessages,
    countAllNotSeenPrimaryNotifications,
    countAllNotSeenLikes,
    countAllNotSeenRequests,
    idsAllNotSeenVisitors,
    newMessageActionProps,
    newThreadActionProps,
    setRealtimeNewLikeActionProps,
    setRealtimeNewRequestActionProps,
    setRealtimeNewPrimaryNotificationActionProps
}: IGetLocationComponent) {
    const [getThreads, { data: threadsData }] = useLazyQuery(THREADS, { fetchPolicy: 'network-only' });
    const [updateUser, { error }] = useMutation(UPDATE_LOCATION_USER);

    const socketEvents = React.useContext(SocketEvents);
    const notificationsContext = React.useContext(NotificationsContext);

    const threadsDataRef: any = React.useRef();
    const meRef: any = React.useRef();
    const realtimeNewThreadRef: any = React.useRef();

    React.useEffect(() => {
        threadsDataRef.current = threadsData;
    }, [threadsData]);

    React.useEffect(() => {
        meRef.current = me;
    }, [me]);

    React.useEffect(() => {
        realtimeNewThreadRef.current = realtimeNewThread;
    }, [realtimeNewThread]);

    // Get location:
    React.useEffect(() => {
        let unsubscribe: any = () => null;
        const refreshInterval = 60 * 1000 * 3; // 3 minutes

        RNLocation.configure({
            distanceFilter: 20, // meter
            desiredAccuracy: {
                ios: "best",
                android: "highAccuracy"
            },

            // Android only:
            interval: refreshInterval,

            // iOS Only:
            allowsBackgroundLocationUpdates: true
        });

        const setCurrentLocation = _.throttle((location: any) => {
            // console.log('location throttled ===>', location);
            updateUser({
                variables: {
                    filter: {
                        filterUpdate: {
                            _id: me._id
                        }
                    },
                    data: {
                        dataUpdate: {
                            currentLocation: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                accuracy: location.accuracy,
                                timestamp: location.timestamp,
                                type: 'Point',
                                coordinates: [location.longitude, location.latitude]
                            }
                        }
                    }
                }
            }).then((res: any) => {
                const currentLocation = res?.data?.updateUser?.updatedData?.currentLocation;
                if (currentLocation) {
                    updateUserActionProps({ currentLocation: { ...me.currentLocation, ...currentLocation } });
                }
            });
        }, refreshInterval);

        RNLocation.requestPermission({
            ios: "whenInUse",
            android: {
                detail: "coarse",
                rationale: {
                    title: "We need to access your location",
                    message: "We use your location to show where you are on the map",
                    buttonPositive: "OK",
                    buttonNegative: "Cancel"
                }
            }
        }).then((granted) => {
            if (granted) {
                unsubscribe = RNLocation.subscribeToLocationUpdates((locations) => {
                    const location = locations[0];
                    if (location && me._id) { setCurrentLocation(location); }
                });
            }
        });

        return () => {
            if (unsubscribe) { unsubscribe(); }
        };
    }, []);

    // Get all notifications:
    useFocusEffect(
        React.useCallback(() => {
            if (me?._id && notificationsContext?.count?.all) {
                notificationsContext.count.all(me._id);
            }
        }, [])
    );

    // Get all threads (used for count all unread messages in real time):
    useFocusEffect(
        React.useCallback(() => {
            const variables: any = {};
            variables.filter = {
                filterMain: {
                    participants: { $in: [me?._id] }
                },
                filterCountUnread: {
                    $and: [
                        { author: { $ne: me?._id } },
                        { 'readBy.user': { $nin: [null, me?._id] } },
                    ]
                }
            };

            // TODO if we are in ThreadDetailScreenComponent, don't load getThreads() here:
            getThreads({ variables });
        }, [])
    );

    // Socket events - join room type user (used for receive new threads and for user interactions):
    React.useEffect(() => {
        if (me?._id) { socketEvents.emit.joinUser(me._id); }

        return () => { if (meRef.current?._id) { socketEvents.emit.leaveUser(meRef.current._id); } };
    }, []);

    // Socket events - join room type thread:
    useFocusEffect(
        React.useCallback(() => {
            const threadIdsToAdd = threadsData?.threads?.data?.map((thread: IThread) => thread?._id);
            if (threadIdsToAdd?.length) { socketEvents.emit.joinThreads(threadIdsToAdd); }

            return () => {
                const threadIdsToRemove = threadsDataRef.current?.threads?.data?.map((thread: IThread) => thread?._id);
                if (threadIdsToRemove?.length) { socketEvents.emit.leaveThreads(threadIdsToRemove); }
            };
        }, [threadsData])
    );

    // Socket events, new thread
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewThread) {
                console.log('[socket] newThread');

                const isNewThreadCreatedForMe = !!realtimeNewThread.participantsIds?.find((participantsId: string) => participantsId === me?._id);

                if (isNewThreadCreatedForMe) {
                    if (realtimeNewThread.threadId) {
                        socketEvents.emit.joinThreads([realtimeNewThread.threadId]);
                    }
                }

                // reset redux:
                newThreadActionProps(null);
            }

            return () => {
                const isNewThreadCreatedForMe = !!realtimeNewThreadRef.current?.participantsIds?.find((participantsId: string) => participantsId === me?._id);
                if (isNewThreadCreatedForMe && realtimeNewThreadRef.current?.theadId) { socketEvents.emit.leaveThreads([realtimeNewThreadRef.current.theadId]); }
            };
        }, [realtimeNewThread])
    );

    // Socket events, new message
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewMessage) {
                console.log('[socket] newMessage');

                if (realtimeNewMessage.isFirstMessageInThread) {
                    // If new thread created - This is the first message in this thread at this state
                    console.log('[socket] newThread');
                }

                // Update ALL count unread messages:
                let nextCountAllUnreadMessages = 1;
                if (typeof countAllUnreadMessages === 'number') {
                    nextCountAllUnreadMessages = countAllUnreadMessages + 1;
                }

                setCountAllUnreadMessagesActionProps(null, nextCountAllUnreadMessages);

                // reset redux:
                newMessageActionProps(null);
            }
        }, [realtimeNewMessage])
    );

    // Socket events, new like
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewLike) {
                // If new like received:
                console.log('[socket] newLike');

                // Update ALL not seen likes:
                let count = typeof countAllNotSeenLikes === 'number' ? countAllNotSeenLikes : 0;
                if (!realtimeNewLike.isRemoved) {
                    count = count + 1;
                } else if (count > 0) {
                    count = count - 1;
                }

                setCountAllNotSeenLikesActionProps(null, count);

                // reset realtimeNewLike:
                setRealtimeNewLikeActionProps(null);
            }
        }, [realtimeNewLike])
    );

    // Socket events, new visit
    /*
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewVisit) {
                // If new visit received:
                console.log('[socket] newVisit');

                // Update ALL not seen visits:
                const ids = [...idsAllNotSeenVisitors || []];
                let count = typeof countAllNotSeenVisitors === 'number' ? countAllNotSeenVisitors : 0;
                let canIncrement = true;

                if (realtimeNewVisit.hasAlreadyInteracted && ids.includes(realtimeNewVisit.id)) {
                    canIncrement = false;
                }

                if (canIncrement) {
                    count = count + 1;
                    ids.push(realtimeNewVisit.id);
                }

                setCountAllNotSeenVisitorsActionProps(null, { count, ids });

                // reset realtimeNewVisit:
                setRealtimeNewVisitActionProps(null);
            }
        }, [realtimeNewVisit])
    );
    */

    // Socket events, new primary notifications
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewPrimaryNotification) {
                // If new primary notifications received:
                console.log('[socket] newPrimaryNotification');

                const nextIdsAllNotSeenVisitors = [...idsAllNotSeenVisitors || []];
                let count = typeof countAllNotSeenPrimaryNotifications === 'number' ? countAllNotSeenPrimaryNotifications : 0;
                let increment = 1;
                let canIncrement = true;

                switch (realtimeNewPrimaryNotification.entityName) {
                    case 'UserInterVisit':
                        // If user has already visited me and notification not seen:
                        if (realtimeNewPrimaryNotification.hasAlreadyInteracted && nextIdsAllNotSeenVisitors.includes(realtimeNewPrimaryNotification.id)) {
                            canIncrement = false;
                        }
                        break;
                    case 'UserInterFollow':
                        // ...
                        break;
                    default:
                        break;
                }

                if (realtimeNewPrimaryNotification.isRemoved) {
                    increment = -1;
                }

                if (canIncrement) {
                    count = count + increment;
                    if (count < 0) { count = 0; }

                    switch (realtimeNewPrimaryNotification.entityName) {
                        case 'UserInterVisit':
                            nextIdsAllNotSeenVisitors.push(realtimeNewPrimaryNotification.id);
                            break;
                        default:
                            break;
                    }
                }

                const param = {
                    idsAllNotSeenVisitors: nextIdsAllNotSeenVisitors,
                    // countAllNotSeenVisitors: 99, // ?
                    // countAllNotSeenFollowers: 99, // ?
                    countAllNotSeenPrimaryNotifications: count
                };

                setCountAllNotSeenPrimaryNotificationsActionProps(null, param);

                // reset redux:
                setRealtimeNewPrimaryNotificationActionProps(null);
            }
        }, [realtimeNewPrimaryNotification])
    );

    // Socket events, new request
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewRequest) {
                // If new request received:
                console.log('[socket] newRequest');

                // Update ALL not seen requests:
                let count = typeof countAllNotSeenRequests === 'number' ? countAllNotSeenRequests : 0;
                if (!realtimeNewRequest.isRemoved) {
                    count = count + 1;
                } else if (count > 0) {
                    count = count - 1;
                }

                setCountAllNotSeenRequestsActionProps(null, count);

                // reset realtimeNewRequest:
                setRealtimeNewRequestActionProps(null);
            }
        }, [realtimeNewRequest])
    );

    // Socket events, new block:
    useFocusEffect(
        React.useCallback(() => {
            if (realtimeNewBlock) {
                // If new block received - Update count all notifications:
                console.log('[socket] newBlock');

                if (me?._id && notificationsContext?.count?.all) {
                    notificationsContext.count.all(me._id);
                }

                // reset redux:
                setRealtimeNewLikeActionProps(null);
            }
        }, [realtimeNewBlock])
    );

    if (error) {
        console.error(error);
        // TODO Display toast
        // return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;
    }

    if (!me) return <Center style={styles.container}><Text>No authenticated</Text></Center>;

    return (
        <BottomTabNavigator
            notifications={{
                countAllUnreadMessages,
                countAllNotSeenPrimaryNotifications,
                countAllNotSeenLikes,
                // countAllNotSeenVisitors,
                // countAllNotSeenFollowers
                countAllNotSeenRequests
            }}
        />
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me,
        countAllUnreadMessages: state.notifications.countAllUnreadMessages,
        countAllNotSeenPrimaryNotifications: state.notifications.countAllNotSeenPrimaryNotifications,
        countAllNotSeenLikes: state.notifications.countAllNotSeenLikes,
        countAllNotSeenRequests: state.notifications.countAllNotSeenRequests,
        idsAllNotSeenVisitors: state.notifications.idsAllNotSeenVisitors,
        realtimeNewMessage: state.realtimeData.newMessage,
        realtimeNewThread: state.realtimeData.newThread,
        realtimeNewLike: state.realtimeData.newLike,
        realtimeNewRequest: state.realtimeData.newRequest,
        realtimeNewBlock: state.realtimeData.newBlock,
        realtimeNewPrimaryNotification: state.realtimeData.newPrimaryNotification,
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateUserActionProps: bindActionCreators(updateUserAction, dispatch),
        setCountAllUnreadMessagesActionProps: bindActionCreators(setCountAllUnreadMessagesAction, dispatch),
        setCountAllNotSeenLikesActionProps: bindActionCreators(setCountAllNotSeenLikesAction, dispatch),
        setCountAllNotSeenRequestsActionProps: bindActionCreators(setCountAllNotSeenRequestsAction, dispatch),
        setCountAllNotSeenPrimaryNotificationsActionProps: bindActionCreators(setCountAllNotSeenPrimaryNotificationsAction, dispatch),
        newMessageActionProps: bindActionCreators(newMessageAction, dispatch),
        newThreadActionProps: bindActionCreators(newThreadAction, dispatch),
        setRealtimeNewLikeActionProps: bindActionCreators(setRealtimeNewLikeAction, dispatch),
        setRealtimeNewRequestActionProps: bindActionCreators(setRealtimeNewRequestAction, dispatch),
        setRealtimeNewPrimaryNotificationActionProps: bindActionCreators(setRealtimeNewPrimaryNotificationAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GetDataComponent);
