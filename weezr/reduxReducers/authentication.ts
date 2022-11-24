import {
    LOGIN_SUCCESS_USER,
    SIGNUP_SUCCESS_USER,
    LOGIN_ERROR_USER,
    SIGNUP_ERROR_USER,
    CHECK_AUTHENTIFICATION_SUCCESS,
    CHECK_AUTHENTIFICATION_ERROR,
    LOGOUT_SUCCESS_USER
} from '../reduxActionsTypes';
import { States } from "./states";

const INITIAL_STATE = 'loading' as States.IAuthenticatedState;

const authenticatedState = (state = INITIAL_STATE, action: any) => {
    switch (action.type) {
        case LOGIN_SUCCESS_USER:
        case SIGNUP_SUCCESS_USER:
        case CHECK_AUTHENTIFICATION_SUCCESS:
            if (action.payload) { return action.payload.authenticatedState; }
            return state;
        case LOGIN_ERROR_USER:
        case SIGNUP_ERROR_USER:
        case CHECK_AUTHENTIFICATION_ERROR:
            if (action.payload) { return action.payload.authenticatedState; }
            return state;
        case LOGOUT_SUCCESS_USER:
            if (action.payload) { return action.payload.authenticatedState; }
            return state;
        default:
            return state;
    }
};

export default authenticatedState;
