// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import React, { Component, useEffect, useState } from 'react';
import { Icon, Input as InputBase, VStack, FormControl, Button, TextArea } from 'native-base';

type IFormRulesConfigFormat = null | 'email' | 'url';

interface IFormRulesConfig {
    required?: boolean;
    message: string;
    format?: IFormRulesConfigFormat;
}

interface IInput {
    type: 'inputText' | 'inputTextArea' | 'inputSearch' | 'inputPassword' | 'inputSelect' | 'button' | 'buttonAsLink' | 'text' | 'submit';
    fieldId: string;
    label?: string;
    placeholder?: string;
    elementInsideInput?: {
        type: 'icon' | 'button';
        placement: 'left' | 'right' | 'top' | 'bottom';
        iconName?: string;
    };
    content?: any;

    // handling valid:
    rules?: IFormRulesConfig[];
    getRules?: (rules: any) => void;
    enabledValidationOnTyping?: boolean;

    onChangeText?: (fieldId: string, value: any) => void;
    onSubmit?: (formValues: any) => void;

    formValues?: { [fieldId: string]: string | any };
    formErrors?: { [fieldId: string]: string | any };

    styleContainerField?: ViewStyle | TextStyle | ImageStyle;
    styleInputField?: ViewStyle | TextStyle | ImageStyle;
}

export const validateField = (
    formValues: { [fieldId: string]: string },
    formRules: { [fieldId: string]: IFormRulesConfig[] },
    setState?: (formErrors: any) => void
) => {
    const regexForEmail = RegExp(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gi);
    const regexForUrl = RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
    let isValidate = true;

    for (const fieldId in formRules) {
        if (formRules.hasOwnProperty(fieldId)) {
            const fieldRule: any = formRules[fieldId];
            const fieldValue = formValues[fieldId];

            for (let i = 0; i < fieldRule?.length; i++) {
                const rule = fieldRule[i];
                const message = rule.message || 'An error has occurred';

                // Check if required:
                const required = rule.required;
                if (required && !fieldValue) {
                    if (setState) { setState({ [fieldId]: message }); }
                    isValidate = false;
                }

                // Check if confirmPassword match with password:
                const matchWith = rule.matchWith;
                if (matchWith && formValues[matchWith] !== fieldValue) {
                    if (setState) { setState({ [fieldId]: message }); }
                    isValidate = false;
                }

                // Check if right format:
                const format = rule.format as IFormRulesConfigFormat;
                if (format) {
                    switch (format) {
                        case 'email':
                            if (fieldValue && !regexForEmail.test(fieldValue?.toLowerCase())) {
                                if (setState) { setState({ [fieldId]: message }); }
                                isValidate = false;
                            }
                            break;
                        case 'url':
                            if (fieldValue && !regexForUrl.test(fieldValue)) {
                                if (setState) { setState({ [fieldId]: message }); }
                                isValidate = false;
                            }
                            break;
                        default:
                            break;
                    }
                }

                // Check if right custom format:
                const pattern = rule.pattern;
                if (pattern) {
                    if (fieldValue && !pattern.test(fieldValue)) {
                        if (setState) { setState({ [fieldId]: message }); }
                        isValidate = false;
                    }
                }
            }
        }
    }

    return isValidate;
};

