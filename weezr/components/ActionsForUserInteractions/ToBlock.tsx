// @ts-ignore
import { gql } from "@apollo/client";
import { IUser, IUserInteraction, IUserInteractions } from "../../entities";

export interface IToBlock {
    me?: IUser;
    myBlock: IUserInteractions;
    userFront: IUser;
    onSetStateAtSubmit: (userInterBlock: IUserInteraction) => void;
}

export const TO_BLOCK = gql`
    mutation ($filter: UserInterBlock_Filter, $data: UserInterBlock_Data) {
        toBlock(filter: $filter, data: $data) {
            updatedPageInfo {
                message
                success
            }
            updatedData {
                id
                entityName
                at
                receiverId
                senderId
                isSeenByReceiver
            }
        }
    }
`;

export const onToBlock = ({
    toBlock,
    me,
    userFront,
    onSetStateAtSubmit,
    socketEvents,
    notificationsContext
}: any) => {
    toBlock({
        variables: {
            data: {
                dataMain: {
                    senderId: me?._id,
                    receiverId: userFront?.id,
                    at: new Date()
                }
            }
        }
    }).then((res: any) => {
        const userInterToBlock = res?.data?.toBlock?.updatedData as IUserInteraction;

        if (userInterToBlock?.id) {
            socketEvents.emit.newBlock({
                ...userInterToBlock,
                entityName: 'UserInterBlock',
                receiverId: userInterToBlock?.receiverId || userFront?.id,
                senderId: userInterToBlock?.senderId || me?._id
            });

            if (me?._id && notificationsContext?.count?.all) {
                notificationsContext.count.all(me._id);
            }

            // TODO Display toast add
        } else {
            // TODO Display toast remove
        }

        if (onSetStateAtSubmit) { onSetStateAtSubmit(userInterToBlock); }
    });
};

/*
const ToBlock = (props: IToBlock) => {
    const {
        me,
        myBlock,
        userFront,
        onSetStateAtSubmit
    } = props;

    const [toBlock, { error: toBlockError }] = useMutation(TO_BLOCK);
    const socketEvents = React.useContext(SocketEvents);

    if (toBlockError) {
        // TODO Display toast
        console.error(toBlockError);
    }

    const prevInteractionId = myBlock?.sent?.id;

    return (
        <Button
            leftIcon={<Icon as={Ionicons} name="ellipsis-horizontal-outline" size="sm" />}
            onPress={() => {
                onToBlock({
                    toBlock,
                    me,
                    userFront,
                    onSetStateAtSubmit,
                    socketEvents,
                    prevInteractionId
                });
            }}
        />
    );
};

function mapStateToProps(state: States.IAppState) {
    return {
        me: state.user.me
    };
}

export default connect(mapStateToProps, null)(ToBlock);
*/
