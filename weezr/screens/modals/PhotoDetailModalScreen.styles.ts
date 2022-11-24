import createStyles, { colors } from "../../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        container: {
            paddingVertical: 10
        },
        toolbarBottomContainer: {
            flexDirection: 'row',
            height: 200,
            width: params.width,
            paddingTop: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.9)'
        },
        infosText: {
            color: '#fff',
            fontSize: 16
        },
    });
}

export default getStyles;
