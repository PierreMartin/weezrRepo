import passportLocal from 'passport-local';
import bcrypt from 'bcrypt';
import { User } from "../models/user";

const LocalStrategy = passportLocal.Strategy;

export default (passport) => {
    passport.use('local', new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            User.findOne({ email }, (err, user) => {
                let fieldsErrors = {};
                if (err) { return done(err); }

                if (!user) {
                    // fieldsErrors = [{ name: 'email', errors: ['Incorrect email'] }];
                    fieldsErrors = { email: 'Incorrect email' };
                    return done(null, false, { message: 'Incorrect email', fieldsErrors });
                }

                const hashPassword = user.password;
                const candidatePassword = password;

                return bcrypt.compare(candidatePassword, hashPassword, (err, isMatch) => {
                    if (err) {
                        // fieldsErrors = [{ name: 'password', errors: ['Incorrect password'] }];
                        fieldsErrors = { password: 'Incorrect password' };
                        return done(null, false, { message: 'Incorrect password', fieldsErrors, user });
                    }

                    if (isMatch) {
                        return done(null, user);
                    }

                    // fieldsErrors = [{ name: 'password', errors: ['Incorrect password'] }];
                    fieldsErrors = { password: 'Incorrect password' };
                    return done(null, false, { message: 'Incorrect password', fieldsErrors, user });
                });
            });
        }
    ));
};
