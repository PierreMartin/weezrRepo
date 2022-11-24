import React from 'react';
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { Box, Heading, HStack, Spinner as SpinnerDefault } from 'native-base';
import { colors } from "../styles/base";

export interface ISpinner {
    navigation?: StackNavigationProp<any, any>;
    style?: any;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    label?: string;
}

let timeoutID: any = null;
const length = 800; // in ms

export function Spinner(props: ISpinner) {
    const [displaySpinner, setDisplaySpinner] = React.useState<boolean>(false);
    const { label, size } = props;

    React.useEffect(() => {
        timeoutID = setTimeout(() => {
            setDisplaySpinner(true);
            clearTimeout(timeoutID);
        }, length);

        return () => clearTimeout(timeoutID);
    }, []);

    if (!displaySpinner) {
        return null;
    }

    return (
        <HStack
            space={2}
            justifyContent="center"
            style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: colors.dark.backgroundOpacity
            }}
        >
            <Box style={{ alignItems: 'center', justifyContent: 'center' }}>
                <SpinnerDefault accessibilityLabel="Loading posts" color="#fff" size="lg" />
                <Heading color="primary.500" fontSize={size || 'md'}>
                    {label}
                </Heading>
            </Box>
        </HStack>
    );
}
