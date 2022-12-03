// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { View } from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { Box, Button, Icon, Spinner, Text } from "native-base";
import getStyles from "./AudioPlayer.styles";

const styles = getStyles();
const audioRecorderPlayer = new AudioRecorderPlayer();

export interface IAudioPlayer {
    audioSource: string;
    onDeleteAudioSource?: () => void;
}

export function AudioPlayer(props: IAudioPlayer) {
    const { audioSource, onDeleteAudioSource } = props;

    const [playerState, setPlayerState] = React.useState<'none' | 'play' | 'pause' | 'resume'>('none');
    const [iconPlay, setIconPlay] = React.useState<string>('play-outline');

    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const [currentPositionSec, setCurrentPositionSec] = React.useState<number>(0); // ms
    const [currentDurationSec, setCurrentDurationSec] = React.useState<number>(0); // ms

    const [playTime, setPlayTime] = React.useState<string>('00:00');
    const [duration, setDuration] = React.useState<string>('00:00');

    const [viewBarWidth, setViewBarWidth] = React.useState<number>(0); // px

    let playWidth = (currentPositionSec / currentDurationSec) * (viewBarWidth); // px
    if (!playWidth) { playWidth = 0; }

    const onStartPlay = async (): Promise<void> => {
        setIsLoading(true);

        const msg = await audioRecorderPlayer.startPlayer(audioSource);
        const volume = await audioRecorderPlayer.setVolume(1.0);
        console.log(`file: ${msg}`, `volume: ${volume}`);

        audioRecorderPlayer.addPlayBackListener((e) => {
            setIsLoading(false);
            console.log('Playing...');

            if (e.currentPosition === e.duration) {
                console.log('Finished');
                onStopPlay();
                // audioRecorderPlayer.seekToPlayer(0);
                setPlayerState('none');
                setIconPlay('refresh-outline');
            }

            setCurrentPositionSec(e.currentPosition);
            setCurrentDurationSec(e.duration);

            setPlayTime(audioRecorderPlayer.mmss(Math.floor(e.currentPosition / 1000)));
            setDuration(audioRecorderPlayer.mmss(Math.floor(e.duration / 1000)));
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

        let positionToMoveInMs = (locationX * currentDurationSec) / viewBarWidth;
        positionToMoveInMs = Math.round(positionToMoveInMs);

        console.log(`positionToMoveInMs: ${positionToMoveInMs}`);
        audioRecorderPlayer.seekToPlayer(positionToMoveInMs);
    };

    if (!audioSource) { return null; }

    return (
        <Box style={styles.playerContainer}>
            <Box style={styles.playBtn}>
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
                            leftIcon={<Icon as={Ionicons} name={iconPlay} size={6} color="#fff" />}
                            onPress={onTap}
                        />
                    ) : (
                        <Spinner
                            size="sm"
                            color="#fff"
                        />
                    )
                }
            </Box>

            <Box style={styles.viewBarWrapper}>
                <View
                    onLayout={(event) => setViewBarWidth(event?.nativeEvent?.layout?.width || 0)}
                    style={styles.viewBar}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderMove={onStatusPress}
                    onTouchStart={onStatusPress}
                >
                    <Box style={[styles.viewBarPlay, { width: playWidth }]} />
                </View>

                <Box style={styles.txtCounterWrapper}>
                    <Text style={styles.txtCounter}>{playTime}</Text>
                    <Text style={styles.txtCounter}>{duration}</Text>
                </Box>
            </Box>
        </Box>
    );
}
