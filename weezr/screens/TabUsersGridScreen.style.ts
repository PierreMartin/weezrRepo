import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    const backgroundColor = colors.dark.backgroundOpacity;

    return createStyles({
        itemContainer: {
            // flex: 1,
            // flexGrow: 1,
            // justifyContent: 'center',
            marginLeft: params.marginSize,
            marginBottom: params.marginSize
        },
        userTitle: {
            color: '#fff',
            backgroundColor,
            fontWeight: 'bold',
            fontSize: 11
        },
        userDistance: {
            marginTop: 8,
            backgroundColor,
            color: '#fff'
        },
        searchContainer: {
            flexDirection: 'row',
            padding: 6
        }
    });
}

export default getStyles;
