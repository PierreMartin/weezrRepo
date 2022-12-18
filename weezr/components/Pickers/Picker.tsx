// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import React, { useEffect, useState } from 'react';
import { Icon, FormControl, Button, CheckIcon, Select } from 'native-base';
import { IFormRulesConfig, validateField } from "../Forms/Form";

interface IData {
    label: string;
    value: any;
}

interface IPicker {
    type: 'select' | 'inputSelect' | 'wheel' | 'date';
    mode?: 'block' | 'line' | 'dot'; // TODO
    fieldId: string;
    label?: string;
    placeholder?: string;
    canMultipleSelect?: boolean;

    // handling valid:
    rules?: IFormRulesConfig[];
    enabledValidationOnTyping?: boolean;

    onChange?: (fieldId: string, value: any) => void;
    onSubmit?: (formValues: any) => void;

    data?: IData[];
    formValues?: { [fieldId: string]: string | any };
    formErrors?: { [fieldId: string]: string | any };

    styleContainerField?: ViewStyle | TextStyle | ImageStyle;
    styleInputField?: ViewStyle | TextStyle | ImageStyle;
}

export const Picker = ({
    fieldId,
    data,
    formValues: formValuesProps,
    formErrors: formErrorsProps,
    rules,
    type,
    label,
    placeholder,
    onChange,
    onSubmit,
    enabledValidationOnTyping,
    styleContainerField = {},
    // styleInputField = {},
}: IPicker) => {
    const [formValues, setFormValues] = useState<{ [fieldId: string]: string | any }>({});
    const [formErrors, setFormErrors] = useState<{ [fieldId: string]: string | any }>({});

    useEffect(() => {
        if (formValuesProps) {
            setFormValues(formValuesProps);
        }
    }, [formValuesProps]);

    useEffect(() => {
        if (formErrorsProps) {
            setFormErrors(formErrorsProps);
        }
    }, [formErrorsProps]);

    const onChangeVal = (fieldIdParam: string, valueParam: any) => {
        setFormValues({ [fieldIdParam]: valueParam });

        if (onChange) { onChange(fieldIdParam, valueParam); }

        if (enabledValidationOnTyping) {
            setFormErrors({});

            validateField(
                { [fieldId]: valueParam },
                { [fieldId]: rules?.filter((rule: any) => rule) || [] },
                setFormErrors
            );
        }
    };

    const formValue = (formValues && formValues[fieldId]) || null;
    let renderInput = null;

    let pickerStyles: any = {
        py: 1,
        px: 2,
        focusOutlineColor: '#616161',
        _focus: { bg: 'transparent' },
        _invalid: { borderColor: 'red.500', borderWidth: 1.5 },
        _selectedItem: {
            bg: "primary.500",
            endIcon: <CheckIcon size="5" color="#fff" />
        }
    };

    // If invalid:
    if (formErrors && formErrors[fieldId]) {
        pickerStyles = { ...pickerStyles, ...pickerStyles._invalid };
    }

    switch (type) {
        case "inputSelect":
            renderInput = (
                <Select
                    selectedValue={formValue}
                    minWidth="200"
                    placeholder={placeholder}
                    onValueChange={(value: string) => onChangeVal && onChangeVal(fieldId, value)}
                    {...pickerStyles}
                >
                    {
                        data?.map((option, index) => {
                            return <Select.Item key={index} label={option.label} value={option.value} />;
                        })
                    }
                </Select>
            );
            break;
        default:
            break;
    }

    const ruleToDisplay = rules?.find((rule: any) => rule.displayMessageAsInfo);
    const isRequired = !!rules?.find((rule: any) => rule.required);

    return (
        <FormControl
            isRequired={isRequired}
            isInvalid={formErrors ? !!formErrors[fieldId] : false}
            style={[styleContainerField]}
        >
            { label && <FormControl.Label>{label}</FormControl.Label> }
            { renderInput }

            { formErrors && formErrors[fieldId] && (
                <FormControl.ErrorMessage
                    _text={{fontSize: "xs"}}
                    leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}
                >
                    { formErrors[fieldId] }
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
                            setFormErrors({});

                            const isValidate = validateField(
                                formValues,
                                { [fieldId]: rules?.filter((rule: any) => rule) || [] },
                                setFormErrors
                            );

                            if (isValidate) {
                                onSubmit(formValues);
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
