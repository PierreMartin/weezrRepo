// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { Box, Button, Heading, Text, Icon, Center } from 'native-base';
import getStyles from "./StartScreen.styles";

const styles = getStyles();

export default function StartScreen({ navigation }: StackScreenProps<any, 'Start'>) {
    const propsStyle = {
        w: 200,
        mb: 2
    };

    return (
        <Box safeArea style={styles.main}>
            <Center>
                {/* <Logo /> */}
                <Heading>Login</Heading>
                <Text bold p={2}>Welcome</Text>

                <Button
                    {...propsStyle}
                    leftIcon={<Icon as={Ionicons} name="log-in-outline" size="sm" />}
                    onPress={() => navigation.navigate('Login', { page: 'login' })}
                    style={styles.button}
                >
                    Login
                </Button>

                <Button
                    {...propsStyle}
                    variant="outline"
                    leftIcon={<Icon as={Ionicons} name="arrow-forward-outline" size="sm" />}
                    onPress={() => navigation.navigate('Login', { page: 'signup' })}
                    style={styles.button}
                >
                    Sign Up
                </Button>
            </Center>
        </Box>
    );
}
