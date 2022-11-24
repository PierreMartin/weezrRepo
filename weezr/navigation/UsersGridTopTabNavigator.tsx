// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import TabUsersGridScreen from "../screens/TabUsersGridScreen";

const Tab: any = createMaterialTopTabNavigator<any>();

export default function UsersGridTopTabNavigator(propsParent: any) {
    const styles = {
        size: 20
    };

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: { fontSize: 12 },
                // tabBarItemStyle: { width: 100 },
                // tabBarScrollEnabled: true,
                tabBarShowLabel: false
            }}
        >
            <Tab.Screen
                name="All"
                options={{
                    tabBarLabel: 'All',
                    tabBarIcon: ({ color }: any) => <Ionicons size={styles.size} name="earth-outline" color={color} />
                }}
            >
                {(props: any) => <TabUsersGridScreen {...props} {...propsParent} selectedTab={null} />}
            </Tab.Screen>

            <Tab.Screen
                name="Followers"
                options={{
                    tabBarLabel: 'Followers',
                    tabBarIcon: ({ color }: any) => <Ionicons size={styles.size} name="star-outline" color={color} />
                }}
            >
                {(props: any) => <TabUsersGridScreen {...props} {...propsParent} selectedTab="followers" />}
            </Tab.Screen>

            <Tab.Screen
                name="Friends"
                options={{
                    tabBarLabel: 'Friendly',
                    tabBarIcon: ({ color }: any) => <Ionicons size={styles.size} name="beer-outline" color={color} />
                }}
            >
                {(props: any) => <TabUsersGridScreen {...props} {...propsParent} selectedTab="friends" />}
            </Tab.Screen>

            <Tab.Screen
                name="Love"
                options={{
                    tabBarLabel: 'Lovely',
                    tabBarIcon: ({ color }: any) => <Ionicons size={styles.size} name="heart-outline" color={color} />
                }}
            >
                {(props: any) => <TabUsersGridScreen {...props} {...propsParent} selectedTab="loveRelationship" />}
            </Tab.Screen>

            <Tab.Screen
                name="Fun"
                options={{
                    tabBarLabel: 'Funny', // flame-outline
                    tabBarIcon: ({ color }: any) => <Ionicons size={styles.size} name="thermometer-outline" color={color} />
                }}
            >
                {(props: any) => <TabUsersGridScreen {...props} {...propsParent} selectedTab="fun" />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
