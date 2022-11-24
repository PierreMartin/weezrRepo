import * as React from 'react';
import { Badge } from "native-base";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TabNotificationsCenterScreen from "../screens/TabNotificationsCenterScreen";
import { States } from "../reduxReducers/states";

const Tab: any = createMaterialTopTabNavigator<any>();

interface INotificationsCenterTopTabNavigator {
    notifications: States.INotificationsState;
}

export default function NotificationsCenterTopTabNavigator(propsParent: INotificationsCenterTopTabNavigator) {
    const {
        countAllNotSeenPrimaryNotifications,
        countAllNotSeenLikes,
        countAllNotSeenRequests
    } = propsParent.notifications || {};

    const renderBadge = (count: number) => {
        if (!count) { return null; }

        return (
            <Badge
                mt={1}
                colorScheme="danger"
                rounded="full"
                zIndex={1}
                variant="solid"
                _text={{ fontSize: 9 }}
            >
                {count}
            </Badge>
        );
    };

    return (
        <Tab.Navigator>
            <Tab.Screen name="All" options={{ tabBarLabel: 'All', tabBarBadge: () => renderBadge(countAllNotSeenPrimaryNotifications)}}>
                {(props: any) => <TabNotificationsCenterScreen {...props} {...propsParent} selectedTab="all" />}
            </Tab.Screen>

            <Tab.Screen name="Likes" options={{ tabBarLabel: 'Likes', tabBarBadge: () => renderBadge(countAllNotSeenLikes)}}>
                {(props: any) => <TabNotificationsCenterScreen {...props} {...propsParent} selectedTab="likes" />}
            </Tab.Screen>

            <Tab.Screen name="Requests" options={{ tabBarLabel: 'Requests', tabBarBadge: () => renderBadge(countAllNotSeenRequests) }}>
                {(props: any) => <TabNotificationsCenterScreen {...props} {...propsParent} selectedTab="requests" />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
