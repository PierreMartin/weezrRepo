import { localClient } from "./index";

export function login(data: any) {
    return localClient.request({
        method: 'POST',
        url: 'login/',
        withCredentials: true,
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function signup(data: any) {
    return localClient.request({
        method: 'POST',
        url: 'signup/',
        withCredentials: true,
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function logout(token: string) {
    return localClient.request({
        method: 'POST',
        url: 'logout/',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}
