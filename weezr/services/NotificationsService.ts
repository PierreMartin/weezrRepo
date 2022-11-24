import { localClient } from './index';

export function getCountAllUnreadMessages(token: string, data: any) {
    return localClient.request({
        method: 'POST',
        url: 'countallunreadmessages/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function getCountAllNotSeenLikes(token: string, data: any) {
    return localClient.request({
        method: 'POST',
        url: 'countallnotseenlikes/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function getCountAllNotSeenVisitors(token: string, data: any) {
    return localClient.request({
        method: 'POST',
        url: 'countallnotseenvisitors/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function getCountAllNotSeenRequests(token: string, data: any) {
    return localClient.request({
        method: 'POST',
        url: 'countallnotseenrequests/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function getCountAllNotSeenPrimaryNotifications(token: string, data: any) {
    return localClient.request({
        method: 'POST',
        url: 'countallnotseenprimarynotifications/',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}
