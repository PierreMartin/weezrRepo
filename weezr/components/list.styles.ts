import createStyles from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        itemRow: {
            flexDirection: 'row',
            padding: 6
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
