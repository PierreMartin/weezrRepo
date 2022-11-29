import React from 'react';
import { Box, Text } from "native-base";
import getStyles from "./Audio.styles";

const styles = getStyles();

export interface IAudioPlayer {
    audioSource: string;
}

export function AudioPlayer(props: IAudioPlayer) {
    const { audioSource } = props;

    if (!audioSource) { return null; }

    return (
        <Box>
            <Text>....</Text>
        </Box>
    );
}