export const Input = ({
    fieldId,
    formValues,
    // formValues: formValuesProps,
    formErrors: formErrorsProps,
    rules,
    type,
    label,
    placeholder,
    content,
    elementInsideInput,
    onChangeText,
    getRules,
    onSubmit,
    enabledValidationOnTyping,
    styleContainerField = {},
    styleInputField = {},
}: IInput) => {
    // const [formValues, setFormValues] = useState<{ [fieldId: string]: string | any }>({});
    const [formErrors, setFormErrors] = useState<{ [fieldId: string]: string | any }>({});

    /*
    useEffect(() => {
        if (formValuesProps) {
            setFormValues(formValuesProps);
        }
    }, [formValuesProps]);
    */

    useEffect(() => {
        if (formErrorsProps) {
            setFormErrors(formErrorsProps);
        }
    }, [formErrorsProps]);

    useEffect(() => {
        if (getRules) {
            const object = { [fieldId]: rules?.filter((rule: any) => rule) };

            /* // when 'fieldId' is like 'field.subField':
            getNestedObjectByStringifyKeys()
            if (fieldId.includes('.')) {
                delete object[fieldId];
                _.set(object, fieldId, rules?.filter((rule: any) => rule)); // mute object here
            }
            */

            getRules(object);
        }
    }, []);

    let contentNode = null;
    if (content) {
        if (typeof content === 'function') {
            contentNode = content();
        } else if (typeof content === 'string') {
            contentNode = content;
        }
    }

    let elementInsideInputProps: any = {};
    if (elementInsideInput) {
        let keyPositionElement = 'InputLeftElement';

        switch (elementInsideInput?.placement) {
            case 'left':
                keyPositionElement = 'InputLeftElement';
                break;
            case 'right':
                keyPositionElement = 'InputRightElement';
                break;
            default:
                break;
        }

        switch (elementInsideInput?.type) {
            case 'icon':
                elementInsideInputProps = {
                    [keyPositionElement]: <Icon as={Ionicons} name={elementInsideInput.iconName} size={5} ml="2" mr="2" color="muted.400" />
                };
                break;
            case 'button':
                elementInsideInputProps = {
                    [keyPositionElement]: <Button size="xs" rounded="none" w="1/6" h="full" />
                };
                break;
            default:
                break;
        }
    }

    const onChange = (fieldIdParam: string, valueParam: any) => {
        if (onChangeText) { onChangeText(fieldIdParam, valueParam); }

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

    let inputStyles: any = {
        py: 1,
        px: 2,
        focusOutlineColor: '#616161',
        _focus: { bg: 'transparent' },
        _invalid: { borderColor: 'red.500', borderWidth: 1.5 }
    };

    switch (type) {
        case "inputSearch":
            inputStyles = {
                ...inputStyles,
                width: '100%',
                background: '#dcdcdc',
                variant: 'rounded',
                py: 1,
                px: 2
            };
        // eslint-disable-next-line no-fallthrough
        case "inputText":
            renderInput = (
                <InputBase
                    placeholder={placeholder}
                    onChangeText={(value) => onChange(fieldId, value)}
                    value={formValue}
                    {...elementInsideInputProps}
                    {...inputStyles}
                    style={styleInputField}
                />
            );
            break;
        case "inputTextArea":
            renderInput = (
                <TextArea
                    type="text"
                    onChangeText={(value: string) => onChange(fieldId, value)}
                    value={formValue}
                    {...inputStyles}
                    style={styleInputField}
                    {...{} as any} // Fix Native Base bug
                />
            );
            break;
        case "inputPassword":
            renderInput = (
                <InputBase
                    type="password"
                    placeholder={placeholder}
                    onChangeText={(value) => onChange(fieldId, value)}
                    {...elementInsideInputProps}
                    {...inputStyles}
                    style={styleInputField}
                />
            );
            break;
        case "buttonAsLink":
            renderInput = (
                <Button
                    variant="link"
                    _text={{
                        fontSize: "xs",
                        // color: "indigo.500"
                    }}
                    alignSelf="flex-end"
                    m="0"
                    p="0"
                    onPress={() => {
                        // navigation.replace('ForgetPassword');
                    }}
                    style={styleInputField}
                >
                    { contentNode }
                </Button>
            );
            break;
        case "text":
            renderInput = contentNode;
            break;
        case "submit":
            renderInput = (
                <Button
                    mt="2"
                    onPress={onSubmit}
                >
                    { contentNode }
                </Button>
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
        </FormControl>
    );
};

interface IFormProps {
    onSubmit: (formValues: any) => void;
    formErrors?: { [fieldId: string]: string | any }; // { email: '...' }
    children: any;
}

interface IFormState {
    formValues: { [fieldId: string]: string | any }; // { email: '...' }
    formErrors: { [fieldId: string]: string | any }; // { email: '...' }
    formRules: { [fieldId: string]: IFormRulesConfig[] }; // { email: [{ required: true, message: '...' }, { format: 'url', message: '...' }] }
}

export default class Form extends Component<IFormProps, IFormState> {
    static Input: any;

    constructor(props: IFormProps) {
        super(props);

        this.state = {
            formValues: {},
            formErrors: props.formErrors || {},
            formRules: {}
        };
    }

    componentDidUpdate(prevProps: Readonly<IFormProps>) {
        if (prevProps.formErrors !== this.props.formErrors) {
            this.setState((prevState) => {
                return {
                    formErrors: { ...prevState.formErrors, ...this.props.formErrors }
                };
            });
        }
    }

    render() {
        const {
            children,
            onSubmit: onSubmitProps
        } = this.props;

        const onSubmit = () => {
            const { formValues } = this.state;
            this.setState({ formErrors: {} });

            const isValidate = validateField(
                formValues,
                this.state.formRules,
                (nextError) => {
                    this.setState((prevState) => {
                        return { formErrors: { ...prevState.formErrors, ...nextError } };
                    });
                }
            );

            if (isValidate) {
                const nextFormData = { ...formValues };
                onSubmitProps(nextFormData);
            }
        };

        const onChangeText = (fieldId: string, value: any) => {
            const object = { [fieldId]: value };

            /* // for keys like 'field.subField':
            getNestedObjectByStringifyKeys()
            if (fieldId.includes('.')) {
                delete object[fieldId];
                _.set(object, fieldId, value); // mute object here
            }
            */

            this.setState((prevState) => {
                return { formValues: { ...prevState.formValues, ...object } };
            });
        };

        const getRules = (rules: any) => {
            this.setState((prevState) => {
                return { formRules: { ...prevState.formRules, ...rules } };
            });
        };

        const props = {
            formErrors: this.state?.formErrors,
            // formValues: this.state?.formValues, // For controlled input, but not used currently
            onChangeText,
            getRules,
            onSubmit
        };

        // https://stackoverflow.com/questions/32370994/how-to-pass-props-to-this-props-children
        const childrenWithProps = React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, props);
            }
            return child;
        });

        return (
            <VStack space={3} mt="5">
                { childrenWithProps }
            </VStack>
        );
    }
}

Form.Input = Input;
