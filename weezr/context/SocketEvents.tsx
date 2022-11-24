import * as React from 'react';

export const SocketEvents = React.createContext<{on?: any, emit?: any, cleanup?: any}>({});
