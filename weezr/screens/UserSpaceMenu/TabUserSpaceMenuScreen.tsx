import * as React from 'react';
import { connect } from "react-redux";
import { ScrollView } from 'react-native';
import { Text, Box, Center, Button } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { StackScreenProps } from "@react-navigation/stack";
import { IUser } from "../../entities";
import { States } from "../../reduxReducers/states";
import { IItemGroup, MenuListGroup } from "../../components/MenuListGroup";
import { IItem } from "../../components/MenuList";
import { Avatar } from "../../components/Avatar";
import { MenuItem } from "../../components/MenuItem";
import getStyles from "./TabUserSpaceMenuScreen.styles";

const styles = getStyles();

interface ITabUserSpaceMenuScreen extends StackScreenProps<any, 'TabUserSpaceMenu'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
}

const menuItems: IItemGroup = {
    items: [
        {
            id: 'UserEditingProfileMenu',
            renderScreen: {
                routeNameIfNavigable: 'UserEditingProfileMenu',
            },
            title: 'Edit my profile',
            description: 'Edit your profile information',
            iconStr: 'create-outline',
            iconEmoji: '✏️️',
            iconColor: '#d41998'
        },
        {
            id: 'UserPreferencesMenu',
            renderScreen: {
                routeNameIfNavigable: 'UserPreferencesMenu',
            },
            title: 'Preferences',
            description: 'Choose who you want to see',
            iconStr: 'funnel-outline',
            iconEmoji: '❤️',
            iconColor: '#4ec497'
        },
        {
            id: 'UserAccountSettingsMenu',
            renderScreen: {
                routeNameIfNavigable: 'UserAccountSettingsMenu',
            },
            title: 'Account settings',
            description: 'Manage your notifications, privacy settings and account',
            iconStr: 'settings-outline',
            iconEmoji: '⚙️',
            iconColor: '#808080'
        },
        {
            id: 'HelpSupportMenu',
            renderScreen: {
                routeNameIfNavigable: 'HelpSupportMenu',
            },
            title: 'Help & support',
            description: 'FAQ, tutorial and contact',
            iconStr: 'information-circle-outline',
            iconEmoji: '️ℹ️',
            iconColor: '#e77936'
        }
        /*
        {
            id: 'PremiumMenu',
            renderScreen: {
                routeNameIfNavigable: 'PremiumMenu',
            },
            title: 'Plan premium',
            description: 'Discover the premium plan',
            iconStr: 'settings-outline',
            iconEmoji: '🚀',
            iconColor: '#975329'
        }
        */
    ] as IItem[]
};

function TabUserSpaceMenuScreen({ navigation, me }: ITabUserSpaceMenuScreen) {
    if (!me?._id) {
        console.error('There is no userMe');
        return <Center style={styles.main}><Text>Error at loading data...</Text></Center>;
    }

    return (
        <Box style={styles.main}>
            <ScrollView nestedScrollEnabled={false}>
                <Center style={[styles.container, styles.headerContainer]}>
                    {/* <Heading>Welcome on<Text color="emerald.500"> Butterfly</Text></Heading> */}
                    <Avatar
                        style={{ position: 'absolute', top: 35 }}
                        user={me}
                        navigation={navigation}
                        size="xl"
                        label="See my profile"
                        routeNameNavigation="UserDetail"
                        displayDefaultAvatarIfNeeded
                    />
                </Center>

                <MenuListGroup
                    itemsGroup={[menuItems]}
                    navigation={navigation}
                />

                <Center style={styles.container}>
                    <Button
                        mt={8}
                        _text={{
                            // color: "indigo.500"
                        }}
                        onPress={() => navigation.navigate('Premium')}
                    >
                        🚀 Discover the premium plan 🚀
                    </Button>
                </Center>
            </ScrollView>
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null)(TabUserSpaceMenuScreen);
