// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { View } from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { Box, Button, Icon, Spinner, Text } from "native-base";
import getStyles from "./AudioPlayer.styles";
import colors from "../../styles/colors";

const styles = getStyles();
const audioRecorderPlayer = new AudioRecorderPlayer();

export interface IAudioPlayer {
    audioSource: string;
    onDeleteAudioSource?: () => void;
    hasReceived?: boolean;
}

export function AudioPlayer(props: IAudioPlayer) {
    const { audioSource, onDeleteAudioSource, hasReceived } = props;

    const [playerState, setPlayerState] = React.useState<'none' | 'play' | 'pause' | 'resume'>('none');
    const [iconPlay, setIconPlay] = React.useState<string>('play-outline');

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const [currentPositionSec, setCurrentPositionSec] = React.useState<number>(0); // ms
    const [currentDurationSec, setCurrentDurationSec] = React.useState<number>(0); // ms

    const [playTime, setPlayTime] = React.useState<string>('00:00');
    const [duration, setDuration] = React.useState<string>('00:00');

    const [playContainerWidth, setPlayContainerWidth] = React.useState<number>(0); // px
    const [playWidth, setPlayWidth] = React.useState<number>(0); // px

    /*
    let playWidth = (currentPositionSec / currentDurationSec) * (playContainerWidth); // px
    if (!playWidth) { playWidth = 0; }
    */

    const onStartPlay = async (): Promise<void> => {
        await onStopPlay();
        let isOnLoading = true;
        setIsLoading(true);

        const msg = await audioRecorderPlayer.startPlayer(audioSource);
        const volume = await audioRecorderPlayer.setVolume(1.0);
        console.log(`file: ${msg}`, `volume: ${volume}`);

        // If error or file doesn't exist on cloud:
        setTimeout(() => {
            if (isOnLoading) {
                onStopPlay();

                setIsLoading(false);
                isOnLoading = false;
                setPlayerState('none');
                setIconPlay('alert-circle-outline');
                setPlayWidth(0);
            }
        }, 12 * 1000);

        audioRecorderPlayer.addPlayBackListener((e) => {
            console.log('Playing...');

            setIsLoading(false);
            isOnLoading = false;

            if (e.currentPosition === e.duration) {
                console.log('Finished');
                onStopPlay();
                // audioRecorderPlayer.seekToPlayer(0);

                setPlayerState('none');
                setIconPlay('refresh-outline');
                setPlayWidth(0);

                return;
            }

            setCurrentPositionSec(e.currentPosition);
            setCurrentDurationSec(e.duration);

            let nextPlayWidth = (e.currentPosition / e.duration) * (playContainerWidth); // px
            if (!nextPlayWidth) { nextPlayWidth = 0; }

            setPlayWidth(nextPlayWidth); // px
            setPlayTime(audioRecorderPlayer.mmss(Math.floor(e.currentPosition / 1000))); // ms
            setDuration(audioRecorderPlayer.mmss(Math.floor(e.duration / 1000))); // ms
        });
    };

    const onPausePlay = async (): Promise<void> => {
        await audioRecorderPlayer.pausePlayer();
    };

    const onResumePlay = async (): Promise<void> => {
        await audioRecorderPlayer.resumePlayer();
    };

    const onStopPlay = async (): Promise<void> => {
        await audioRecorderPlayer.stopPlayer();
        await audioRecorderPlayer.removePlayBackListener();
    };

    React.useEffect(() => {
        return () => {
            onStopPlay();
        };
    }, []);

    const onTap = async (): Promise<void> => {
        switch (playerState) {
            case 'none':
                setPlayerState('play');
                setIconPlay('pause-outline');
                await onStartPlay();
                break;
            case 'play':
            case 'resume':
                setPlayerState('pause');
                setIconPlay('play-outline');
                await onPausePlay();
                break;
            case 'pause':
                setPlayerState('resume');
                setIconPlay('pause-outline');
                await onResumePlay();
                break;
            default:
                break;
        }
    };

    const onStatusPress = (e: any): void => {
        if (playerState === 'none') { return; } // if not playing, do nothing

        const locationX = parseInt(e?.nativeEvent?.locationX || 0, 10);

        let positionToMoveInMs = (locationX * currentDurationSec) / playContainerWidth;
        positionToMoveInMs = Math.round(positionToMoveInMs);

        console.log(`positionToMoveInMs: ${positionToMoveInMs}`);
        audioRecorderPlayer.seekToPlayer(positionToMoveInMs);
    };

    if (!audioSource) { return null; }

    let stylesColor: any = {
        color: '#fff',
        viewBar: {
            backgroundColor: colors.dark.border
        }
    };

    if (hasReceived) {
        stylesColor = {
            color: '#000',
            viewBar: {
                backgroundColor: '#eaeaea'
            }
        };
    }

    return (
        <Box style={styles.playerContainer}>
            <Box style={styles.playBtn} mt={-5}>
                {
                    onDeleteAudioSource && (
                        <Button
                            rounded="none"
                            variant="unstyle"
                            p="0"
                            m="0"
                            ml={2}
                            mr={2}
                            leftIcon={<Icon as={Ionicons} name="trash-outline" size={6} color="#fff" />}
                            onPress={async () => {
                                await onStopPlay();
                                onDeleteAudioSource();
                            }}
                        />
                    )
                }

                {
                    !isLoading ? (
                        <Button
                            rounded="none"
                            variant="unstyle"
                            p="0"
                            m="0"
                            mr={1}
                            leftIcon={<Icon as={Ionicons} name={iconPlay} size={6} color={stylesColor.color} />}
                            onPress={onTap}
                        />
                    ) : (
                        <Spinner
                            size="sm"
                            color={stylesColor.color}
                        />
                    )
                }
            </Box>

            <Box style={styles.viewBarWrapper}>
                <View
                    style={[styles.viewBar, stylesColor.viewBar]}
                    onLayout={(event) => setPlayContainerWidth(event?.nativeEvent?.layout?.width || 0)}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderMove={onStatusPress}
                    onTouchStart={onStatusPress}
                >
                    <Box style={[styles.viewBarPlay, { width: playWidth }]} />
                </View>

                <Box style={styles.txtCounterWrapper}>
                    <Text style={[styles.txtCounter, { color: stylesColor.color }]}>{playTime}</Text>
                    <Text style={[styles.txtCounter, { color: stylesColor.color }]}>{duration}</Text>
                </Box>
            </Box>
        </Box>
    );
}
