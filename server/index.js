import express from 'express';
import { createServer } from "http";
import { Server } from 'socket.io';
import initExpress from './initExpress';
import initGrapgQl from './graphQl/index';
import mongoose from 'mongoose';
import initRoutes from './routes';
import initPassport from './authent/index';
import initSocketEvents from './socketEvents';
import connectMongoDb from './connectMongoDb';

const port = 3080;
const app = express();

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

connectMongoDb(mongoose);
initPassport();
initExpress(app, mongoose);
initGrapgQl(app);
initRoutes(app);

// Init Socket.io:
const httpServer = createServer(app);
const io = new Server(httpServer);
initSocketEvents(io);

httpServer.listen(port, () => {
    console.log('--------------------------');
    console.log('===> Starting Server . . .');
    console.log(`===> Environment: ${process.env.NODE_ENV}`);
    console.log(`===> Listening at http://localhost:${port}`);
    console.log('--------------------------');
});
