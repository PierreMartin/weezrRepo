/* eslint-disable import/no-extraneous-dependencies */

/**
 * @format
 */
import React from 'react';
import { AppRegistry, AsyncStorage, Platform } from 'react-native';
import { NativeBaseProvider, extendTheme } from "native-base";
import { Provider } from 'react-redux';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
// import { offsetLimitPagination } from "@apollo/client/utilities";
import { setContext } from '@apollo/client/link/context';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import store from './reduxStore';
import App from './App';
import { name as appName } from './app.json';
import config from "./config";

const uri = config[Platform.OS].uri;

const httpLink = createHttpLink({
    uri: `${uri}/graphql`
});

// https://www.apollographql.com/docs/react/networking/authentication/#header
const authLink = setContext((_, { headers }) => {
    return AsyncStorage.getItem('jwt')
        .then((token) => {
            return {
                headers: {
                    ...headers,
                    authorization: token ? `Bearer ${token}` : ''
                }
            };
        });
});

/**
 * Recursively delete all properties matching with the given predicate function in the given value
 * @param {Object} value
 * @param {Function} predicate
 * @return the number of deleted properties or indexes
 */
function deepDeleteAll(value, predicate) {
    let count = 0;

    if (isArray(value)) {
        value.forEach((item, index) => {
            if (predicate(item)) {
                value.splice(index, 1);
                count++;
            } else {
                count += deepDeleteAll(item, predicate);
            }
        });
    } else if (isPlainObject(value)) {
        Object.keys(value).forEach((key) => {
            if (predicate(value[key])) {
                delete value[key];
                count++;
            } else {
                count += deepDeleteAll(value[key], predicate);
            }
        });
    }
    return count;
}

/**
 * Improve InMemoryCache prototype with a function deleting an entry and all its
 * references in cache.
 */
InMemoryCache.prototype.delete = function (entry) {
    // get entry id
    const id = this.config.dataIdFromObject(entry);

    // delete all entry references from cache
    deepDeleteAll(this.data.data, (ref) => ref && (ref.type === 'id' && ref.id === id));

    // delete entry from cache (and trigger UI refresh)
    this.data.delete(id);
};

const customOffsetLimitPagination = (fieldsDoResetCacheIfChanged) => {
    return {
        keyArgs: fieldsDoResetCacheIfChanged || false,
        merge(existing, incoming, { args: { offset = 0 }}) {
            // const mergedData = offsetLimitPagination()?.merge(existing?.data, incoming?.data, params);

            const mergedData = (existing && existing.data) ? existing.data.slice(0) : [];
            const { data, ...rest } = incoming;

            for (let i = 0; i < data.length; ++i) {
                mergedData[offset + i] = data[i];
            }

            const isLastPage = !!(rest?.pageInfo?.isLastPage || existing?.pageInfo?.isLastPage);

            return {
                ...rest,
                pageInfo: { ...rest.pageInfo, isLastPage },
                data: mergedData
            };
        }
    };
};

const cache = new InMemoryCache({
    typePolicies: {
        Query: {
            fields: {
                // Set all queries where we need pagination here:
                threadMessages: { ...customOffsetLimitPagination(['filter']) },
                threads: { ...customOffsetLimitPagination(['filter']) },
                users: { ...customOffsetLimitPagination(['filter', 'data']) }
            }
        }
    }
});

// Initialize Apollo Client
const client = new ApolloClient({
    // uri: `${uri}/graphql`,
    cache,
    link: authLink.concat(httpLink),
});

const themeOverrides = {
    components: {
        Button: {
            baseStyle: {
                borderRadius: 100
            },
            defaultProps: {
                colorScheme: 'primary'
            }
        }
    },
    colors: {
        primary: { // TODO refacto dark mode - put it in 'colors.ts'
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
        },
        /*
        brand: {
            900: '#8287af',
            800: '#7c83db',
            700: '#b3bef6',
        }
        */
    },
    fontSizes: {},
    fonts: {},
    config: {
        // initialColorMode: 'dark', // TODO
    },
};

const theme = extendTheme(themeOverrides);

const appRoot = () => (
    <Provider store={store}>
        <ApolloProvider client={client}>
            <NativeBaseProvider theme={theme}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <ActionSheetProvider>
                        <BottomSheetModalProvider>
                            <App />
                        </BottomSheetModalProvider>
                    </ActionSheetProvider>
                </GestureHandlerRootView>
            </NativeBaseProvider>
        </ApolloProvider>
    </Provider>
);

AppRegistry.registerComponent(appName, () => appRoot);
