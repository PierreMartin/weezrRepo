import 'react-native-gesture-handler';
import React from 'react';
import { bindActionCreators } from "redux";
import { ColorSchemeName, StatusBar, useColorScheme } from 'react-native';
import { connect } from 'react-redux';
import { useTranslation } from "react-i18next";
import { i18n as II18n } from "i18next";
// import { Colors } from 'react-native/Libraries/NewAppScreen';
import Navigation from './navigation';
import useCachedResources from './hooks/useCachedResources';
import { fetchMeProfileAction } from "./reduxActions/user";
import { States } from "./reduxReducers/states";
import { initRealtimeService } from "./services/realtimeManager";
import { notificationsManager } from "./services/NotificationsManager";
import config from "./config";
import store from "./reduxStore";
import { SocketEvents } from "./context/SocketEvents";
import { NotificationsContext } from "./context/NotificationsContext";
import { IUser } from "./entities";
import "./localization/i18n.config";

/*
const Section = ({ children, title }: any) => {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <View style={styles.sectionContainer}>
            <Text
                style={[
                    styles.sectionTitle,
                    {
                        color: isDarkMode ? Colors.white : Colors.black,
                    }
                ]}
            >
                {title}
            </Text>
            <Text
                style={[
                    styles.sectionDescription,
                    {
                        color: isDarkMode ? Colors.light : Colors.dark,
                    }
                ]}
            >
                {children}
            </Text>
        </View>
    );
};
*/

interface IApp {
    me: IUser;
    authenticatedState: States.IAuthenticatedState;
    fetchMeProfileActionProps: (i18n: II18n) => any;
}

const socket = initRealtimeService(config.realtime, store);

const App = ({
                 me,
                 authenticatedState,
                 fetchMeProfileActionProps
             }: IApp) => {
    const colorScheme = useColorScheme() as NonNullable<ColorSchemeName>;
    const isDarkMode = colorScheme === 'dark';
    const isLoadingComplete = useCachedResources();
    const { i18n } = useTranslation();

    React.useEffect(() => {
        fetchMeProfileActionProps(i18n);

        socket.listenersAllEvents();
        return () => socket.cleanupAllEvents();
    }, []);

    /*
    React.useEffect(() => {
        if (authenticatedState === 'connected' && me?._id) {
            fetchMyBlockedProfilesActionProps({
                filterMain: {
                    $or: [
                        { receiverId: me._id },
                        { senderId: me._id }
                    ]
                }
            });
        }
    }, [authenticatedState]);
    */

    /*
    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
    */

    if (!isLoadingComplete || authenticatedState === 'loading') {
        // return <SplashScreen />;
        return null;
    }

    // Wrapper without native-base : <SafeAreaView style={[backgroundStyle, { flex: 1 }]}>...</SafeAreaView>
    return (
        <>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <SocketEvents.Provider value={socket.socketEvents()}>
                <NotificationsContext.Provider value={notificationsManager(store)}>
                    <Navigation
                        colorScheme={colorScheme}
                        authenticatedState={authenticatedState}
                        isOnboardingNeverUsed={!!me?.isOnboardingNeverUsed}
                    />
                </NotificationsContext.Provider>
            </SocketEvents.Provider>
        </>
    );
};

function mapStateToProps(state: States.IAppState) {
    return {
        authenticatedState: state.authenticatedState,
        me: state.user.me
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        fetchMeProfileActionProps: bindActionCreators(fetchMeProfileAction, dispatch),
        // fetchMyBlockedProfilesActionProps: bindActionCreators(fetchMyBlockedProfilesAction, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
