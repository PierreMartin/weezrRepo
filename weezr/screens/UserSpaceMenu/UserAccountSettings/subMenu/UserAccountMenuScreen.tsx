/* eslint-disable @typescript-eslint/dot-notation */
import * as React from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ScrollView } from 'react-native';
import { Text, Box, Center, Button } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
// import { useTranslation } from "react-i18next";
import { updateUserAction } from "../../../../reduxActions/user";
import { IUser} from "../../../../entities";
import { States } from "../../../../reduxReducers/states";
import { IItemGroup, MenuListGroup } from "../../../../components/MenuListGroup";
import { logoutAction } from "../../../../reduxActions/authentication";
import { IItem } from "../../../../components/MenuList";
import userSettings, { onUpdateUserSettings } from "../../userSettings";
import { getNestedObjectByStringifyKeys } from "../../../../toolbox/toolbox";
import getStyles from "./UserAccountMenuScreen.styles";

const styles = getStyles();

interface IUserAccountMenuScreen extends StackScreenProps<any, 'UserAccountMenu'> {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    updateUserActionProps: (data: any) => any;
    logoutActionProps: () => any;
}

const USERS = gql`
    query {
        users {
            __typename
        }
    }
`;

const UPDATE_USER = gql`
    mutation ($filter: User_Filter, $data: User_Data) {
        updateUser(filter: $filter, data: $data) {
            updatedPageInfo {
                success
                message
            }
            updatedData {
                id
                email
                preferenceAccount
            }
        }
    }
`;

function UserAccountMenuScreen({ navigation, route, me, updateUserActionProps, logoutActionProps }: IUserAccountMenuScreen) {
    const [formData, setFormData] = React.useState<{ [name: string]: any }>({}); // Nested objects for local state (ex: 'career: { job }')
    const [formDataToUpdate, setFormDataToUpdate] = React.useState<{ [name: string]: any }>({}); // Dot notation for MongoDB updating (ex: 'career.job')
    const [updateUser, { error: updateUsrError }] = useMutation(UPDATE_USER);
    // @ts-ignore
    const [{ client }] = useLazyQuery(USERS);
    const formDataToUpdateRef: any = React.useRef();
    // const { i18n } = useTranslation();

    useFocusEffect(
        React.useCallback(() => {
            setFormData({
                email: me.email,
                preferenceAccount: me.preferenceAccount
            });
        }, [me])
    );

    React.useEffect(() => {
        formDataToUpdateRef.current = formDataToUpdate;
    }, [formDataToUpdate]);

    const onUpdateUser = (dataToUpdate: Partial<IUser>) => {
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

    // When submit form in screens after navigate to menu:
    const onFieldSubmit = (field: any) => {
        return onUpdateUser(field);
    };

    const onLogout = () => {
        logoutActionProps().then((res: any) => {
            if ((res?.payload?.authenticatedState as States.IAuthenticatedState) === 'disconnected') {
                navigation.navigate('Start');
                if (client) { client.clearStore(); } // https://www.apollographql.com/docs/react/networking/authentication/#reset-store-on-logout
            }
        });
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

    const menuItems: IItemGroup = {
        items: [
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['email'],
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['preferenceAccount.unitSystem'],
            userSettings.getItems(formData, onFieldChange, onFieldSubmit)['preferenceAccount.language']
        ] as IItem[]
    };

    return (
        <Box style={styles.main}>
            <ScrollView nestedScrollEnabled={false}>
                <MenuListGroup
                    itemsGroup={[menuItems]}
                    navigation={navigation}
                    parentMenuItem={route?.params as IItem}
                />

                <Center style={styles.container}>
                    <Button
                        mt={8}
                        onPress={() => onLogout()}
                    >
                        Logout
                    </Button>

                    <Button
                        mt={8}
                        _text={{
                            // color: "indigo.500"
                        }}
                        size="sm"
                        variant="outline"
                        onPress={() => {
                            //
                        }}
                    >
                        ⚠️ Delete account ⚠️
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

function mapDispatchToProps(dispatch: any) {
    return {
        updateUserActionProps: bindActionCreators(updateUserAction, dispatch),
        logoutActionProps: bindActionCreators(logoutAction, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAccountMenuScreen);
