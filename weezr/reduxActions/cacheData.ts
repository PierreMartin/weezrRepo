import { States } from "../reduxReducers/states";
import { SET_CACHE_DATA_USERS } from "../reduxActionsTypes";

export function setCacheDataAction(entity: string, dataCache: States.ICacheData) {
    let type: string;

    switch (entity) {
        case 'users':
            type = SET_CACHE_DATA_USERS;
            break;
        default:
            break;
    }

    return (dispatch: any) => {
        dispatch({
            type,
            payload: {
                dataCache
            }
        });
    };
}
