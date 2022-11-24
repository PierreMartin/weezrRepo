import createStyles, { colors } from "../styles/base";

function getStyles(params: any = {}) {
    return createStyles({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        pageContentContainer: {
            flex: 1,
            paddingTop: 70,
            paddingBottom: 100,
        },
        formContainer: {
            paddingVertical: 8,
            paddingHorizontal: 10
        },
        navigationButton: {
            backgroundColor: "#fff",
            padding: 8,
            borderRadius: 100
        },
        navigationTextButton: {
            color: '#fff',
            fontWeight: 'bold',
        },
        paginationContainer: {
            position: 'absolute',
            bottom: params.offsetPagination - 15,
            left: 60,
            right: 60
        },
        buttonsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            zIndex: 9,
            bottom: 0,
            right: 0
        }
    });
}

export default getStyles;
