// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import React from 'react';
import { Dimensions, TouchableOpacity } from "react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import { Box, Button, Icon, Text } from "native-base";
import getStyles from "./AudioPlayer.styles";

const styles = getStyles();
const audioRecorderPlayer = new AudioRecorderPlayer();

export interface IAudioPlayer {
    audioSource: string;
}

const screenWidth = Dimensions.get('screen').width;

export function AudioPlayer(props: IAudioPlayer) {
    const { audioSource } = props;

    const [playerState, setPlayerState] = React.useState<string>('none');
    const [iconPlay, setIconPlay] = React.useState<string>('play-outline');

    const [currentPositionSec, setCurrentPositionSec] = React.useState<number>(0);
    const [currentDurationSec, setCurrentDurationSec] = React.useState<number>(0);

    const [playTime, setPlayTime] = React.useState<string>('00:00:00');
    const [duration, setDuration] = React.useState<string>('00:00:00');

    let playWidth = (currentPositionSec / currentDurationSec) * (screenWidth - 56);
    if (!playWidth) { playWidth = 0; }

    const onStartPlay = async (): Promise<void> => {
        const msg = await audioRecorderPlayer.startPlayer(audioSource);
        const volume = await audioRecorderPlayer.setVolume(1.0);
        console.log(`file: ${msg}`, `volume: ${volume}`);

        audioRecorderPlayer.addPlayBackListener((e) => {
            if (e.currentPosition === e.duration) {
                console.log('finished');
                audioRecorderPlayer.stopPlayer();
            }

            setCurrentPositionSec(e.currentPosition);
            setCurrentDurationSec(e.duration);

            setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
            setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
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
        const touchX = e.nativeEvent.locationX;
        console.log(`touchX: ${touchX}`);

        const _playWidth = (currentPositionSec / currentDurationSec) * (screenWidth - 56);
        console.log(`currentPlayWidth: ${_playWidth}`);

        const currentPosition = Math.round(currentPositionSec);

        if (_playWidth && _playWidth < touchX) {
            const addSecs = Math.round(currentPosition + 1000);
            audioRecorderPlayer.seekToPlayer(addSecs);
            console.log(`addSecs: ${addSecs}`);
        } else {
            const subSecs = Math.round(currentPosition - 1000);
            audioRecorderPlayer.seekToPlayer(subSecs);
            console.log(`subSecs: ${subSecs}`);
        }
    };

    if (!audioSource) { return null; }

    return (
        <Box style={styles.playerContainer}>
            <Box style={styles.playBtn}>
                <Button
                    rounded="none"
                    variant="unstyle"
                    p="0"
                    m="0"
                    leftIcon={<Icon as={Ionicons} name={iconPlay} size={6} color="#fff" />}
                    onPress={onTap}
                />
            </Box>

            <Box style={styles.viewBarWrapper}>
                <TouchableOpacity onPress={onStatusPress}>
                    <Box style={styles.viewBar}>
                        <Box style={[styles.viewBarPlay, { width: playWidth }]} />
                    </Box>
                </TouchableOpacity>

                <Box style={styles.txtCounterWrapper}>
                    <Text style={styles.txtCounter}>{playTime}</Text>
                    <Text style={styles.txtCounter}>{duration}</Text>
                </Box>
            </Box>
        </Box>
    );
}
