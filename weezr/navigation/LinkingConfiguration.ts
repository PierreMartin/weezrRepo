// import * as Linking from 'expo-linking';
// DOC : https://reactnavigation.org/docs/deep-linking

export default {
    prefixes: ['myapp://', 'https://myapp.com'],

    /*
    async getInitialURL() {
        return '';
    },

    // Custom function to subscribe to incoming links
    subscribe(listener) {
        return () => {};
    },
    */

    config: {
        screens: {
            Main: {
                screens: {
                    TabHome: {
                        screens: {
                            TabUsersGridScreen: 'one',
                        },
                    },
                    TabThreadsList: {
                        screens: {
                            TabThreadsListScreen: 'two',
                        },
                    },
                },
            },
            NotFound: '*',
        },
    },
};
