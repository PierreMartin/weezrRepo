// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { Component, useEffect, useState } from 'react';
import { Icon, Input as InputBase, VStack, FormControl, Button } from 'native-base';

type IFormRulesConfigFormat = null | 'email' | 'url';

interface IFormRulesConfig {
    required?: boolean;
    message: string;
    format?: IFormRulesConfigFormat;
}

interface IInput {
    type: 'inputText' | 'inputPassword' | 'inputSelect' | 'button' | 'buttonAsLink' | 'text' | 'submit';
    name: string; // TODO key
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

    onChangeText?: (key: string, value: any) => void;
    onSubmit?: (formData: any) => void;

    formData?: { [name: string]: string | any };
    formErrors?: { [name: string]: string | any };
}

export const validateField = (
    formData: { [name: string]: string },
    formRules: { [name: string]: IFormRulesConfig[] },
    setState?: (formErrors: any) => void
) => {
    const regexForEmail = RegExp(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gi);
    const regexForUrl = RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
    let isValidate = true;

    for (const name in formRules) {
        if (formRules.hasOwnProperty(name)) {
            const fieldRule: any = formRules[name];
            const fieldValue = formData[name];

            for (let i = 0; i < fieldRule?.length; i++) {
                const rule = fieldRule[i];
                const message = rule.message || 'An error has occurred';

                // Check if required:
                const required = rule.required;
                if (required && !fieldValue) {
                    if (setState) { setState({ [name]: message }); }
                    isValidate = false;
                }

                // Check if confirmPassword match with password:
                const matchWith = rule.matchWith;
                if (matchWith && formData[matchWith] !== fieldValue) {
                    if (setState) { setState({ [name]: message }); }
                    isValidate = false;
                }

                // Check if right format:
                const format = rule.format as IFormRulesConfigFormat;
                if (format) {
                    switch (format) {
                        case 'email':
                            if (fieldValue && !regexForEmail.test(fieldValue?.toLowerCase())) {
                                if (setState) { setState({ [name]: message }); }
                                isValidate = false;
                            }
                            break;
                        case 'url':
                            if (fieldValue && !regexForUrl.test(fieldValue)) {
                                if (setState) { setState({ [name]: message }); }
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
                        if (setState) { setState({ [name]: message }); }
                        isValidate = false;
                    }
                }
            }
        }
    }

    return isValidate;
};

export const Input = ({
    name,
    // formData: formDataProps,
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
    enabledValidationOnTyping
}: IInput) => {
    // const [formData, setFormData] = useState<{ [name: string]: string | any }>({});
    const [formErrors, setFormErrors] = useState<{ [name: string]: string | any }>({});

    /*
    useEffect(() => {
        if (formDataProps) {
            setFormData(formDataProps);
        }
    }, [formDataProps]);
    */

    useEffect(() => {
        if (formErrorsProps) {
            setFormErrors(formErrorsProps);
        }
    }, [formErrorsProps]);

    useEffect(() => {
        if (getRules) {
            const object = { [name]: rules?.filter((rule: any) => rule) };

            /* // when 'name' is like 'field.subField':
            getNestedObjectByStringifyKeys()
            if (name.includes('.')) {
                delete object[name];
                _.set(object, name, rules?.filter((rule: any) => rule)); // mute object here
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

    const onChange = (nameParam: string, valueParam: any) => {
        if (onChangeText) { onChangeText(nameParam, valueParam); }

        if (enabledValidationOnTyping) {
            setFormErrors({});

            validateField(
                { [name]: valueParam },
                { [name]: rules?.filter((rule: any) => rule) },
                setFormErrors
            );
        }
    };

    let renderInput = null;
    switch (type) {
        case "inputText":
            renderInput = (
                <InputBase
                    placeholder={placeholder}
                    onChangeText={(value) => onChange(name, value)}
                    // value={formData[name]}
                    {...elementInsideInputProps}
                />
            );
            break;
        case "inputPassword":
            renderInput = (
                <InputBase
                    type="password"
                    onChangeText={(value) => onChange(name, value)}
                    {...elementInsideInputProps}
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
        <FormControl isRequired={isRequired} isInvalid={formErrors ? !!formErrors[name] : false}>
            { label && <FormControl.Label>{label}</FormControl.Label> }
            { renderInput }

            { formErrors && formErrors[name] ? (
                <FormControl.ErrorMessage
                    _text={{fontSize: "xs"}}
                    leftIcon={<Icon as={Ionicons} name="alert-circle-outline" size="xs" />}
                >
                    { formErrors[name] }
                </FormControl.ErrorMessage>
            ) : (
                <FormControl.HelperText>
                    { ruleToDisplay?.message }
                </FormControl.HelperText>
            )}
        </FormControl>
    );
};

interface IFormProps {
    onSubmit: (formData: any) => void;
    formErrors?: { [name: string]: string | any }; // { email: '...' }
    children: any;
}

interface IFormState {
    formData: { [name: string]: string | any }; // { email: '...' }
    formErrors: { [name: string]: string | any }; // { email: '...' }
    formRules: { [name: string]: IFormRulesConfig[] }; // { email: [{ required: true, message: '...' }, { format: 'url', message: '...' }] }
}

export default class Form extends Component<IFormProps, IFormState> {
    static Input: any;

    constructor(props: IFormProps) {
        super(props);

        this.state = {
            formData: {},
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
            const { formData } = this.state;
            this.setState({ formErrors: {} });

            const isValidate = validateField(
                formData,
                this.state.formRules,
                (nextError) => {
                    this.setState((prevState) => {
                        return { formErrors: { ...prevState.formErrors, ...nextError } };
                    });
                }
            );

            if (isValidate) {
                const nextFormData = { ...formData };
                onSubmitProps(nextFormData);
            }
        };

        const onChangeText = (key: string, value: any) => {
            const object = { [key]: value };

            /* // for keys like 'field.subField':
            getNestedObjectByStringifyKeys()
            if (key.includes('.')) {
                delete object[key];
                _.set(object, key, value); // mute object here
            }
            */

            this.setState((prevState) => {
                return { formData: { ...prevState.formData, ...object } };
            });
        };

        const getRules = (rules: any) => {
            this.setState((prevState) => {
                return { formRules: { ...prevState.formRules, ...rules } };
            });
        };

        const props = {
            formErrors: this.state?.formErrors,
            // formData: this.state?.formData, // For controlled input, but not used currently
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
