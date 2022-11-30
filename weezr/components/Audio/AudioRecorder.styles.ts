import createStyles from "../../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        recordingPopover: {
            position: 'absolute',
            flex: 1,
            bottom: 55,
            left: -80,
            width: 100,
            height: 35,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        }
    });
}

export default getStyles;
