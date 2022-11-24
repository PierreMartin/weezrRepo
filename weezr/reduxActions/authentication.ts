import { AsyncStorage } from "react-native";
import { login, logout, signup } from "../services/AuthenticationService";
import {
    LOGIN_ERROR_USER,
    LOGIN_SUCCESS_USER, LOGOUT_ERROR_USER,
    LOGOUT_SUCCESS_USER,
    SIGNUP_ERROR_USER,
    SIGNUP_SUCCESS_USER
} from "../reduxActionsTypes";

import { isAuthenticatedForDebug } from "../constants/Config";

export function signupAction(data: any) {
    return (dispatch: any) => {
        return signup(data)
            .then((res) => {
                if (res?.data) {
                    console.log('authenticatedState ==> ', res.data.authenticatedState);

                    if (res.data.authenticatedState === 'connected') {
                        AsyncStorage.setItem('jwt', res?.token);
                    }

                    return dispatch({
                        type: SIGNUP_SUCCESS_USER,
                        payload: {
                            message: res.message,
                            authenticatedState: res.data.authenticatedState,
                            me: res.data.me
                        }
                    });
                }

                return Promise.resolve(null);
            })
            .catch((err) => {
                console.log('authenticatedState ==> ', err);
                return dispatch((
                    {
                        type: SIGNUP_ERROR_USER,
                        payload: {
                            message: err?.message,
                            fieldsErrors: err?.fieldsErrors,
                            authenticatedState: 'disconnected'
                        }
                    }
                ));
            });
    };
}

export function loginAction(data: any) {
    return (dispatch: any) => {
        return login(data)
            .then((res) => {
                if (res?.data) {
                    console.log('authenticatedState ==> ', res.data.authenticatedState);

                    let authenticatedState = 'disconnected';
                    if (isAuthenticatedForDebug) {
                        // @ts-ignore
                        authenticatedState = isAuthenticatedForDebug;
                    } else {
                        authenticatedState = res.data.authenticatedState;
                    }

                    if (authenticatedState === 'connected') {
                        AsyncStorage.setItem('jwt', res?.token);
                    }

                    return dispatch({
                        type: LOGIN_SUCCESS_USER,
                        payload: {
                            message: res.message,
                            authenticatedState,
                            me: res.data.me
                        }
                    });
                }

                return Promise.resolve(null);
            })
            .catch((err) => {
                console.log('authenticatedState ==> ', err);
                return dispatch({
                    type: LOGIN_ERROR_USER,
                    payload: {
                        message: err?.message,
                        fieldsErrors: err?.fieldsErrors,
                        authenticatedState: 'disconnected'
                    }
                });
            });
    };
}

export function logoutAction() {
    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                return logout(token)
                    .then((res) => {
                        if (res?.data) {
                            console.log('authenticatedState ==> ', res.data.authenticatedState);

                            if (res.data.authenticatedState === 'disconnected') {
                                AsyncStorage.removeItem('jwt');
                            }

                            return dispatch({
                                type: LOGOUT_SUCCESS_USER,
                                payload: {
                                    message: res.message,
                                    authenticatedState: res.data.authenticatedState,
                                    me: res.data.me
                                }
                            });
                        }

                        return Promise.resolve(null);
                    })
                    .catch((err) => {
                        console.log('authenticatedState ==> ', err);

                        dispatch({
                            type: LOGOUT_ERROR_USER,
                            payload: {
                                message: err?.message,
                                authenticatedState: 'connected'
                            }
                        });
                    });
            }

            return Promise.resolve(null);
        });
    };
}
