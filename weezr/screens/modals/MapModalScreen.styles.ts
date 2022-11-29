import createStyles from "../../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        container: {
            paddingVertical: 10
        },
        asideActions_container: {
            position: 'absolute',
            bottom: 35,
            right: 25,
            zIndex: 10
        },
        asideActions_button: {
            marginBottom: 8
        }
    });
}

export default getStyles;
