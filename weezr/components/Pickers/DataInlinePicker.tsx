// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ImageStyle, TextStyle, TouchableHighlight, ViewStyle } from "react-native";
import { Icon, Button, Box, Text } from 'native-base';
import { IFormRulesConfig, validateField } from "../Forms/Form";
import { Label } from "../index";
import getStyles from "./DataInlinePicker.styles";
import colors from "../../styles/colors";

const styles = getStyles();

type IStyles = ViewStyle | TextStyle | ImageStyle;

interface IData {
    label: string;
    value: any;
    icon?: string;
}

interface IDataInlinePicker {
    label?: string;
    placeholder?: string;
    canMultipleSelect?: boolean;

    // handling validation:
    rules?: IFormRulesConfig[];
    enabledValidationOnTyping?: boolean;

    onChange?: (value: string | any) => void;
    onSubmit?: (value: string | any) => void;

    data?: IData[];
    value?: string | any;
    error?: string | any;

    layout?: any;
    styleContainerField?: IStyles;
}

export const DataInlinePicker = ({
    data,
    value: valueProps,
    error: errorProps,
    rules,
    label,
    onChange,
    onSubmit,
    enabledValidationOnTyping,
    layout,
    styleContainerField = {}
}: IDataInlinePicker) => {
    const [value, setValue] = useState<string | any>(null);
    const [error, setError] = useState<string | any>(null);

    useEffect(() => {
        if (valueProps) {
            setValue(valueProps);
        }
    }, [valueProps]);

    useEffect(() => {
        if (errorProps) {
            setError(errorProps);
        }
    }, [errorProps]);

    const onChangeVal = (valueParam: any) => {
        setValue(valueParam);

        if (enabledValidationOnTyping) {
            setError(null);

            const isValidate = validateField(
                valueParam,
                rules?.filter((rule: any) => rule) || [],
                setError,
                true
            );

            if (onChange && isValidate) { onChange(valueParam); }

            return;
        }

        if (onChange) { onChange(valueParam); }
    };

    const ruleToDisplay = rules?.find((rule: any) => rule.displayMessageAsInfo);
    const isRequired = !!rules?.find((rule: any) => rule.required);
    let errorsStyles: any = {};

    // If invalid:
    if (error) {
        errorsStyles = {
            borderColor: 'red',
            borderWidth: 1.5
        };
    }

    return (
        <Box style={[styleContainerField]}>
            {
                label && (
                    <Label style={{ color: 'white' }} isRequired={isRequired}>
                        {label}
                    </Label>
                )
            }

            <Box style={{ flexDirection: layout.dataList, ...styles.itemsContainer }}>
                {
                    data?.map((option, index) => {
                        const isSelectedItem = (value && value === option?.value);

                        let selectedItemStyles: any = {};
                        if (isSelectedItem) {
                            selectedItemStyles = {
                                borderColor: colors.primary,
                                backgroundColor: colors.primary
                            };
                        }

                        return (
                            <TouchableHighlight
                                key={index}
                                activeOpacity={0.8}
                                underlayColor="transparent"
                                onPress={() => onChangeVal(option.value)}
                                style={{ alignItems: 'center' }}
                            >
                                <Box style={{ alignItems: 'center' }}>
                                    <Box
                                        style={{
                                            ...styles.itemContainer,
                                            ...selectedItemStyles,
                                            ...errorsStyles
                                        }}
                                    >
                                        {
                                            option.icon ? (
                                                <Icon
                                                    as={Ionicons}
                                                    name={option.icon}
                                                    size="2xl"
                                                    color={isSelectedItem ? colors.bg.main : colors.text.main}
                                                />
                                            ) : (
                                                <Text color={isSelectedItem ? '#fff' : colors.text.main}>
                                                    {option.label}
                                                </Text>
                                            )
                                        }
                                    </Box>

                                    <Text color={isSelectedItem ? '#fff' : colors.text.main}>
                                        {option.label}
                                    </Text>
                                </Box>
                            </TouchableHighlight>
                        );
                    })
                }
            </Box>

            { error && (
                <Box style={styles.messagesContainer}>
                    <Icon as={Ionicons} name="alert-circle-outline" size="sm" mr={1} color="red.500" />
                    <Text color="red.500">{ error }</Text>
                </Box>
            )}

            { ruleToDisplay?.message && (
                <Box style={styles.messagesContainer}>
                    <Text color={colors.text.main}>{ ruleToDisplay.message }</Text>
                </Box>
            ) }

            {/* Submit (optional): */}
            {
                onSubmit && (
                    <Button
                        mt="2"
                        onPress={() => {
                            setError(null);

                            const isValidate = validateField(
                                value,
                                rules?.filter((rule: any) => rule) || [],
                                setError,
                                true
                            );

                            if (isValidate) {
                                onSubmit(value);
                            }
                        }}
                    >
                        Submit
                    </Button>
                )
            }
        </Box>
    );
};
