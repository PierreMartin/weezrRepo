import * as React from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ScrollView } from 'react-native';
import { Text, Box, Center } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { gql, useMutation } from "@apollo/client";
import { updateUserAction } from "../../../reduxActions/user";
import { IUser } from "../../../entities";
import { States } from "../../../reduxReducers/states";
import { IItemGroup, MenuListGroup } from "../../../components/MenuListGroup";
import { IItem } from "../../../components/MenuList";
import userSettings, { onUpdateUserSettings } from "../userSettings";
import { getNestedObjectByStringifyKeys } from "../../../toolbox/toolbox";
import getStyles from "./UserPreferencesMenuScreen.styles";

const styles = getStyles();

interface IUserPreferencesMenuScreen extends StackScreenProps<any, 'UserPreferencesMenu'> {
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
                preferencesFilter
            }
        }
    }
`;

function UserPreferencesMenuScreen({ navigation, route, me, updateUserActionProps }: IUserPreferencesMenuScreen) {
    const [formData, setFormData] = React.useState<{ [name: string]: any }>({}); // Nested objects for local state (ex: 'career: { job }')
    const [formDataToUpdate, setFormDataToUpdate] = React.useState<{ [name: string]: any }>({}); // Dot notation for MongoDB updating (ex: 'career.job')

    const [updateUser, { error: updateUsrError }] = useMutation(UPDATE_USER, {
        update: (cache, data: any) => {
            const { updatedData } = data?.data?.updateUser;
            const { id } = updatedData || {};

            // If deleted:
            if (id) {
                cache.evict({ fieldName: 'users', broadcast: false });
                cache.gc();
            }
        }
    });

    const formDataToUpdateRef: any = React.useRef();

    useFocusEffect(
        React.useCallback(() => {
            setFormData({
                preferencesFilter: me.preferencesFilter
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

    /*
    // When submit form in screens after navigate to menu:
    const onFieldSubmit = (field: any) => {
        return onUpdateUser(field);
    };
    */

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

    const menuItems: IItemGroup = {
        items: [
            userSettings.getItems(formData, onFieldChange)['preferencesFilter.desiredGender'],
            userSettings.getItems(formData, onFieldChange)['preferencesFilter.desiredAgeRange'],
            userSettings.getItems(formData, onFieldChange)['preferencesFilter.profileWithPhotoOnly']
        ] as IItem[]
    };

    return (
        <Box style={styles.main}>
            <ScrollView nestedScrollEnabled={false}>
                <MenuListGroup
                    itemsGroup={[
                        menuItems
                    ]}
                    navigation={navigation}
                    parentMenuItem={route?.params as IItem}
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

export default connect(mapStateToProps, mapDispatchToProps)(UserPreferencesMenuScreen);
