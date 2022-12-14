import createStyles from '../styles/base';
import colors from "../styles/colors";

function getStyles(params: any = {}) {
    return createStyles({
        itemRowFrontContainer: {
            flex: 1,
            backgroundColor: colors.dark.border
        },
        itemRowFront: {
            flexDirection: 'row',
            padding: 6
        },
        // For swipe:
        itemRowBackContainer: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.dark.border,
            paddingLeft: 15
        },
        itemPicture: {
            marginRight: 10
        },
        itemPrimaryText: {
            fontWeight: 'bold',
            fontSize: 14,
            color: 'black',
            marginBottom: 4
        },
        itemSecondaryText: {
            color: 'grey'
        }
    });
}

export default getStyles;
