// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from 'react';
import TabMapScreen from '../screens/TabMapScreen';
import ThreadsListTopTabNavigator from "./ThreadsListTopTabNavigator";
import UsersGridTopTabNavigator from "./UsersGridTopTabNavigator";
import NotificationsCenterTopTabNavigator from "./NotificationsCenterTopTabNavigator";
import TabUserSpaceMenuScreen from "../screens/UserSpaceMenu/TabUserSpaceMenuScreen";
import { States } from "../reduxReducers/states";
import colors from "../styles/colors";

const BottomTab = createBottomTabNavigator<any>();
const TabProfilStack = createNativeStackNavigator<any>();
const TabGridStack = createNativeStackNavigator<any>();
const TabMapStack = createNativeStackNavigator<any>();
const TabThreadsListStack = createNativeStackNavigator<any>();
const TabNotificationsCenterStack = createNativeStackNavigator<any>();

const screenOptions: any = {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' }
};

interface IBottomTabNavigator {
    notifications: States.INotificationsState;
}

export default function BottomTabNavigator({ notifications }: IBottomTabNavigator) {
    const {
        countAllUnreadMessages,
        countAllNotSeenLikes,
        countAllNotSeenRequests,
        countAllNotSeenPrimaryNotifications
    } = notifications;
    // const colorScheme = useColorScheme() as NonNullable<ColorSchemeName>;

    const tabThreadsListOption: any = {
        tabBarLabel: 'Messages',
        tabBarIcon: ({ color }: any) => <Ionicons size={30} name="chatbox-ellipses-outline" style={{ marginBottom: -3 }} color={color} />
    };

    const tabNotificationsCenterOption: any = {
        tabBarLabel: 'Notifications center',
        tabBarIcon: ({ color }: any) => <Ionicons size={30} name="notifications-outline" style={{ marginBottom: -3 }} color={color} />
    };

    if (countAllUnreadMessages) {
        tabThreadsListOption.tabBarBadge = countAllUnreadMessages;
    }

    if (countAllNotSeenPrimaryNotifications || countAllNotSeenLikes || countAllNotSeenRequests) {
        tabNotificationsCenterOption.tabBarBadge = (
            (countAllNotSeenPrimaryNotifications || 0)
            + (countAllNotSeenLikes || 0)
            + (countAllNotSeenRequests || 0)
        );
    }

    return (
        <BottomTab.Navigator
            initialRouteName="TabHome"
            screenOptions={{
                headerShown: false
            }}
        >
            <BottomTab.Screen
                name="TabGrid"
                component={TabUsersGridNavigator}
                options={{
                    tabBarLabel: 'Browse',
                    tabBarIcon: ({ color }: any) => <Ionicons size={30} name="navigate-outline" style={{ marginBottom: -3 }} color={color} />
                }}
            />
            <BottomTab.Screen
                name="TabMap"
                component={TabMapNavigator}
                options={{
                    tabBarLabel: 'Map',
                    tabBarIcon: ({ color }: any) => <Ionicons size={30} name="map-outline" style={{ marginBottom: -3 }} color={color} />
                }}
            />
            <BottomTab.Screen
                name="TabThreadsList"
                component={TabThreadsListNavigator}
                options={tabThreadsListOption}
            />
            <BottomTab.Screen
                name="TabNotificationsCenter"
                options={tabNotificationsCenterOption}
            >
                {(props) => {
                    return (
                        <TabNotificationsCenterNavigator
                            {...props}
                            notifications={notifications}
                        />
                    );
                }}
            </BottomTab.Screen>
            <BottomTab.Screen
                name="TabUserSpaceMenu"
                component={TabUserSpaceMenuNavigator}
                options={{
                    // headerTitle: props => <Text style{{}}>Tab One Title</Text>,
                    // headerRight: props => <Button>Click here!</Text>,
                    // headerBackTitle: 'Back !',
                    tabBarLabel: 'My space',
                    tabBarIcon: ({ color }: any) => <Ionicons size={30} name="person-circle-outline" style={{ marginBottom: -3 }} color={color} />
                }}
            />
        </BottomTab.Navigator>
    );
}

function TabUsersGridNavigator() {
    return (
        <TabGridStack.Navigator screenOptions={screenOptions}>
            <TabGridStack.Screen name="TabUsersGridScreen" component={UsersGridTopTabNavigator} options={{ headerTitle: 'Browse' }} />
        </TabGridStack.Navigator>
    );
}

function TabMapNavigator() {
    return (
        <TabMapStack.Navigator screenOptions={screenOptions}>
            <TabMapStack.Screen name="TabMapScreen" component={TabMapScreen} options={{ headerTitle: 'Map' }} />
        </TabMapStack.Navigator>
    );
}

function TabThreadsListNavigator() {
    return (
        <TabThreadsListStack.Navigator screenOptions={screenOptions}>
            {/* <TabThreadsListStack.Screen name="TabThreadsListScreen" component={TabThreadsListScreen} options={{ headerTitle: 'Messages' }} /> */}
            <TabThreadsListStack.Screen name="TabThreadsListScreen" component={ThreadsListTopTabNavigator} options={{ headerTitle: 'Messages' }} />
        </TabThreadsListStack.Navigator>
    );
}

function TabNotificationsCenterNavigator({ notifications }: IBottomTabNavigator) {
    return (
        <TabNotificationsCenterStack.Navigator screenOptions={screenOptions}>
            <TabNotificationsCenterStack.Screen name="TabNotificationsCenterScreen" options={{ headerTitle: 'Notifications' }}>
                {(props) => {
                    return (
                        <NotificationsCenterTopTabNavigator
                            {...props}
                            notifications={notifications}
                        />
                    );
                }}
            </TabNotificationsCenterStack.Screen>
        </TabNotificationsCenterStack.Navigator>
    );
}

function TabUserSpaceMenuNavigator() {
    return (
        <TabProfilStack.Navigator screenOptions={screenOptions}>
            <TabProfilStack.Screen name="TabUserSpaceMenuScreen" component={TabUserSpaceMenuScreen} options={{ headerTitle: 'Profil' }} />
        </TabProfilStack.Navigator>
    );
}
