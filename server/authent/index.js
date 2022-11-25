import passport from 'passport';
import local from './localStrategy';
import jwt from './jwtStrategy';
import { User } from '../models/user';

export default () => {
    // For Passport authenticated session persistence.
    // Passport needs to serialize users into and deserialize users out of the session.
    // The implementation of this is supplying the user ID when serializing,
    // and querying the user record by ID from the database when deserializing.

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // The user ID is serialized to the session:
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    // AuthPassport: The strategies:
    local(passport);
    jwt(passport);
};
