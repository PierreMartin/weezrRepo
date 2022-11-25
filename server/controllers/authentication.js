import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { assertAuthenticated } from "./authorizationMiddleware";

/**
 * POST /api/login
 */
export function login(req, res, next) {
    // AuthPassport: 'local' define in authent/localStrategy.js
    passport.authenticate('local', (authErr, user, unauthorizedInfo) => {
        if (authErr) { return next(authErr); }

        // unauthorized error (if wrong password or wrong login):
        if (!user) {
            if (unauthorizedInfo?.user?.email) {
                const filter = { email: unauthorizedInfo.user.email };
                const data = { incorrectPasswordInput: (unauthorizedInfo.user?.incorrectPasswordInput || 0) + 1 };

                return User.findOneAndUpdate(filter, data, (err, userRes) => {
                    return res.status(401).json({
                        message: unauthorizedInfo.message,
                        fieldsErrors: unauthorizedInfo.fieldsErrors
                    });
                });
            }

            return res.status(401).json({
                message: unauthorizedInfo.message,
                fieldsErrors: unauthorizedInfo.fieldsErrors
            });
        }

        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET);

        if (token) {
            const filter = { email: user.email };
            const data = { incorrectPasswordInput: 0 };

            return User
                .findOneAndUpdate(filter, data, { new: true })
                .select('-password')
                .exec((err, userRes) => {
                    return res.status(200).json({
                        token,
                        message: 'Login succeeded',
                        data: {
                            authenticatedState: 'connected',
                            me: userRes
                        }
                    });
                });
        }
    })(req, res, next);
}

/**
 * POST /api/signup
 */
export function signUp(req, res, next) {
    const data = req.body;
    const userToCreate = new User(data);

    User.findOne({ email: data.email })
        .exec((findErr, existingUser) => {
            // conflict errors :
            if (existingUser) {
                return res.status(409).json({
                    message: 'Account already exist!',
                    // fieldsErrors: [{ name: 'email', errors: ['Account already exist!'] }]
                    fieldsErrors: { email: 'Account already exist!' }
                });
            }

            // create account :
            return userToCreate
                .save((saveErr, userRes) => {
                    if (saveErr) { return next(saveErr); }

                    const user = userRes.toObject();
                    const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JWT_SECRET);
                    delete user.password;

                    return res.status(200).json({
                        token,
                        message: 'Signup succeeded',
                        data: {
                            authenticatedState: 'connected',
                            me: user
                        }
                    });
            });
        });
}

/**
 * POST /api/logout
 */
export function logout(req, res, next) {
    assertAuthenticated(req, res, next, 'logout', () => {
        return res.status(200).json({
            message: 'Logout succeeded',
            data: {
                authenticatedState: 'disconnected',
                me: null
            }
        });
    });
}
