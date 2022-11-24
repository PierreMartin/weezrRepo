// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { Component, useEffect } from 'react';
import { Icon, Input, VStack, FormControl, Button } from 'native-base';

type IFormRulesConfigFormat = null | 'email' | 'url';

interface IFormRulesConfig {
    required: boolean;
    message: string;
    format: IFormRulesConfigFormat;
}

interface IMenuItem {
    type: 'inputText' | 'inputPassword' | 'inputSelect' | 'button' | 'buttonAsLink' | 'text' | 'submit';
    name: string;
    rules?: IFormRulesConfig[];
    label?: string;
    placeholder?: string;
    elementInsideInput?: {
        type: 'icon' | 'button';
        placement: 'left' | 'right' | 'top' | 'bottom';
        iconName?: string;
    };
    content?: any;
    state?: any;
    onChangeText?: (key: string, value: any) => void;
    getRules?: (rules: any) => void;
    onSubmit?: (formData: any) => void;
}

const Item = ({
    name,
    rules,
    type,
    label,
    placeholder,
    content,
    elementInsideInput,
    state,
    onChangeText,
    getRules,
    onSubmit
}: IMenuItem) => {
    const formErrors = state?.formErrors as { [name: string]: string | any };

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

    let renderInput = null;
    switch (type) {
        case "inputText":
            renderInput = (
                <Input
                    placeholder={placeholder}
                    onChangeText={(value) => onChangeText && onChangeText(name, value)}
                    {...elementInsideInputProps}
                />
            );
            break;
        case "inputPassword":
            renderInput = (
                <Input
                    type="password"
                    onChangeText={(value) => onChangeText && onChangeText(name, value)}
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
}

interface IFormState {
    formData: { [name: string]: string | any }; // { email: '...' }
    formErrors: { [name: string]: string | any }; // { email: '...' }
    formRules: { [name: string]: IFormRulesConfig[] }; // { email: [{ required: true, message: '...' }, { format: 'url', message: '...' }] }
}

export default class Form extends Component<IFormProps, IFormState> {
    static Item: any;

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

        const validate = (formData: { [name: string]: string }) => {
            const regexForEmail = RegExp(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gi);
            const regexForUrl = RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
            const { formRules } = this.state;
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
                            this.setState((prevState) => {
                                return { formErrors: { ...prevState.formErrors, [name]: message } };
                            });

                            isValidate = false;
                        }

                        // Check if confirmPassword match with password:
                        const matchWith = rule.matchWith;
                        if (matchWith && formData[matchWith] !== fieldValue) {
                            this.setState((prevState) => {
                                return { formErrors: { ...prevState.formErrors, [name]: message } };
                            });

                            isValidate = false;
                        }

                        // Check if right format:
                        const format = rule.format as IFormRulesConfigFormat;
                        if (format) {
                            switch (format) {
                                case 'email':
                                    if (fieldValue && !regexForEmail.test(fieldValue?.toLowerCase())) {
                                        this.setState((prevState) => {
                                            return { formErrors: { ...prevState.formErrors, [name]: message } };
                                        });

                                        isValidate = false;
                                    }
                                    break;
                                case 'url':
                                    if (fieldValue && !regexForUrl.test(fieldValue)) {
                                        this.setState((prevState) => {
                                            return { formErrors: { ...prevState.formErrors, [name]: message } };
                                        });

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
                                this.setState((prevState) => {
                                    return { formErrors: { ...prevState.formErrors, [name]: message } };
                                });

                                isValidate = false;
                            }
                        }
                    }
                }
            }

            return isValidate;
        };

        const onSubmit = () => {
            const { formData } = this.state;
            this.setState({ formErrors: {} });

            if (validate(formData)) {
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
            state: this.state,
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

Form.Item = Item;
