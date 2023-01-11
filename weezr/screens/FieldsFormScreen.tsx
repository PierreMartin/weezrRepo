import * as React from 'react';
import { ScrollView } from 'react-native';
import { Text, Box, Center, Button } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { StackScreenProps } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { IItem } from "../components/MenuList";
import { getInputField } from "./UserSpaceMenu/userSettings";
import { getNestedObjectByStringifyKeys, getValueInNestedObjectByStringifyKeys } from "../toolbox/toolbox";
import getStyles from "./FieldsFormScreen.styles";

const styles = getStyles();

interface IFieldsFormScreen extends StackScreenProps<any, 'FieldsForm'> {
    navigation: StackNavigationProp<any, any>;
}

function FieldsFormScreen(props: IFieldsFormScreen) {
    const {
        navigation,
        route
    } = props;

    const menuItem = route?.params as IItem || {};
    const [formData, setFormData] = React.useState<{ [name: string]: string | any }>({}); // Nested objects for local state (ex: 'career: { job }')
    const [formDataToUpdate, setFormDataToUpdate] = React.useState<{ [name: string]: any }>({}); // Dot notation for MongoDB updating (ex: 'career.job')
    const [isDisabled, setIsDisabled] = React.useState<boolean>(false);
    const haveSaveButton = !!menuItem?.renderScreen?.onFieldSubmit;

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: `${menuItem?.iconEmoji || ''} ${menuItem?.title}`,
            headerLeft: () => (
                <Button
                    size="xs"
                    onPress={() => navigation.goBack()}
                >
                    { haveSaveButton ? 'Cancel' : 'Back' }
                </Button>
            )
        });
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (menuItem) {
                let object = { [menuItem.id]: menuItem.value };

                object = getNestedObjectByStringifyKeys(menuItem.id, object, menuItem.value);
                setFormData(object);
                setFormDataToUpdate({ [menuItem.id]: menuItem.value });
            }
        }, [menuItem])
    );

    if (!menuItem) {
        console.error('There is no params');
        return <Center style={styles.main}><Text>Error at loading data...</Text></Center>;
    }

    // Get selected value:
    let selectedValue = formData[menuItem.id];
    if (menuItem?.id?.includes('.')) {
        selectedValue = getValueInNestedObjectByStringifyKeys(menuItem.id, formData);
    }

    const onFieldChange = (value: any, menuItemParam?: IItem, isInvalid?: boolean) => {
        setIsDisabled(!!isInvalid);

        if (setFormData && menuItemParam?.id) {
            setFormData((prevFormData) => {
                let object = { ...prevFormData, [menuItemParam.id]: value };
                object = getNestedObjectByStringifyKeys(menuItemParam.id, object, value);

                return object;
            });
        }

        if (setFormDataToUpdate && menuItemParam?.id) {
            setFormDataToUpdate((prevFormData) => {
                return { ...prevFormData, [menuItemParam.id]: value };
            });
        }
    };

    const param: IItem = {
        ...menuItem,
        value: selectedValue, // overload (because can't update from origin screen, we are in a navigated screen)
        renderScreen: {
            ...menuItem.renderScreen,
            onFieldChange // overload (because can't update from origin screen, we are in a navigated screen)
        }
    };

    const renderField = getInputField(param);

    return (
        <Box style={styles.main}>
            <ScrollView nestedScrollEnabled={false}>
                {/*
                <Center style={styles.container}>
                    <Text color="emerald.500">...</Text>
                </Center>
                */}

                <Center style={styles.container}>
                    { renderField }
                </Center>

                <Center style={styles.container}>
                    {
                        haveSaveButton && (
                            <Button
                                mt={8}
                                _text={{
                                    // color: "indigo.500"
                                }}
                                onPress={() => {
                                    if (menuItem.renderScreen?.onFieldSubmit) {
                                        menuItem.renderScreen.onFieldSubmit(formDataToUpdate);
                                        navigation.goBack();
                                    }
                                }}
                                isDisabled={isDisabled}
                            >
                                🚀 Save
                            </Button>
                        )
                    }
                </Center>
            </ScrollView>
        </Box>
    );
}

export default FieldsFormScreen;
