import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Box } from "native-base";
import getStyles from "./NotFoundScreen.styles";

const styles = getStyles();

export default function NotFoundScreen({ navigation }: StackScreenProps<any, 'NotFound'>) {
    return (
        <Box safeArea style={styles.main}>
            <Text style={styles.title}>This screen doesn't exist.</Text>
            <TouchableOpacity
                onPress={() => {
                    // navigation.navigate('Main');
                    // navigation.replace('Main');
                    // navigation.push('Main');
                    // navigation.goBack(); // goes back to the last screen
                    // navigation.popToTop(); // goes back to the first screen in the stack

                    // navigation.setOptions({ title: 'Updated!' });
                    navigation.navigate('Main');
                }}
                style={styles.link}
            >
                <Text style={styles.linkText}>Go to home screen!</Text>
            </TouchableOpacity>
        </Box>
    );
}
