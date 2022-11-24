import React from 'react';
import { Box } from 'native-base';
import { ActivityIndicator } from "react-native";
import { colors } from "../styles/base";

interface ISpinnerIndicator {
    style?: any;
}

export function SpinnerIndicator(props: ISpinnerIndicator) {
    const { style } = props || {};

    return (
        <Box style={{ alignItems: 'center' }}>
            <ActivityIndicator
                size="large"
                animating={true}
                color="#fff"
                style={{
                    borderRadius: 12,
                    backgroundColor: colors.dark.backgroundOpacity,
                    ...style
                }}
            />
        </Box>
    );
}
