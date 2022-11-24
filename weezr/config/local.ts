import { LOCAL_IP } from "../constants/env";

const port = 3080;
const uri = `http://localhost:${port}`;

export default {
    windows: {
        uri
    },
    macos: {
        uri
    },
    web: {
        uri
    },
    ios: {
        uri
    },
    android: {
        uri: `http://${LOCAL_IP}:${port}`
    },

    // Common configs:
    realtime: `http://${LOCAL_IP}:${port}`
};
