import jwtLocal from 'passport-jwt';
import { User } from "../models/user";

const JwtStrategy = jwtLocal.Strategy;
const ExtractJwt = jwtLocal.ExtractJwt;

export default (passport) => {
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.JWT_SECRET;

    passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({ _id: jwt_payload._id }, function(err, user) {
            if (err) {
                return done(err, false);
            }

            if (user) {
                return done(null, user);
            }

            return done(null, false);
        });
    }));
};
