// Get order by latitude longitude javascript: https://stackoverflow.com/questions/26836146/how-to-sort-array-items-by-longitude-latitude-distance-in-javascripts
// K = km and N = nautical miles
import _ from "lodash";
import { ILanguage, IUser } from "../entities";
import { supportedLanguages } from "../constants/Config";
import { States } from "../reduxReducers/states";

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number, unit?: string) => {
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;

    if (unit === "K") { dist = dist * 1.609344; }
    if (unit === "N") { dist = dist * 0.8684; }

    return dist;
};

/*
const distanceComparedToMe = calculateDistance(
    me.currentLocation?.latitude,
    me.currentLocation?.longitude,
    user.currentLocation?.latitude,
    user.currentLocation?.longitude,
    'K'
);
*/

export const getValueInNestedObjectByStringifyKeys = (stringifyKeys: string, object: any): string => {
    let selectedValue = '';
    const nestedKeys = stringifyKeys?.split('.');
    const deepLength = nestedKeys?.length;

    if (Object.keys(object)?.length) {
        switch (deepLength) {
            case 1:
                selectedValue = object[nestedKeys[0]];
                break;
            case 2:
                selectedValue = object[nestedKeys[0]][nestedKeys[1]];
                break;
            case 3:
                selectedValue = object[nestedKeys[0]][nestedKeys[1]][nestedKeys[2]];
                break;
            case 4:
                selectedValue = object[nestedKeys[0]][nestedKeys[1]][nestedKeys[2]][nestedKeys[3]];
                break;
            default:
                break;
        }
    }

    return selectedValue;
};

export const getNestedObjectByStringifyKeys = (
    stringifyKeys: string,
    oldObject: any,
    newValueInStringifyKeys?: string
): any => {
    const object = oldObject;

    if (stringifyKeys?.includes('.')) {
        delete object[stringifyKeys];
        _.set(object, stringifyKeys, newValueInStringifyKeys); // mute object here
    }

    return object;
};

export const getUserForwardPhoto = (
    user: IUser,
    fieldNameSize: string,
    displayDefaultAvatarIfNeeded?: boolean
): any => {
    // If not already loaded:
    // if (!user?.id && !user?.id) { return { uri: null, initial: '' }; }

    const forwardFileId = user?.images?.forwardFileId;
    const imageFound: any = user?.images?.list?.find((image: any) => image?.fileId === forwardFileId);
    const initial = user?.displayName?.substr(0, 2)?.toUpperCase() || user?.email?.substr(0, 2)?.toUpperCase();
    let uri = '';

    if (Object.keys(imageFound || {})?.length && fieldNameSize) {
        uri = imageFound[fieldNameSize];
    }

    if (!uri && displayDefaultAvatarIfNeeded) {
        uri = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXlZntj19KqLp6PixOo-THMk5SHclqG-eHg5Ubds1lk2kbfKth5o4QYZixHdOjeT9fnJ4&usqp=CAU';
    }

    return {
        uri: uri || null,
        initial: initial || ''
    };
};

export const getUserPhotoByPage = (
    image: any[] | undefined,
    fieldNameSize: string,
    pageIndex: number,
    direction: string
): any => {
    const imagesFound: any[] | undefined = image;

    if (typeof imagesFound?.length === 'undefined' || imagesFound.length <= 1) {
        return null;
    }

    // Reach min limit:
    if (direction === 'prev' && (pageIndex < 0)) {
        return null;
    }

    // Reach max limit:
    if (direction === 'next' && (pageIndex >= imagesFound.length)) {
        return null;
    }

    if (!imagesFound?.length) {
        return null;
    }

    let uri = '';

    if (Object.keys(imagesFound[pageIndex] || {})?.length && fieldNameSize) {
        uri = imagesFound[pageIndex][fieldNameSize];
    }

    return uri || null;
};

export const truncate = (input: string, length: number, ellipsis: any) => {
    return input?.length > length ? `${input.substring(0, length)}${ellipsis}` : input;
};

export const checkIsValidLanguage = (selectedLanguage: ILanguage) => selectedLanguage && supportedLanguages.includes(selectedLanguage);

export const setElementInArrayAtIndex = (
    arr: any[] | undefined,
    keyToFind: string,
    valueToFind?: string,
    indexToMove = 0
) => {
    if (!arr?.length) { return []; }

    const nextArr = [...arr];
    const forwardPhotoIndex = nextArr?.findIndex((el: any) => el && (el[keyToFind] === valueToFind));

    if (valueToFind && keyToFind && typeof forwardPhotoIndex !== 'undefined' && forwardPhotoIndex !== -1) {
        const element = nextArr[forwardPhotoIndex];
        if (element) {
            nextArr.splice(forwardPhotoIndex, 1);
            nextArr.splice(indexToMove, 0, element);
        }
    }

    return nextArr;
};

export const getUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const createRoomName = (ids?: (string | undefined)[]) => {
    if (!ids?.length) {
        return null;
    }

    /*
    let x = id1;
    let y = id2;

    if (id1 > id2) {
        // Swap two values:
        x = id2;
        y = id1;
    }

    return x + '-' + y;
    */

    const idArr = ids.sort((a, b) => ('' + a).localeCompare(b || ''));
    return idArr.join('-');
};

export const getFilteredUsers = (data: any[], myBlockedProfiles: States.IMyBlockedProfiles) => {
    if (!myBlockedProfiles?.length) {
        return data;
    }

    let nextData: any[] = [...data];
    nextData = nextData.filter((item) => !myBlockedProfiles.includes(item?.id));

    return nextData;
};
