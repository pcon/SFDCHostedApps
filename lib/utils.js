/*jslint browser: true, regexp: true, es5: true */
/*global module, console, require, process */

var security_redirectPostLogin = function (req, res) {
    'use strict';

    res.redirect(req.session.returnTo);
};

var security_redirectSec = function (req, res, next) {
    'use strict';

    if (req.headers['x-forwarded-proto'] === 'http' && req.params.filepath !== undefined && !req.params.filepath.startsWith('/.well-known')) {
        res.redirect('https://' + req.headers.host + req.path);
    } else {
        return next();
    }
};

var user_ensureAuthenticated = function (req, res, next) {
    'use strict';

    if (req.isAuthenticated()) {
        return next();
    }

    req.session.returnTo = req.originalUrl;
    res.redirect('/auth/prod/authorize');
};

var user_passportNoOp = function (user, done) {
    'use strict';

    done(null, user);
};

var user_setup = function (accessToken, refreshToken, profile, done) {
    'use strict';

    profile.access_token = accessToken;
    profile.refresh_token = refreshToken;
    done(null, profile);
};

module.exports = {
    security: {
        redirectPostLogin: security_redirectPostLogin,
        redirectSec: security_redirectSec
    },
    user: {
        ensureAuthenticated: user_ensureAuthenticated,
        passportNoOp: user_passportNoOp,
        setup: user_setup
    }
};