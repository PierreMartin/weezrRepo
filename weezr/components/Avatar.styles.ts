import createStyles, { colors } from "../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        initialContainer: {
            backgroundColor: '#f6990a',
            width: 32,
            height: 32,
            paddingLeft: 8,
            paddingTop: 5,
            borderRadius: 80
        },
        initialText: {
            color: '#fff',
            fontWeight: 'bold'
        }
    });
}

export default getStyles;
