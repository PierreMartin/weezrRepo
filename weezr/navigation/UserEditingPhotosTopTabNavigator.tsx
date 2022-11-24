import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import UserEditingPhotosScreen from "../screens/UserSpaceMenu/UserEditingPhotos/UserEditingPhotosScreen";

const Tab: any = createMaterialTopTabNavigator<any>();

export default function UserEditingPhotosTopTabNavigator(propsParent: any) {
    return (
        <Tab.Navigator>
            <Tab.Screen name="public" options={{ tabBarLabel: 'Public' }}>
                {(props: any) => <UserEditingPhotosScreen {...props} {...propsParent} tab="public" />}
            </Tab.Screen>
            <Tab.Screen name="private" options={{ tabBarLabel: 'My private album' }}>
                {(props: any) => <UserEditingPhotosScreen {...props} {...propsParent} tab="private" />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
