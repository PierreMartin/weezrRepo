// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { Button, Icon } from "native-base";
import getStyles from "./Audio.styles";

const styles = getStyles();

export interface IAudioRecorder {
    onSubmit: (audio: string) => void;
}

export function AudioRecorder(props: IAudioRecorder) {
    const { onSubmit } = props;

    const onRecordNewAudio = () => {
        console.log('tttt');
        // const audio = new Recorder(‘filename.mp4’).record();
        // onSubmit(audio);
    };

    return (
        <Button
            leftIcon={<Icon size="7" as={<Ionicons name="mic-outline" />} />}
            rounded="none"
            variant="unstyle"
            pl="0"
            pr="0"
            _text={{ fontSize: 16 }}
            onLongPress={onRecordNewAudio}
        />
    );
}
