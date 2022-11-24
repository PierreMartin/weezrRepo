import { combineReducers } from "redux";
import {
    COUNT_ALL_UNREAD_MESSAGES,
    COUNT_ALL_NOTSEEN_LIKES,
    COUNT_ALL_NOTSEEN_VISITORS,
    COUNT_ALL_NOTSEEN_REQUESTS,
    COUNT_ALL_NOTSEEN_PRIMARY_NOTIFICATIONS
} from '../reduxActionsTypes';

const INITIAL_STATE = 0 as number;

const countAllUnreadMessages = (state = INITIAL_STATE, action: any) => {
    switch (action.type) {
        case COUNT_ALL_UNREAD_MESSAGES:
            if (action.payload) { return action.payload.countAllUnreadMessages; }
            return state;
        default:
            return state;
    }
};

const countAllNotSeenLikes = (state = INITIAL_STATE, action: any) => {
    switch (action.type) {
        case COUNT_ALL_NOTSEEN_LIKES:
            if (action.payload) { return action.payload.countAllNotSeenLikes; }
            return state;
        default:
            return state;
    }
};

const countAllNotSeenVisitors = (state = INITIAL_STATE, action: any) => {
    switch (action.type) {
        case COUNT_ALL_NOTSEEN_VISITORS:
            if (action.payload) { return action.payload.countAllNotSeenVisitors; }
            return state;
        default:
            return state;
    }
};

const countAllNotSeenRequests = (state = INITIAL_STATE, action: any) => {
    switch (action.type) {
        case COUNT_ALL_NOTSEEN_REQUESTS:
            if (action.payload) { return action.payload.countAllNotSeenRequests; }
            return state;
        default:
            return state;
    }
};

const idsAllNotSeenVisitors = (state = [], action: any) => {
    switch (action.type) {
        case COUNT_ALL_NOTSEEN_VISITORS:
        case COUNT_ALL_NOTSEEN_PRIMARY_NOTIFICATIONS:
            if (action.payload?.idsAllNotSeenVisitors) { return action.payload.idsAllNotSeenVisitors; }
            return state;
        default:
            return state;
    }
};

const countAllNotSeenPrimaryNotifications = (state = INITIAL_STATE, action: any) => {
    switch (action.type) {
        case COUNT_ALL_NOTSEEN_PRIMARY_NOTIFICATIONS:
            if (action.payload) { return action.payload.countAllNotSeenPrimaryNotifications; }
            return state;
        default:
            return state;
    }
};

const notificationsReducer = combineReducers({
    countAllNotSeenPrimaryNotifications,
    countAllUnreadMessages,
    countAllNotSeenLikes,
    countAllNotSeenVisitors,
    countAllNotSeenRequests,
    idsAllNotSeenVisitors
});

export default notificationsReducer;
