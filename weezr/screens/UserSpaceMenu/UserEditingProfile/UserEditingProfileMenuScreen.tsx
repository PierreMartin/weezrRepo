/* eslint-disable @typescript-eslint/dot-notation */
import * as React from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ScrollView } from 'react-native';
import { Text, Box, Center, Button } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { gql, useMutation } from "@apollo/client";
import { updateUserAction } from "../../../reduxActions/user";
import { IUser } from "../../../entities";
import { States } from "../../../reduxReducers/states";
import { MenuListGroup, IItemGroup } from "../../../components/MenuListGroup";
import { IItem } from "../../../components/MenuList";
import { Avatar } from "../../../components/Avatar";
import userSettings, { onUpdateUserSettings } from "../userSettings";
import { getNestedObjectByStringifyKeys } from "../../../toolbox/toolbox";
import getStyles from "./UserEditingProfileMenuScreen.styles";

const styles = getStyles();

interface IUserEditingProfileMenuScreen extends StackScreenProps<any, 'UserEditingProfileMenu'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    updateUserActionProps: (data: any) => any;
}

const UPDATE_USER = gql`
    mutation ($filter: User_Filter, $data: User_Data) {
        updateUser(filter: $filter, data: $data) {
            updatedPageInfo {
                success
                message
            }
            updatedData {
                id
                displayName
                about
                career
                physicalAppearance
            }
        }
    }
`;

// NOTE: bug with keyword 'career', Redux mute this field, event if not update to store
function UserEditingProfileMenuScreen({ navigation, route, me, updateUserActionProps }: IUserEditingProfileMenuScreen) {
    const [formData, setFormData] = React.useState<{ [name: string]: any }>({}); // Nested objects for local state (ex: 'career: { job }')
    const [formDataToUpdate, setFormDataToUpdate] = React.useState<{ [name: string]: any }>({}); // Dot notation for MongoDB updating (ex: 'career.job')
    const [updateUser, { error: updateUsrError }] = useMutation(UPDATE_USER);
    const formDataToUpdateRef: any = React.useRef();
    const { onRefreshParentScreen } = route.params || {};

    React.useEffect(() => {
        return () => { if (onRefreshParentScreen) { onRefreshParentScreen(); } };
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            setFormData({
                about: me.about,
                career: me.career,
                displayName: me.displayName,
                physicalAppearance: me.physicalAppearance,
            });
        }, [me])
    );

    React.useEffect(() => {
        formDataToUpdateRef.current = formDataToUpdate;
    }, [formDataToUpdate]);

    const onUpdateUser = (dataToUpdate: any) => {
        const params = {
            dataToUpdate,
            mutationName: 'updateUser',
            mutationFunc: updateUser,
            updateEntityActionProps: updateUserActionProps,
            me
        };

        return onUpdateUserSettings(params)
            .then((res: any) => {
                if (res) { formDataToUpdateRef.current = null; }
                return Promise.resolve(res);
            });
    };

    // When component unmount - see https://stackoverflow.com/questions/60456803/how-to-access-state-when-component-unmount-with-react-hooks
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                onUpdateUser(formDataToUpdateRef.current);
            };
        }, [])
    );

    // console.log(formData);

    // When submit form in screens after navigate to menu:
    const onFieldSubmit = (field: any) => {
        return onUpdateUser(field);
    };

    if (!me?._id) {
        console.error('There is no userMe');
        return <Center style={styles.main}><Text>Error at loading data...</Text></Center>;
    }

    if (updateUsrError) {
        console.error(updateUsrError); // Display toast
    }

    const onFieldChange = (value: any, menuItem?: IItem) => {
        if (setFormData && menuItem?.id) {
            setFormData((prevFormData) => {
                let object = { ...prevFormData, [menuItem.id]: value };
                object = getNestedObjectByStringifyKeys(menuItem.id, object, value);

                return object;
            });
        }

        if (setFormDataToUpdate && menuItem?.id) {
            setFormDataToUpdate((prevFormData) => {
                return { ...prevFormData, [menuItem.id]: value };
            });
        }
    };

    const menuItemsAbout: IItemGroup = {
        config: {
            renderHeader: 'About me'
        },
        items: [
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['displayName'],
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['about.aboutMe']
        ] as IItem[]
    };

    const menuItemsCareer: IItemGroup = {
        config: {
            renderHeader: 'Employment and studies'
        },
        items: [
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['career.job'],
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['career.employer']
        ] as IItem[]
    };

    const menuItemsInfos: IItemGroup = {
        config: {
            renderHeader: 'Infos'
        },
        items: [
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['about.desiredMeetingType'],
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['about.relationship']
        ] as IItem[]
    };

    const menuItemsPhysicalAppearance: IItemGroup = {
        config: {
            renderHeader: 'Physical appearance'
        },
        items: [
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['physicalAppearance.height'],
        ] as IItem[]
    };

    return (
        <Box style={styles.main}>
            <ScrollView nestedScrollEnabled={false}>
                <Center style={styles.container}>
                    <Avatar
                        style={{ marginTop: 8 }}
                        user={me}
                        navigation={navigation}
                        size="lg"
                        label="✏️ Edit your photos"
                        routeNameNavigation="UserEditingPhotos"
                        displayDefaultAvatarIfNeeded
                    />
                </Center>

                <MenuListGroup
                    itemsGroup={[
                        menuItemsAbout,
                        menuItemsCareer,
                        menuItemsInfos,
                        menuItemsPhysicalAppearance
                    ]}
                    navigation={navigation}
                    parentMenuItem={route?.params as IItem}
                    renderHeader={() => {
                        return {
                            headerRight: () => (
                                <Box pr="2" pt="2">
                                    <Button
                                        // leftIcon={<Icon as={Ionicons} name="eye-outline" size="xs" />}
                                        size="xs"
                                        _text={{
                                            fontSize: 10,
                                            padding: 0
                                        }}
                                        variant="unstyled"
                                        onPress={() => navigation.navigate('UserDetail', { userId: me._id })}
                                    >
                                        See my profile
                                    </Button>
                                </Box>
                            )
                        };
                    }}
                />
            </ScrollView>
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        updateUserActionProps: bindActionCreators(updateUserAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserEditingProfileMenuScreen);
