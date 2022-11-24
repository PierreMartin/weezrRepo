import { AsyncStorage } from 'react-native';
import { i18n as II18n } from "i18next";
import {
    CHECK_AUTHENTIFICATION_ERROR,
    CHECK_AUTHENTIFICATION_SUCCESS,
    FETCH_MY_BLOCKED_PROFILES_ERROR,
    FETCH_MY_BLOCKED_PROFILES_SUCCESS,
    UPDATE_SUCCESS_USER
} from '../reduxActionsTypes';
import { getMeProfile, getMyBlockedProfiles } from '../services/UserService';
import { checkIsValidLanguage } from "../toolbox/toolbox";

/*
export function xxxAction(data: any) {
    return {
        type: XXX_XXX,
        payload: { data }
    };
}
*/

export function fetchMeProfileAction(i18n: II18n) {
    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                return getMeProfile(token).then((res) => {
                    if (res?.data) {
                        // Set the user language for translating app:
                        const userLanguageFound = res.data?.me?.preferenceAccount?.language;
                        const isDifferentLanguage = userLanguageFound !== i18n.language;

                        if (
                            checkIsValidLanguage(userLanguageFound)
                            && isDifferentLanguage
                            && i18n?.changeLanguage
                        ) {
                            console.log('USER DB - Used system language ===> ', userLanguageFound);
                            i18n.changeLanguage(userLanguageFound);
                        }

                        dispatch({
                            type: CHECK_AUTHENTIFICATION_SUCCESS,
                            payload: {
                                message: null,
                                authenticatedState: res.data.authenticatedState,
                                me: res.data.me
                            }
                        });
                    }
                }).catch((errGetMeProfile: any) => {
                    AsyncStorage.removeItem('jwt');

                    return dispatch({
                        type: CHECK_AUTHENTIFICATION_ERROR,
                        payload: {
                            message: errGetMeProfile?.message,
                            authenticatedState: 'error',
                            haveError: true,
                            me: null
                        }
                    });
                });
            }

            return dispatch({
                type: CHECK_AUTHENTIFICATION_ERROR,
                payload: {
                    message: 'No token',
                    authenticatedState: 'disconnected',
                    me: null
                }
            });
        });
    };
}

export function updateUserAction(data: any) {
    return (dispatch: any) => {
        return new Promise((resolve) => {
            resolve(dispatch({
                type: UPDATE_SUCCESS_USER,
                payload: {
                    message: 'User has been updated',
                    me: data
                }
            }));
        });
    };
}

export function fetchMyBlockedProfilesAction(dataForFetchQuery: any) {
    return (dispatch: any) => {
        return AsyncStorage.getItem('jwt').then((token: string | null) => {
            if (token) {
                return getMyBlockedProfiles(token, dataForFetchQuery)
                    .then((res) => {
                        if (res?.data) {
                            dispatch({
                                type: FETCH_MY_BLOCKED_PROFILES_SUCCESS,
                                payload: {
                                    message: res.pageInfo?.message,
                                    myBlockedProfiles: res.data.myBlockedProfiles
                                }
                            });
                        }
                    })
                    .catch((err) => {
                        return dispatch({
                            type: FETCH_MY_BLOCKED_PROFILES_ERROR,
                            payload: {
                                message: err?.message,
                                myBlockedProfiles: []
                            }
                        });
                    });
            }

            return dispatch({
                type: FETCH_MY_BLOCKED_PROFILES_ERROR,
                payload: {
                    message: 'No token',
                    myBlockedProfiles: []
                }
            });
        });
    };
}
