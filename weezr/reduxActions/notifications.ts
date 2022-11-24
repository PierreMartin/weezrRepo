import { AsyncStorage } from "react-native";
import {
    COUNT_ALL_NOTSEEN_LIKES,
    COUNT_ALL_NOTSEEN_VISITORS,
    COUNT_ALL_UNREAD_MESSAGES,
    COUNT_ALL_NOTSEEN_REQUESTS,
    COUNT_ALL_NOTSEEN_PRIMARY_NOTIFICATIONS
} from "../reduxActionsTypes";
import {
    getCountAllNotSeenLikes,
    getCountAllNotSeenRequests,
    getCountAllNotSeenVisitors,
    getCountAllNotSeenPrimaryNotifications,
    getCountAllUnreadMessages
} from "../services/NotificationsService";

export function setCountAllUnreadMessagesAction(
    dataForFetchQuery: any,
    dataForUpdateState?: number
) {
    if (typeof dataForUpdateState !== 'undefined') {
        return (dispatch: any) => {
            dispatch({
                type: COUNT_ALL_UNREAD_MESSAGES,
                payload: {
                    message: 'Count all unread messages has been set',
                    countAllUnreadMessages: dataForUpdateState
                }
            });
        };
    }

    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                getCountAllUnreadMessages(token, dataForFetchQuery)
                    .then((res) => {
                        if (res?.data) {
                            dispatch({
                                type: COUNT_ALL_UNREAD_MESSAGES,
                                payload: {
                                    message: res.message,
                                    countAllUnreadMessages: res.data.countAllUnreadMessages
                                }
                            });
                        }
                    })
                    .catch((err) => console.error(err));
            }
        });
    };
}

export function setCountAllNotSeenLikesAction(
    dataForFetchQuery: any,
    dataForUpdateState?: number
) {
    if (typeof dataForUpdateState !== 'undefined') {
        return (dispatch: any) => {
            dispatch({
                type: COUNT_ALL_NOTSEEN_LIKES,
                payload: {
                    message: 'Count all not seen likes has been set',
                    countAllNotSeenLikes: dataForUpdateState
                }
            });
        };
    }

    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                getCountAllNotSeenLikes(token, dataForFetchQuery)
                    .then((res) => {
                        if (res?.data) {
                            dispatch({
                                type: COUNT_ALL_NOTSEEN_LIKES,
                                payload: {
                                    message: res.message,
                                    countAllNotSeenLikes: res.data.countAllNotSeenLikes
                                }
                            });
                        }
                    })
                    .catch((err) => console.error(err));
            }
        });
    };
}

export function setCountAllNotSeenVisitorsAction(
    dataForFetchQuery: any,
    dataForUpdateState?: any
) {
    const { count, ids } = dataForUpdateState || {};

    if (typeof count !== 'undefined') {
        return (dispatch: any) => {
            dispatch({
                type: COUNT_ALL_NOTSEEN_VISITORS,
                payload: {
                    message: 'Count all not seen visitors has been set',
                    countAllNotSeenVisitors: count,
                    idsAllNotSeenVisitors: ids
                }
            });
        };
    }

    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                getCountAllNotSeenVisitors(token, dataForFetchQuery)
                    .then((res) => {
                        if (res?.data) {
                            dispatch({
                                type: COUNT_ALL_NOTSEEN_VISITORS,
                                payload: {
                                    message: res.message,
                                    countAllNotSeenVisitors: res.data.countAllNotSeenVisitors,
                                    idsAllNotSeenVisitors: res.data.idsAllNotSeenVisitors
                                }
                            });
                        }
                    })
                    .catch((err) => console.error(err));
            }
        });
    };
}

export function setCountAllNotSeenRequestsAction(
    dataForFetchQuery: any,
    dataForUpdateState?: number
) {
    // const { count, ids } = dataForUpdateState || {};

    if (typeof dataForUpdateState !== 'undefined') {
        return (dispatch: any) => {
            dispatch({
                type: COUNT_ALL_NOTSEEN_REQUESTS,
                payload: {
                    message: 'Count all not seen requests has been set',
                    countAllNotSeenRequests: dataForUpdateState
                }
            });
        };
    }

    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                getCountAllNotSeenRequests(token, dataForFetchQuery)
                    .then((res) => {
                        if (res?.data) {
                            dispatch({
                                type: COUNT_ALL_NOTSEEN_REQUESTS,
                                payload: {
                                    message: res.message,
                                    countAllNotSeenRequests: res.data.countAllNotSeenRequests
                                }
                            });
                        }
                    })
                    .catch((err) => console.error(err));
            }
        });
    };
}

export function setCountAllNotSeenPrimaryNotificationsAction(
    dataForFetchQuery: any,
    dataForUpdateState?: any
) {
    if (typeof dataForUpdateState !== 'undefined') {
        return (dispatch: any) => {
            dispatch({
                type: COUNT_ALL_NOTSEEN_PRIMARY_NOTIFICATIONS,
                payload: {
                    message: 'Count all not seen primary notifications has been set',
                    ...dataForUpdateState
                }
            });
        };
    }

    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                getCountAllNotSeenPrimaryNotifications(token, dataForFetchQuery)
                    .then((res) => {
                        if (res?.data) {
                            dispatch({
                                type: COUNT_ALL_NOTSEEN_PRIMARY_NOTIFICATIONS,
                                payload: {
                                    message: res.message,
                                    ...res.data
                                }
                            });
                        }
                    })
                    .catch((err) => console.error(err));
            }
        });
    };
}
