/* eslint-disable no-param-reassign */
import React from 'react';
import { Box, Center, Text } from "native-base";
// import withObservables from '@nozbe/with-observables';
import { Q } from "@nozbe/watermelondb";
import { database } from "../../localServer/index.native";

interface IWatermelonTest {
    message?: any;
    threadId?: string;
}

const WatermelonTestComponent = (props: IWatermelonTest) => {
    const { threadId } = props;

    const [messages, setMessages] = React.useState<any[]>([]);

    console.log(threadId);

    // Get many:
    const fetchMessages = React.useCallback(async () => {
        try {
            const messagesCollection = await database.get('messages');

            const res = await messagesCollection
                .query()
                .fetch();

            const nextMessages = res?.map((r: any) => r?._raw);
            if (nextMessages) { setMessages(nextMessages); }
        } catch (e) {
            console.error(e);
        }
    }, [threadId]); // Pass needed props here

    // Get many with filter:
    const fetchMessage = React.useCallback(async () => {
        if (threadId) {
            try {
                const messagesCollection = await database.get('messages');

                const res = await messagesCollection
                    .query(Q.where('id', threadId))
                    .fetch();

                console.log(res);

                // Get one (by ID):
                // const res2 = await messagesCollection.find(threadId);
            } catch (e) {
                console.error(e);
            }
        }
    }, [threadId]); // Pass needed props here

    // Create new:
    const createNewMessage = React.useCallback(async () => {
        try {
            await database.write(async () => {
                const messagesCollection = await database.get('messages');

                const newMessage = await messagesCollection.create((message: any) => {
                    message.text = 'New text here...';
                    message.title = 'New title...';
                });

                console.log('newMessage => ', newMessage);
            });
        } catch (e) {
            console.error(e);
        }
    }, []); // Pass needed props here

    React.useEffect(() => {
        // createNewMessage();
        // fetchMessage();
        fetchMessages();
    }, []);

    return (
        <Center flex={1}>
            { (!messages?.length) ? (
                <Text>No data</Text>
            ) : (
                <>
                    {
                        messages?.map((message: any) => {
                            const { text, title, id } = message;

                            return (
                                <Box key={id} style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontWeight: 'bold' }}>{title}</Text>
                                    <Text>{text}</Text>
                                </Box>
                            );
                        })
                    }
                </>
            ) }
        </Center>
    );
};

/*
const enhance = withObservables(['threadId'], ({ threadId }) => {
    return {
        // message, // shortcut syntax for `message: message.observe()`
        message: database.get('messages').findAndObserve(threadId)
    };
});

const WatermelonTest = enhance(WatermelonTestComponent);
*/
export default WatermelonTestComponent;
