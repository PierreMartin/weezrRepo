// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import React, { useEffect, useState } from 'react';
import { Icon, FormControl, Button, CheckIcon, Select } from 'native-base';
import { IFormRulesConfig, validateField } from "../Forms/Form";
import colors from "../../styles/colors";

type IStyles = ViewStyle | TextStyle | ImageStyle;

interface IData {
    label: string;
    value: any;
}

interface IPickerInputSelect {
    // fieldId: string;
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

    styleContainerField?: IStyles;
    styleInputField?: IStyles;
}

export const PickerInputSelect = ({
    data,
    value: valueProps,
    error: errorProps,
    rules,
    label,
    placeholder,
    onChange,
    onSubmit,
    enabledValidationOnTyping,
    styleContainerField = {},
    // styleInputField = {},
}: IPickerInputSelect) => {
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

    let pickerStyles: any = {
        py: 1,
        px: 2,
        minWidth: "100%",
        focusOutlineColor: '#616161',
        color: colors.text.main,
        _focus: { bg: 'transparent' },
        _invalid: { borderColor: 'red.500', borderWidth: 1.5 },
        _selectedItem: {
            bg: "primary.500",
            endIcon: <CheckIcon size="5" color="#fff" />
        }
    };

    // If invalid:
    if (error) {
        pickerStyles = { ...pickerStyles, ...pickerStyles._invalid };
    }

    const ruleToDisplay = rules?.find((rule: any) => rule.displayMessageAsInfo);
    const isRequired = !!rules?.find((rule: any) => rule.required);

    return (
        <FormControl
            isRequired={isRequired}
            isInvalid={!!error}
            style={[styleContainerField]}
        >
            { label && <FormControl.Label>{label}</FormControl.Label> }

            <Select
                selectedValue={value}
                placeholder={placeholder}
                onValueChange={(val: string) => onChangeVal && onChangeVal(val)}
                {...pickerStyles}
            >
                {
                    data?.map((option, index) => {
                        return <Select.Item key={index} label={option.label} value={option.value} />;
                    })
                }
            </Select>

            { error && (
                <FormControl.ErrorMessage
                    _text={{fontSize: "xs"}}
                    leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}
                >
                    { error }
                </FormControl.ErrorMessage>
            )}

            {
                ruleToDisplay?.message && (
                    <FormControl.HelperText>
                        { ruleToDisplay?.message }
                    </FormControl.HelperText>
                )
            }

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
        </FormControl>
    );
};
