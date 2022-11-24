import { combineReducers } from "redux";
import {
    REALTIME_DATA_NEW_MESSAGE,
    REALTIME_DATA_NEW_THREAD,
    REALTIME_DATA_TYPING,
    REALTIME_DATA_NEW_LIKE,
    REALTIME_DATA_NEW_VISIT,
    REALTIME_DATA_NEW_REQUEST,
    REALTIME_DATA_NEW_REQUEST_RESPONSE,
    REALTIME_DATA_NEW_FOLLOW,
    REALTIME_DATA_NEW_BLOCK,
    REALTIME_DATA_NEW_PRIMARY_NOTIFICATION
} from '../reduxActionsTypes';
import { States } from "./states";

const newThread = (state = null as unknown as States.INewThread, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_THREAD:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newMessage = (state = null as unknown as States.INewMessage, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_MESSAGE:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const typing = (state = null as unknown as States.ITyping, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_TYPING:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newLike = (state = null as unknown as States.INewLike, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_LIKE:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newVisit = (state = null as unknown as States.INewLike, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_VISIT:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newRequest = (state = null as unknown as States.INewRequest, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_REQUEST:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newRequestResponse = (state = null as unknown as States.INewRequest, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_REQUEST_RESPONSE:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newFollow = (state = null as unknown as States.INewFollow, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_FOLLOW:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newBlock = (state = null as unknown as States.INewBlock, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_BLOCK:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const newPrimaryNotification = (state = null as unknown as States.INewPrimaryNotification, action: any) => {
    switch (action.type) {
        case REALTIME_DATA_NEW_PRIMARY_NOTIFICATION:
            if (action.payload) { return action.payload.dataReceive; }
            return state;
        default:
            return state;
    }
};

const realtimeDataReducer = combineReducers({
    newThread,
    newMessage,
    typing,
    newLike,
    newVisit,
    newFollow,
    newBlock,
    newRequest,
    newRequestResponse,
    newPrimaryNotification
});

export default realtimeDataReducer;
