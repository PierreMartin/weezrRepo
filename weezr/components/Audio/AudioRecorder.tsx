// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { useTranslation } from "react-i18next";
import { PermissionsAndroid, Platform } from "react-native";
import AudioRecorderPlayer, {
    AudioEncoderAndroidType,
    AudioSourceAndroidType,
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    OutputFormatAndroidType
} from 'react-native-audio-recorder-player';
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
// import RNFetchBlob from "rn-fetch-blob";
import { Box, Button, Icon, Popover, Text } from "native-base";
import { hapticOptions } from "../../constants/Config";
import getStyles from "./AudioRecorder.styles";

const styles = getStyles();
// const dirs = RNFetchBlob.fs.dirs;

// For android it is mp4, and for ios it is a m4a
const audioRecorderPlayer = new AudioRecorderPlayer();

const path = Platform.select({
    ios: undefined,
    android: undefined,
    // Discussion: https://github.com/hyochan/react-native-audio-recorder-player/discussions/479
    // ios: 'https://firebasestorage.googleapis.com/v0/b/cooni-ebee8.appspot.com/o/test-audio.mp3?alt=media&token=d05a2150-2e52-4a2e-9c8c-d906450be20b',
    // ios: 'https://staging.media.ensembl.fr/original/uploads/26403543-c7d0-4d44-82c2-eb8364c614d0',
    // ios: 'hello.m4a',
    // android: `${dirs.CacheDir}/voiceMessages.mp4`,
});

export interface IAudioRecorder {
    onSubmit: (audio: string) => void;
}

export function AudioRecorder(props: IAudioRecorder) {
    const { onSubmit } = props;

    const [recordSecs, setRecordSecs] = React.useState<number>(0);
    const [recordTime, setRecordTime] = React.useState<string>('00:00');
    const [isRecording, setIsRecording] = React.useState<boolean>(false);
    const [isPopoverInfoOpened, setIsPopoverInfoOpened] = React.useState<boolean>(false);

    const { t } = useTranslation();

    const onStartRecord = async (): Promise<void> => {
        setIsRecording(true);
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);

        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                ]);

                console.log('onStartRecord - write external stroage', grants);

                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                    && grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                    && grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('onStartRecord - permissions granted');
                } else {
                    console.log('onStartRecord - All required permissions not granted');
                    return;
                }
            } catch (err) {
                console.warn(err);
                return;
            }
        }

        const audioSet = {
            AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
            AudioSourceAndroid: AudioSourceAndroidType.MIC,
            AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
            AVNumberOfChannelsKeyIOS: 2,
            AVFormatIDKeyIOS: AVEncodingOption.aac,
            OutputFormatAndroid: OutputFormatAndroidType.MPEG_4, // NOTE: Fix for read mp4 on ios (see https://github.com/hyochan/react-native-audio-recorder-player/issues/295)
        };

        console.log('onStartRecord - audioSet', audioSet);

        const uri = await audioRecorderPlayer.startRecorder(path, audioSet);

        audioRecorderPlayer.addRecordBackListener((e) => {
            // console.log('record-back', e);
            setRecordSecs(e.currentPosition);
            setRecordTime(audioRecorderPlayer.mmss(Math.floor(e.currentPosition / 1000)));
        });

        console.log(`onStartRecord - uri: ${uri}`);
    };

    const onStopRecord = async (): Promise<void> => {
        if (!isRecording) {
            setIsPopoverInfoOpened(true);
            ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
            return;
        }

        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setRecordSecs(0);

        onSubmit(result);
        setIsRecording(false);
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
        console.log('onStopRecord ', result);
    };

    return (
        <Box flex={1}>
            {
                (isRecording) && (
                    <Box style={styles.recordingPopover}>
                        <Icon as={Ionicons} name="mic-outline" size="7" color="#fff" />
                        <Text color="#fff">{recordTime}</Text>
                    </Box>
                )
            }

            <Popover
                isOpen={isPopoverInfoOpened}
                onClose={() => setIsPopoverInfoOpened(false)}
                trigger={(triggerProps) => {
                    return (
                        <Button
                            {...triggerProps}
                            leftIcon={<Icon as={Ionicons} name="mic-outline" size="7" />}
                            rounded="none"
                            variant="unstyle"
                            pl="0"
                            pr="0"
                            delayLongPress={800}
                            onLongPress={onStartRecord}
                            onPressOut={onStopRecord}
                        />
                    );
                }}
            >
                <Popover.Content accessibilityLabel="Info" flex={1}>
                    <Popover.Arrow />
                    <Popover.CloseButton top={1} />

                    <Popover.Body p={2} pr={12}>
                        {t('audioRecorder.info')}
                    </Popover.Body>
                </Popover.Content>
            </Popover>
        </Box>
    );
}
