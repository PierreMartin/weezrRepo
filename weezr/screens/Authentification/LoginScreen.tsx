import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { StackScreenProps } from "@react-navigation/stack";
import {
    Button,
    Box,
    Center,
    Heading,
    Text,
    HStack
} from 'native-base';
import { loginAction, signupAction } from '../../reduxActions/authentication';
import Form from "../../components/Forms/Form";
import { States } from "../../reduxReducers/states";
// import getStyles from "./LoginScreen.styles";

// const styles = getStyles();

interface ILoginScreenProps extends StackScreenProps<any, 'Login'> {
    navigation: StackNavigationProp<any, any>;
    loginActionProps: (fields: any) => Promise<any>;
    signupActionProps: (fields: any) => Promise<any>;
}

const LoginScreen = ({ navigation, loginActionProps, signupActionProps, route }: ILoginScreenProps) => {
    const [fieldsErrorsTyping, setFieldsErrorsTyping] = useState({} as { [name: string]: string }); // { email: '...' }
    const { page } = route.params as { page: 'login' | 'signup' };
    const isLogin = page === 'login';

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: isLogin ? 'Login' : 'Signup'
        });
    }, [navigation]);

    const onSubmitSignup = (formData: any) => {
        const nextFormData = {...formData};
        nextFormData.email = formData.email?.toLowerCase();
        nextFormData.roles = ['MEMBER'];
        nextFormData.birthAt = new Date('09/18/1990');
        if (!nextFormData.account) { nextFormData.account = {}; }
        nextFormData.account.lastLoginAt = new Date();
        nextFormData.account.createdAt = new Date();

        signupActionProps(nextFormData).then((res) => {
            if ((res?.payload?.authenticatedState as States.IAuthenticatedState) === 'connected') {
                navigation.navigate('Onboarding');
            } else if (Object.keys(res?.payload?.fieldsErrors || {})?.length) {
                setFieldsErrorsTyping(res.payload.fieldsErrors);
            }
        });
    };

    const onSubmitLogin = (formData: any) => {
        const nextFormData = {...formData};
        nextFormData.email = formData.email?.toLowerCase();
        if (!nextFormData.account) { nextFormData.account = {}; }
        nextFormData.account.lastLoginAt = new Date();

        loginActionProps(nextFormData).then((res) => {
            if ((res?.payload?.authenticatedState as States.IAuthenticatedState) === 'connected') {
                navigation.navigate('Main');
            } else if (Object.keys(res?.payload?.fieldsErrors || {})?.length) {
                setFieldsErrorsTyping(res.payload.fieldsErrors);
            }
        });
    };

    return (
        <Center w="100%">
            <Box safeArea p="2" py="8" w="90%">
                <Heading size="lg" fontWeight="600" color="coolGray.800">
                    Welcome
                </Heading>

                <Heading mt="1" color="coolGray.600" fontWeight="medium" size="xs">
                    Sign in to continue!
                </Heading>

                <Form
                    onSubmit={isLogin ? onSubmitLogin : onSubmitSignup}
                    formErrors={fieldsErrorsTyping}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        type="inputText"
                        placeholder="example@example.com"
                        elementInsideInput={{
                            type: 'icon',
                            placement: 'left',
                            iconName: 'mail-outline'
                        }}
                        rules={[
                            {
                                format: 'email',
                                message: 'The input is not valid E-mail!',
                            },
                            {
                                required: true,
                                message: 'Please input your E-mail!',
                            }
                        ]}
                    />

                    <Form.Item
                        name="password"
                        label="Password"
                        type="inputPassword"
                        elementInsideInput={{
                            type: 'icon',
                            placement: 'left',
                            iconName: 'lock-closed-outline'
                        }}
                        rules={[
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                            !isLogin && {
                                pattern: new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/),
                                message: 'Password must be minimum 6 characters and contain at least one lowercase letter, uppercase letter number and no special characters',
                                displayMessageAsInfo: true
                            }
                        ]}
                    />

                    {
                        isLogin && (
                            <Form.Item
                                name="forgetPassword"
                                content="Forget Password?"
                                type="buttonAsLink"
                            />
                        )
                    }

                    {
                        !isLogin && (
                            <Form.Item
                                name="confirmPassword"
                                label="Confirm your password"
                                type="inputPassword"
                                elementInsideInput={{
                                    type: 'icon',
                                    placement: 'left',
                                    iconName: 'lock-closed-outline'
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your confirm password!'
                                    },
                                    {
                                        matchWith: 'password',
                                        message: 'The password don\'t match with the confirm password!'
                                    }
                                ]}
                            />
                        )
                    }

                    <Form.Item
                        name="forgetPassword"
                        type="submit"
                        content={isLogin ? 'Login' : 'Signup'}
                    />

                    <Form.Item
                        name="forgetPassword"
                        type="text"
                        content={() => {
                            return (
                                <HStack justifyContent="center" alignItems="center">
                                    <Text
                                        fontSize="sm"
                                        color="coolGray.600"
                                        _dark={{ color: "warmGray.200" }}
                                    >
                                        { isLogin ? 'Don\'t have an account ? ' : 'Already have an account ? ' }
                                    </Text>
                                    <Button
                                        variant="link"
                                        _text={{
                                            // color: "indigo.500"
                                        }}
                                        m="0"
                                        p="0"
                                        onPress={() => {
                                            navigation.replace('Login', { page: isLogin ? 'signup' : 'login' });
                                        }}
                                    >
                                        { isLogin ? 'Signup' : 'Login' }
                                    </Button>
                                </HStack>
                            );
                        }}
                    />
                </Form>
            </Box>
        </Center>
    );
};

function mapDispatchToProps(dispatch: any) {
    return {
        loginActionProps: bindActionCreators(loginAction, dispatch),
        signupActionProps: bindActionCreators(signupAction, dispatch),
    };
}

export default connect(null, mapDispatchToProps)(LoginScreen as any);
