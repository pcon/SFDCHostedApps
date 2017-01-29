/*jslint browser: true, regexp: true, es5: true */
/*global module, console, require, process */

var url = require('url');

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

    console.log(req.session);
    res.redirect('/auth/prod/authorize');
};

var user_passportNoOp = function (user, done) {
    'use strict';

    done(null, user);
};

var user_setup = function (accessToken, refreshToken, profile, done) {
    'use strict';

    var url_parts = url.parse(profile.urls.enterprise),
        instanceUrl = url_parts.protocol + '//' + url_parts.host;

    profile.access_token = accessToken;
    profile.refresh_token = refreshToken;
    profile.instance_url = instanceUrl;
    done(null, profile);
};

module.exports = {
    security: {
        redirectPostLogin: security_redirectPostLogin,
        redirectSec: security_redirectSec
    },
    sfdc: require('./sfdc.js'),
    user: {
        ensureAuthenticated: user_ensureAuthenticated,
        passportNoOp: user_passportNoOp,
        setup: user_setup
    }
};