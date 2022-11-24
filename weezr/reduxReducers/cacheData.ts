import { combineReducers } from "redux";
import {
    SET_CACHE_DATA_USERS
} from '../reduxActionsTypes';
import { States } from "./states";

const users = (state = {} as unknown as States.ICacheData, action: any) => {
    switch (action.type) {
        case SET_CACHE_DATA_USERS:
            if (action.payload) { return action.payload.dataCache; }
            return state;
        default:
            return state;
    }
};

const cacheDataReducer = combineReducers({
    users
});

export default cacheDataReducer;
