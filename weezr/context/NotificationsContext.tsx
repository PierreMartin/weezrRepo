import * as React from 'react';

interface INotificationsContext {
    count: {
        all?: (userId: string) => void;
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
}

export const NotificationsContext = React.createContext<INotificationsContext>({ count: {}, setAsSeen: {} });
