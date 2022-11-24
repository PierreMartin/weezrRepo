import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        title: {
            fontSize: 20,
            fontWeight: 'bold',
        },
        link: {
            marginTop: 15,
            paddingVertical: 15,
        },
        linkText: {
            fontSize: 14,
            color: '#2e78b7',
        }
    });
}

export default getStyles;
