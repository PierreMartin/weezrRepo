import passport from "passport";

export function assertAuthenticated(req, res, next, methode, cb, promiseMode = false, resolve = null) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        // internal server error occurred
        if (err) {
            if (promiseMode) { return resolve(null); }
            return next(err);
        }

        // console.log('assertAuthenticated methode => ', methode);

        if (!user) {
            if (promiseMode) { return resolve(null); }
            return res.status(401).json({ message: `${methode || ''} [jwt] - You need to be logged in` });
        }

        if (promiseMode) { return resolve(user); }

        cb(user);
    })(req, res, next);
}

export const assertAuthenticatedPromise = (req, res, next, methode) => {
    return new Promise((resolve) => {
        return assertAuthenticated(req, res, next, methode, () => null, true, resolve)
    });
};

export function assertAdmin(req, res, next, methode, cb) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) { return next(err); } // internal server error occurred

        if (!!user?.roles?.includes('ADMIN')) {
            return res.status(401).json({ message: `${methode} [jwt] - You need to be a admin` });
        }

        cb(user);
    })(req, res, next);
}
