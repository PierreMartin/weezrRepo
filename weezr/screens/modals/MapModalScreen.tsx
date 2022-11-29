// @ts-ignore
import Ionicons from "react-native-vector-icons/Ionicons";
import * as React from 'react';
import { StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Box, Center, Button, Icon } from "native-base";
import { connect } from "react-redux";
import { StackScreenProps } from '@react-navigation/stack';
import { StackNavigationProp } from "@react-navigation/stack/src/types";
import _ from "lodash";
import { Spinner } from "../../components/Spinner";
import { ILocation, IUser } from "../../entities";
import { States } from "../../reduxReducers/states";
import getStyles from "./MapModalScreen.styles";

const styles = getStyles();

interface IMapModalScreen extends StackScreenProps<any, 'MapModal'> {
    navigation: StackNavigationProp<any, any>;
    me?: IUser;
}

interface IParam {
    location: ILocation;
    onSendLocation?: (location: ILocation) => void;
    isEditing?: boolean;
}

function MapModalScreenComponent({
    navigation,
    route
}: IMapModalScreen) {
    const {
        location,
        isEditing,
        onSendLocation
    } = route.params as IParam;

    const initialRegion = {
        latitude: location?.latitude || 1,
        longitude: location?.longitude || 1,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
    };

    const [region, setRegion] = React.useState<any>(initialRegion);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Map',
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                >
                    Close
                </Button>
            )
        });
    }, [navigation]);

    const onRegionChange = _.debounce((regionParam: any) => {
        setRegion(regionParam);
    }, 50);

    if (!initialRegion?.latitude || !initialRegion?.longitude) {
        return <Center style={styles.container}><Text>Error at loading map...</Text></Center>;
    }

    return (
        <Box style={styles.main}>
            <Center style={{ position: 'relative', width: '100%', height: '100%' }}>
                { isLoading && <Spinner /> }

                <MapView
                    style={{...StyleSheet.absoluteFillObject}}
                    region={region}
                    onRegionChangeComplete={(regionParam) => onRegionChange(regionParam)}
                    userInterfaceStyle="dark"
                    onMapReady={() => setIsLoading(false)}
                >

                    {/* Initial region: */}
                    <Marker coordinate={initialRegion}>
                        <Icon size="10" as={<Ionicons name="location" />} color="#fff" />
                    </Marker>
                </MapView>

                {/* Center marker - Next region */}
                { isEditing && <Icon size="10" as={<Ionicons name="location" />} color="primary.500" mb={9} /> }

                {/* Aside actions buttons container */}
                <Box style={styles.asideActions_container}>
                    {/* Re localize */}
                    <Box style={styles.asideActions_button}>
                        <Button
                            size="lg"
                            variant="outline"
                            borderColor="#fff"
                            leftIcon={<Icon as={Ionicons} name="locate-outline" size="lg" color="#fff" />}
                            onPress={() => setRegion(initialRegion)}
                        />
                    </Box>

                    {/* Send */}
                    {
                        isEditing && (
                            <Box style={styles.asideActions_button}>
                                <Button
                                    size="lg"
                                    leftIcon={<Icon as={Ionicons} name="send" size="lg" />}
                                    onPress={() => {
                                        if (onSendLocation) {
                                            onSendLocation(region);
                                            navigation.goBack();
                                        }
                                    }}
                                />
                            </Box>
                        )
                    }
                </Box>
            </Center>
        </Box>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null)(MapModalScreenComponent);
