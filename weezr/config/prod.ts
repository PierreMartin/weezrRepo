const port = 80;
const uri = 'https://butterfly.com';

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
        uri
    },

    // Common configs:
    realtime: `http://${uri}:${port}`
};
