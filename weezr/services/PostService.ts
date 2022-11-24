import { localClient } from './index';

export function getAllPosts() {
    return localClient.request({
        method: 'GET', // 'POST'
        url: 'getposts/',
        // If post => data: { filter: {} }
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}

export function addPost(data: any) {
    return localClient.request({
        method: 'POST',
        url: 'addpost/',
        data
    })
        .then((res: any) => Promise.resolve(res?.data))
        .catch((err: any) => Promise.reject(err?.response?.data));
}
