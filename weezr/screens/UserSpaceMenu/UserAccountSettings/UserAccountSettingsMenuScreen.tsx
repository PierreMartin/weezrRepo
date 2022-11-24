import * as React from 'react';
import { ScrollView } from 'react-native';
import { Box } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { StackScreenProps } from "@react-navigation/stack";
import { IUser } from "../../../entities";
import { IItemGroup, MenuListGroup } from "../../../components/MenuListGroup";
import { IItem } from "../../../components/MenuList";
import { MenuItem } from "../../../components/MenuItem";
import getStyles from "./UserAccountSettingsMenuScreen.styles";

const styles = getStyles();

interface IUserAccountSettingsMenuScreen extends StackScreenProps<any, 'UserAccountSettingsMenu'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
}

const menuItems: IItemGroup = {
    items: [
        {
            id: 'UserNotificationsMenu',
            renderScreen: {
                routeNameIfNavigable: 'UserNotificationsMenu'
            },
            title: 'Notifications',
            description: 'Parameters of your notifications',
            iconStr: 'create-outline',
            iconEmoji: '✏️️',
            iconColor: '#d41998'
        },
        {
            id: 'UserPrivacyMenu',
            renderScreen: {
                routeNameIfNavigable: 'UserPrivacyMenu',
            },
            title: 'Privacy',
            description: 'Parameters of your privacy',
            iconStr: 'create-outline',
            iconEmoji: '✏️️',
            iconColor: '#d41998'
        },
        {
            id: 'UserAccountMenu',
            renderScreen: {
                routeNameIfNavigable: 'UserAccountMenu',
            },
            title: 'User account',
            description: 'Parameters of your account',
            iconStr: 'create-outline',
            iconEmoji: '⚙️️️',
            iconColor: '#d41998'
        }
    ] as IItem[]
};

function UserAccountSettingsMenuScreen({ navigation, route }: IUserAccountSettingsMenuScreen) {
    return (
        <Box style={styles.main}>
            <ScrollView nestedScrollEnabled={false}>
                <MenuListGroup
                    itemsGroup={[menuItems]}
                    navigation={navigation}
                    parentMenuItem={route?.params as IItem}
                />
            </ScrollView>
        </Box>
    );
}

export default UserAccountSettingsMenuScreen;
