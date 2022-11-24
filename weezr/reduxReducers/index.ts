import { combineReducers } from 'redux';
import user from './user';
import notifications from "./notifications";
import authenticatedState from "./authentication";
import realtimeData from "./realtimeData";
import cacheData from "./cacheData";

export default combineReducers({
    user,
    authenticatedState,
    notifications,
    realtimeData,
    cacheData
});
