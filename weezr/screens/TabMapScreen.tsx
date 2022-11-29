// @ts-ignore
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as React from 'react';
import { Platform } from 'react-native';
import { connect } from "react-redux";
import _ from "lodash";
import { Box, Button, Center, Icon, View } from "native-base";
import { StackNavigationProp } from '@react-navigation/stack/lib/typescript/src/types';
import { useFocusEffect } from "@react-navigation/native";
import { gql, useLazyQuery } from "@apollo/client";
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import { Avatar } from "../components/Avatar";
import { Text } from '../components';
import { Spinner } from "../components/Spinner";
import { IUser } from "../entities";
import { States } from "../reduxReducers/states";
import getStyles from "./TabMapScreen.styles";

const styles = getStyles();
const itemsPerPage = 40;

const USERS = gql`
    query ($filter: User_Filter, $data: User_Data, $offset: Int, $limit: Int) {
        users(filter: $filter, data: $data, offset: $offset, limit: $limit) {
            pageInfo {
                message
                success
                totalCount
                isLimitReached
                isLastPage
            }
            data {
                email
                displayName
                about
                id
                currentLocation {
                    latitude
                    longitude
                }
                distanceComparedToMe
                images
            }
        }
    }
`;

const mapStyle: any[] = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#242f3e"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#746855"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#242f3e"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#d59563"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#d59563"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#263c3f"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#6b9a76"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#38414e"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#212a37"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#9ca5b3"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#746855"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#1f2835"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#f3d19c"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#2f3948"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#d59563"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#17263c"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#515c6d"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#17263c"
            }
        ]
    }
];

interface ITabMapScreenProps {
    navigation: StackNavigationProp<any, any>;
    me: IUser;
}

function TabMapScreen({ navigation, me }: ITabMapScreenProps) {
    const [loadUsers, { loading, data, error, fetchMore }] = useLazyQuery(USERS);
    const [region, setRegion] = React.useState<any>({
        latitude: me?.currentLocation?.latitude || 1,
        longitude: me?.currentLocation?.longitude || 1,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
    });
    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
    const { isLastPage } = data?.users?.pageInfo || {};

    // First query for get users:
    const onLoadUsers = () => {
        if (me?._id && me?.currentLocation?.coordinates) {
            loadUsers({
                variables: {
                    filter: {
                        filterMain: {
                            // TODO { 'account.lastActivityAt': { $gte: new Date() - (1000 * 60 * 30) } } // last 30 min
                        }
                    },
                    data: {
                        dataMain: {
                            userMeId: me?._id,
                            coordinates: me?.currentLocation?.coordinates,
                        }
                    },
                    offset: 0, // skip
                    limit: itemsPerPage
                }
            });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            onLoadUsers();
        }, [])
    );

    // Load more users: // TODO implem it:
    const onLoadUsersMore = () => {
        if (!isLastPage && !isLoadingMore && fetchMore) {
            setIsLoadingMore(true);

            fetchMore({
                variables: {
                    filter: {
                        filterMain: {
                            // TODO { 'account.lastActivityAt': { $gte: new Date() - (1000 * 60 * 30) } } // last 30 min
                        }
                    },
                    data: {
                        dataMain: {
                            userMeId: me?._id,
                            coordinates: me?.currentLocation?.coordinates,
                        }
                    },
                    coordinates: me?.currentLocation?.coordinates,
                    offset: data?.users?.data?.length // skip
                }
            }).finally(() => {
                setIsLoadingMore(false);
            });
        }
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Box>
                    <Button
                        m={0}
                        p={1}
                        variant="solid"
                        backgroundColor="#fff"
                        // borderColor="gray"
                        _text={{
                            color: "primary.500"
                        }}
                        leftIcon={<Icon as={Ionicons} name="options-outline" size="5" />}
                        // onPress={() => navigation.navigate('UserPreferencesMenu')}
                    />
                    {/*
                    <InputSearch
                        fieldData={{ placeholder: 'Search' }}
                        onChange={(value: string) => console.log(value)}
                    />
                    */}
                </Box>
            )
        });
    }, [navigation]);

    const onRegionChange = _.debounce((regionParam: any) => {
        setRegion(regionParam);
    }, 0);

    /*
    const onRefresh = () => {
        onLoadUsers();
    };
    */

    const noCurrentLocation = !(me?.currentLocation?.latitude && me?.currentLocation?.longitude);
    if (error || noCurrentLocation) return <Center style={styles.container}><Text>Error at loading data...</Text></Center>;

    return (
        <View style={styles.main}>
            { loading && <Spinner /> }

            <MapView
                style={styles.mapView}
                region={region}
                onRegionChangeComplete={(regionParam) => onRegionChange(regionParam)}
                customMapStyle={mapStyle}
                // provider={PROVIDER_GOOGLE} // remove if not using Google Maps // TODO bug with ios
                userInterfaceStyle="dark"
                showsScale
            >
                {
                    (Platform.OS === 'android') && (
                        <UrlTile
                            urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maximumZ={19}
                            flipY={false}
                        />
                    )
                }

                {(data?.users?.data as IUser[])?.map((user: any) => {
                    if (!(user?.currentLocation?.latitude && user?.currentLocation?.longitude)) { return; }
                    const isMe = user.id === me._id;

                    return (
                        <Marker
                            key={user.id}
                            coordinate={user.currentLocation}
                            title={user.displayName || 'User'}
                            description={user.about?.aboutMe || ''}
                            onCalloutPress={() => navigation.navigate('UserDetail', { userId: user.id })}
                        >
                            <Center>
                                <Box style={[styles.markerContainer, { borderWidth: isMe ? 2 : 0 }]}>
                                    <Avatar
                                        user={user}
                                        size="md"
                                    />
                                </Box>

                                <Text style={{ color: '#fff', fontSize: 9 }}>{`${user.email}`}</Text>
                            </Center>
                        </Marker>
                        /*
                        <Marker
                            key={user.id}
                            coordinate={user.currentLocation}
                            title={`${user.firstname || 'Unknown user'} ${user.lastname}`}
                            description={user.email || 'description...'}
                            pinColor={isMe ? '#fa520a' : '#ffe377'}
                            image={{ uri }}
                        />
                        */
                    );
                })}
            </MapView>

            <Center style={styles.mapLegend}>
                <Text style={{ fontSize: 11 }}>{`${region.longitude} ${region.latitude}`}</Text>
            </Center>
        </View>
    );
}

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null)(TabMapScreen);
