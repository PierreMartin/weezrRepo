import * as React from 'react';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, StyleSheet } from 'react-native';
import { Text, Box, Center, Heading } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { gql, useLazyQuery } from "@apollo/client";
import { useFocusEffect } from "@react-navigation/native";
import { logoutAction } from "../reduxActions/authentication";
import { View } from '../components';
import { IUser } from "../entities";
import { States } from "../reduxReducers/states";

const USERS = gql`
    query {
        users {
            __typename
        }
    }
`;

interface ITabProfilScreenProps {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
    authenticatedState: States.IAuthenticatedState;
    logoutActionProps: () => Promise<any>;
}

function TabProfilScreen({ navigation, me, authenticatedState, logoutActionProps }: ITabProfilScreenProps) {
    const [count, setCount] = React.useState(0);
    // @ts-ignore
    const [{ client }] = useLazyQuery(USERS);
    // const isFocused = useIsFocused();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button
                    onPress={() => {
                        setCount((prevCount) => prevCount + 1);
                    }}
                    title="Update count"
                />
            )
        });
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            // Do something when the screen is focused

            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions
                setCount(0);
            };
        }, [])
    );

    const onLogout = () => {
        logoutActionProps().then((res) => {
            if ((res?.payload?.authenticatedState as States.IAuthenticatedState) === 'disconnected') {
                navigation.navigate('Start');
                if (client) { client.clearStore(); } // https://www.apollographql.com/docs/react/networking/authentication/#reset-store-on-logout
            }
        });
    };

    return (
        <Box safeArea>
            <Center>
                <Heading>
                    A component library for the<Text color="emerald.500"> React Ecosystem</Text>
                </Heading>
                <Text mt="3" fontWeight="medium">
                    NativeBase is a simple, modular and accessible component library that
                    gives you building blocks to build you React applications.
                </Text>

                <View style={styles.separator} />

                { (authenticatedState === 'connected') && (
                    <View>
                        <Text>Welcome {`${me?.email}`}</Text>
                        <Button onPress={onLogout} title="Logout" />
                    </View>
                ) }

                <Text>Count: {count}</Text>

                <Button
                    onPress={() => navigation.navigate('Details')}
                    title="Go to Details page"
                />

                <Button
                    onPress={() => navigation.navigate('PhotoDetailModal')}
                    title="Open Modal"
                />
            </Center>
        </Box>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
        backgroundColor: "#7b7b7b"
    }
});

function mapStateToProps(state: States.IAppState) {
    return {
        authenticatedState: state.authenticatedState,
        me: state.user.me
    };
}

function mapDispatchToProps(dispatch: any) {
    return {
        logoutActionProps: bindActionCreators(logoutAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TabProfilScreen as any);
