import _ from "lodash";
import { States } from "../reduxReducers/states";

export const getCacheData = _.throttle((cacheData: States.ICacheData | null) => {
    // console.log('cacheDataLog - Get');
    return cacheData;
}, 200);

export const setCacheData = _.throttle((setCacheDataActionProps, data: any[] | null) => {
    // console.log('cacheDataLog - Set');
    setCacheDataActionProps('users', { data });
}, 200);
