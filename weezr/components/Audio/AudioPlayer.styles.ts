import createStyles from "../../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        playerContainer: {
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
            width: 200,
            paddingHorizontal: 4,
            paddingTop: 12,
            paddingBottom: 0
        },
        playBtn: {
            // marginTop: 0
        },
        viewBarWrapper: {
            flex: 1,
            marginHorizontal: 8
        },
        viewBar: {
            backgroundColor: '#ccc',
            height: 20,
            alignSelf: 'stretch',
        },
        viewBarPlay: {
            backgroundColor: 'white',
            height: 20,
            width: 0,
        },
        txtCounterWrapper: {
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        txtCounter: {
            color: 'white',
            fontSize: 11,
            fontWeight: '200'
        },
    });
}

export default getStyles;
