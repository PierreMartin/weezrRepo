import passport from 'passport';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

export default (app, mongoose) => {
    // Enable Cors:
    app.use((req, res, next) => {
        // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        // res.header("Access-Control-Allow-Credentials", true);

        if (req.method === "OPTIONS") {
            res.sendStatus(200); // For Apollo GraphQl
        } else {
            next();
        }
    });
    app.use(bodyParser.json());
    app.use(express.static(path.join(process.cwd(), 'public')));

    /*
    app.set('trust proxy', true);
    const MongoStore = connectMongo(expressSession);

    // AuthPassport - A session will be established and maintained via a cookie set in the user's browser:
    const sess = {
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection }), // store the sessions in the DB:
        secret: process.env.SESSION_SECRET || 'abc54545',
        proxy: true, // The "X-Forwarded-Proto" header will be used.
        name: 'sessionAuth',
        cookie: {
            httpOnly: true,
            secure: false, // Not using https
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        }
    };

    if (process.env.NODE_ENV === 'production') {
        sess.cookie.secure = true; // Serve secure cookies
    }

    app.use(expressSession(sess));
    */

    app.use(passport.initialize());
    // app.use(passport.session());
};
