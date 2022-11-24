import {
    REALTIME_DATA_NEW_PRIMARY_NOTIFICATION,
    REALTIME_DATA_NEW_FOLLOW,
    REALTIME_DATA_NEW_LIKE,
    REALTIME_DATA_NEW_MESSAGE,
    REALTIME_DATA_NEW_REQUEST,
    REALTIME_DATA_NEW_REQUEST_RESPONSE,
    REALTIME_DATA_NEW_THREAD,
    REALTIME_DATA_NEW_VISIT,
    REALTIME_DATA_NEW_BLOCK,
    REALTIME_DATA_TYPING
} from "../reduxActionsTypes";
import { States } from "../reduxReducers/states";

export function newThreadAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_THREAD,
            payload: {
                dataReceive
            }
        });
    };
}

export function newMessageAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_MESSAGE,
            payload: {
                dataReceive
            }
        });
    };
}

export function typingAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_TYPING,
            payload: {
                dataReceive
            }
        });
    };
}

export function setRealtimeNewLikeAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_LIKE,
            payload: {
                dataReceive
            }
        });
    };
}

export function setRealtimeNewVisitAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_VISIT,
            payload: {
                dataReceive
            }
        });
    };
}

export function setRealtimeNewRequestAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_REQUEST,
            payload: {
                dataReceive
            }
        });
    };
}

export function setRealtimeNewRequestResponseAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_REQUEST_RESPONSE,
            payload: {
                dataReceive
            }
        });
    };
}

export function setRealtimeNewFollowAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_FOLLOW,
            payload: {
                dataReceive
            }
        });
    };
}

export function setRealtimeNewPrimaryNotificationAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_PRIMARY_NOTIFICATION,
            payload: {
                dataReceive
            }
        });
    };
}

export function setRealtimeNewBlockAction(dataReceive: any) {
    return (dispatch: any, getState: () => States.IAppState) => {
        dispatch({
            type: REALTIME_DATA_NEW_BLOCK,
            payload: {
                dataReceive
            }
        });
    };
}
