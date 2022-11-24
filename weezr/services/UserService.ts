import { localClient } from './index';

export function getMeProfile(token: string) {
    return localClient.request({
        method: 'POST',
        url: 'me/profile/',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function getMyBlockedProfiles(token: string, data: any) {
    return localClient.request({
        method: 'POST',
        url: 'me/myblockedprofiles/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}
