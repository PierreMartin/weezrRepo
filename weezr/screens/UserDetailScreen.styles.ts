import createStyles, { colors } from '../styles/base';

function getStyles(params: any = {}) {
    return createStyles({
        container: {
            paddingVertical: 22
        },
        bgContainer: {
            position: 'relative',
            width: '100%',
            height: '100%'
        },
        userScrollableDetailContainer: {
            // position: 'absolute',
            // bottom: 0,
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)'
        },
        headerContainer: {
            marginBottom: 12
        },
        thumbnailsContainer: {
            position: 'absolute',
            flexDirection: 'row',
            bottom: 0
        },
        paginationImagesContainer: {
            height: 4,
            position: 'absolute',
            top: 6,
            left: 8,
            right: 8,
            zIndex: 8,
            flexDirection: 'row'
        },
        toolbarUserInteractionContainer: {
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 10
        },
        userInteractionButton: {
            marginBottom: 8
        },
        headlineText: {
            fontSize: 22,
            fontWeight: 'bold'
        }
    });
}

export default getStyles;
