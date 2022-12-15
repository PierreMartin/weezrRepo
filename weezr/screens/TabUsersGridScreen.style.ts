import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        itemContainer: {
            // flex: 1,
            // flexGrow: 1,
            // justifyContent: 'center',
            marginLeft: params.marginSize,
            marginBottom: params.marginSize
        },
        userTitleText: {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 12,
            ...colors.textShadow
        },
        userDistanceIcon: {
            color: '#fff',
            ...colors.textShadow
        },
        userDistanceText: {
            color: '#fff',
            fontWeight: '500',
            fontSize: 12,
            ...colors.textShadow
        },
        searchContainer: {
            flexDirection: 'row',
            padding: 6
        }
    });
}

export default getStyles;
