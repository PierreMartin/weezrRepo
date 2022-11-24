import { combineReducers } from 'redux';
import {
    LOGIN_SUCCESS_USER,
    SIGNUP_SUCCESS_USER,
    UPDATE_SUCCESS_USER,
    CHECK_AUTHENTIFICATION_SUCCESS,
    LOGOUT_SUCCESS_USER,
    CHECK_AUTHENTIFICATION_ERROR,
    FETCH_MY_BLOCKED_PROFILES_SUCCESS,
    FETCH_MY_BLOCKED_PROFILES_ERROR
} from '../reduxActionsTypes';
import { States } from "./states";

const me = (state = {} as States.IMe, action: any) => {
    switch (action.type) {
        case LOGIN_SUCCESS_USER:
        case SIGNUP_SUCCESS_USER:
            if (action.payload?.me) { return action.payload.me; }
            return state;
        case UPDATE_SUCCESS_USER:
            if (action.payload?.me) {
                return { ...state, ...action.payload.me };
            }
            return state;
        case CHECK_AUTHENTIFICATION_SUCCESS:
            if (action.payload?.me) { return action.payload.me; }
            return state;
        case LOGOUT_SUCCESS_USER:
        case CHECK_AUTHENTIFICATION_ERROR:
            if (action.payload) { return action.payload.me; }
            return state;
        default:
            return state;
    }
};

const myBlockedProfiles = (state = [] as States.IMyBlockedProfiles, action: any) => {
    switch (action.type) {
        case FETCH_MY_BLOCKED_PROFILES_SUCCESS:
            if (action.payload) { return action.payload.myBlockedProfiles; }
            return state;
        case FETCH_MY_BLOCKED_PROFILES_ERROR:
            if (action.payload) { return action.payload.myBlockedProfiles; }
            return state;
        default:
            return state;
    }
};

const userReducer = combineReducers({
    me,
    myBlockedProfiles
});

export default userReducer;
