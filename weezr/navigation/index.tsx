import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';
import OnboardingScreen from "../screens/OnboardingScreen";
import NotFoundScreen from '../screens/NotFoundScreen';
import LinkingConfiguration from './LinkingConfiguration';
import StartScreen from "../screens/Authentification/StartScreen";
import LoginScreen from "../screens/Authentification/LoginScreen";
import GetDataComponent from "../components/GetDataComponent";
import UserDetailScreen from "../screens/UserDetailScreen";
import ThreadDetailScreen from "../screens/ThreadDetailScreen";
import UserEditingProfileMenuScreen from "../screens/UserSpaceMenu/UserEditingProfile/UserEditingProfileMenuScreen";
import UserPreferencesMenuScreen from "../screens/UserSpaceMenu/UserPreferences/UserPreferencesMenuScreen";
import UserAccountSettingsMenuScreen from "../screens/UserSpaceMenu/UserAccountSettings/UserAccountSettingsMenuScreen";
import UserNotificationsMenuScreen from "../screens/UserSpaceMenu/UserAccountSettings/subMenu/UserNotificationsMenuScreen";
import UserPrivacyMenuScreen from "../screens/UserSpaceMenu/UserAccountSettings/subMenu/UserPrivacyMenuScreen";
import UserAccountMenuScreen from "../screens/UserSpaceMenu/UserAccountSettings/subMenu/UserAccountMenuScreen";
import UserEditingPhotosTopTabNavigator from "./UserEditingPhotosTopTabNavigator";
import FieldsFormScreen from "../screens/FieldsFormScreen";
import PhotoDetailModalScreen from "../screens/modals/PhotoDetailModalScreen";
import MapModalScreen from "../screens/modals/MapModalScreen";
import { States } from "../reduxReducers/states";

const RootStack = createNativeStackNavigator<any>();
const MainStack = createNativeStackNavigator<any>();

interface IRootStackScreen extends StackScreenProps<any, 'Root'> {
    authenticatedState: States.IAuthenticatedState;
    isOnboardingNeverUsed: boolean;
}

function RootStackScreen({ authenticatedState, navigation, isOnboardingNeverUsed }: IRootStackScreen) {
    React.useEffect(() => {
        if (authenticatedState === 'error') {
            navigation.navigate('Start');
        }
    }, [authenticatedState]);

    return (
        <MainStack.Navigator>
            {
                (authenticatedState === 'connected') ? (
                    // Screens for logged in users
                    // TODO <MainStack.Screen name="Main" component={GetDataComponentRoot} options={{ headerShown: false }} />
                    // In GetDataComponentRoot => { Screen="Main" comp="GetDataComponent", Screen="UserDetail", Screen="ThreadDetail" }
                    <>
                        {
                            (isOnboardingNeverUsed) && (
                                <MainStack.Screen
                                    name="Onboarding"
                                    component={OnboardingScreen}
                                    options={{ animationTypeForReplace: 'pop', headerShown: false }}
                                />
                            )
                        }

                        <MainStack.Screen name="Main" component={GetDataComponent} options={{ headerShown: false }} />
                        <MainStack.Screen name="NotFound" component={NotFoundScreen} options={{ headerShown: false, title: 'Oops!' }} />
                        <MainStack.Screen name="UserDetail" component={UserDetailScreen} />
                        <MainStack.Screen name="ThreadDetail" component={ThreadDetailScreen} />

                        <MainStack.Screen name="UserEditingProfileMenu" component={UserEditingProfileMenuScreen} />
                        <MainStack.Screen name="UserPreferencesMenu" component={UserPreferencesMenuScreen} />
                        <MainStack.Screen name="UserAccountSettingsMenu" component={UserAccountSettingsMenuScreen} />
                        <MainStack.Screen name="UserNotificationsMenu" component={UserNotificationsMenuScreen} />
                        <MainStack.Screen name="UserPrivacyMenu" component={UserPrivacyMenuScreen} />
                        <MainStack.Screen name="UserAccountMenu" component={UserAccountMenuScreen} />
                        <MainStack.Screen name="UserEditingPhotos" component={UserEditingPhotosTopTabNavigator} />

                        <MainStack.Screen name="FieldsForm" component={FieldsFormScreen} />

                        <MainStack.Group screenOptions={{ presentation: 'modal' }}>
                            <MainStack.Screen
                                name="PhotoDetailModal"
                                component={PhotoDetailModalScreen}
                                initialParams={{ isEditing: false, isForwardItem: false }}
                            />
                            <MainStack.Screen
                                name="MapModal"
                                component={MapModalScreen}
                            />
                            {/* <MainStack.Screen name="XxxModal" component={XxxModalScreen} /> */}
                        </MainStack.Group>
                    </>
                ) : (
                    // Auth screens
                    <>
                        <MainStack.Screen
                            name="Start"
                            component={StartScreen}
                            options={{ animationTypeForReplace: (authenticatedState === 'disconnected') ? 'pop' : 'push' }}
                        />
                        <MainStack.Screen name="Login" component={LoginScreen} />{/* Login and register */}
                    </>
                )
            }

            {/* Common modal screens */}
            {/*
            <MainStack.Group screenOptions={{ presentation: 'modal' }}>
                <MainStack.Screen name="Help" component={Help} />
                <MainStack.Screen name="Invite" component={Invite} />
            </MainStack.Group>
            */}
        </MainStack.Navigator>
    );
}

interface INavigation {
    colorScheme: ColorSchemeName;
    authenticatedState: States.IAuthenticatedState;
    isOnboardingNeverUsed: boolean;
}

export default function Navigation({ colorScheme, authenticatedState, isOnboardingNeverUsed }: INavigation) {
    return (
        <NavigationContainer
            linking={LinkingConfiguration as any}
            theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
            <RootStack.Navigator initialRouteName="Root">
                <RootStack.Screen name="Root" options={{ headerShown: false }}>
                    {(props) => {
                        return (
                            <RootStackScreen
                                {...props}
                                authenticatedState={authenticatedState}
                                isOnboardingNeverUsed={isOnboardingNeverUsed}
                            />
                        );
                    }}
                </RootStack.Screen>
                {/* <RootStack.Screen name="Xxx" component={XxxScreen} /> */}
            </RootStack.Navigator>
        </NavigationContainer>
    );
}
