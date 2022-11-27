export default (io) => {
    io.on('connection', (socket) => {
        // --------------------------- Room type user ---------------------------
        socket.on('joinUser', (userId) => {
            // socket.leaveAll();
            socket.join(userId);
            // console.log('socket.rooms (join user) => ', socket.rooms);
        });

        socket.on('leaveUser', (userId) => {
            socket.leave(userId);
            // console.log('socket.rooms (leave user) => ', socket.rooms);
        });

        // --------------------------- Room type userInteractions ---------------------------
        /*
        socket.on('joinUserInteractions', (wsRoomIds) => {
            for (let i = 0; i < wsRoomIds?.length; i++) {
                socket.join(wsRoomIds[i]);
            }
        });

        socket.on('leaveUserInteractions', (wsRoomIds) => {
            for (let i = 0; i < wsRoomIds?.length; i++) {
                socket.leave(wsRoomIds[i]);
            }
        });
        */

        // --------------------------- Room type thread ---------------------------
        socket.on('joinThreads', (threadIds) => {
            // socket.leaveAll();
            for (let i = 0; i < threadIds?.length; i++) {
                socket.join(threadIds[i]);
            }

            // NOTE 1) here
            // console.log('socket.rooms (join) => ', socket.rooms);
        });

        socket.on('leaveThreads', (threadIds) => {
            for (let i = 0; i < threadIds?.length; i++) {
                socket.leave(threadIds[i]);
            }

            // console.log('socket.rooms (leave) => ', socket.rooms);
        });

        // --------------------------- Events: ---------------------------
        socket.on('newThread', (param) => {
            // sending to all clients except sender :
            // socket.broadcast.emit('newThreadServer', param);

            for (let i = 0; i < param?.participantsIds?.length; i++) {
                socket.broadcast.to(param.participantsIds[i]).emit('newThreadServer', param);
            }
        });

        /**
         * @param {object}
         * {
         * 		newMessage: {Object}
         * }
         * */
        socket.on('newMessage', (param) => {
            // sending to all clients in thread except sender :

            // NOTE 2) here
            // console.log('newMessage param.threadId ', param.threadId);
            socket.broadcast.to(param.threadId).emit('newMessageServer', param);
        });

        socket.on('newSeenMessages', (param) => {
            socket.broadcast.to(param.threadId).emit('newSeenMessagesServer', param);
        });

        /**
         * @param {object}
         * {
         * 		userId: {String}
         * 		threadId: {String}
         * }
         * */
        socket.on('startTyping', (param) => {
            socket.broadcast.to(param.threadId).emit('startTypingServer', param);
        });

        /**
         * @param {object}
         * {
         * 		userId: {String}
         * 		threadId: {String}
         * }
         * */
        socket.on('stopTyping', (param) => {
            socket.broadcast.to(param.threadId).emit('stopTypingServer', param);
        });

        socket.on('newPrimaryNotification', (param) => {
            socket.broadcast.to(param.receiverId).emit('newPrimaryNotificationServer', param);
            // socket.broadcast.to(param.wsRoomId).emit('newLikeServer', param);
        });

        socket.on('newLike', (param) => {
            socket.broadcast.to(param.receiverId).emit('newLikeServer', param);
        });

        socket.on('newVisit', (param) => {
            socket.broadcast.to(param.receiverId).emit('newVisitServer', param);
        });

        socket.on('newRequest', (param) => {
            socket.broadcast.to(param.receiverId).emit('newRequestServer', param);
        });

        socket.on('newRequestResponse', (param) => {
            socket.broadcast.to(param.senderId).emit('newRequestResponseServer', param);
        });

        socket.on('newFollow', (param) => {
            socket.broadcast.to(param.receiverId).emit('newFollowServer', param);
        });

        socket.on('newBlock', (param) => {
            socket.broadcast.to(param.receiverId).emit('newBlockServer', param);
        });
    });
};
