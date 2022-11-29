import { StyleSheet } from "react-native";
import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        mapView: {
            ...StyleSheet.absoluteFillObject
        },
        mapLegend: {
            position: 'absolute',
            bottom: 20,
            left: 50,
            width: 280,
            backgroundColor: 'rgba(201,201,201,0.6)',
            padding: 0,
            borderRadius: 12
        },
        markerContainer: {
            borderStyle: 'dashed',
            borderColor: '#fff',
            borderWidth: 2,
            borderRadius: 55
        }
    });
}

export default getStyles;
