import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TabThreadsListScreen from '../screens/TabThreadsListScreen';

const Tab: any = createMaterialTopTabNavigator<any>();

export default function ThreadsListTopTabNavigator(propsParent: any) {
    return (
        <Tab.Navigator
            screenOptions={{ swipeEnabled: false }}
        >
            <Tab.Screen name="All" options={{ tabBarLabel: 'All' }}>
                {(props: any) => <TabThreadsListScreen {...props} {...propsParent} selectedTab={null} />}
            </Tab.Screen>
            <Tab.Screen name="Unread" options={{ tabBarLabel: 'Unread' }}>
                {(props: any) => <TabThreadsListScreen {...props} {...propsParent} selectedTab="unread" />}
            </Tab.Screen>
            <Tab.Screen name="Online" options={{ tabBarLabel: 'Online' }}>
                {(props: any) => <TabThreadsListScreen {...props} {...propsParent} selectedTab="online" />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
