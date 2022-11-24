import { AnyAction, Store } from "redux";
import { States } from "../reduxReducers/states";
import {
    setCountAllNotSeenLikesAction,
    setCountAllNotSeenPrimaryNotificationsAction,
    setCountAllNotSeenRequestsAction,
    setCountAllUnreadMessagesAction
} from "../reduxActions/notifications";

export function notificationsManager(store: Store<States.IAppState, AnyAction>) {
    return {
        count: {
            all: (userId: string) => {
                setCountAllUnreadMessagesAction({ userId })(store.dispatch);
                setCountAllNotSeenPrimaryNotificationsAction({ userId })(store.dispatch);
                setCountAllNotSeenLikesAction({ userId })(store.dispatch);
                setCountAllNotSeenRequestsAction({ userId })(store.dispatch);
                // setCountAllNotSeenVisitorsAction({ userId })(store.dispatch);
                // setCountAllNotSeenFollowersAction({ userId })(store.dispatch);
            },
            // threadMessages,
            // likes,
            // ...
        },
        setAsSeen: {
            // all,
            // threadMessages,
            // likes,
            // ...
        }
    };
}
