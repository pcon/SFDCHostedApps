/*jslint browser: true, regexp: true, es5: true */
/*global module, console, require, process */

var q = require('q');
var jsforce = require('jsforce');

var login = function (user) {
    'use strict';

    var deferred = q.defer(),
        conn = new jsforce.Connection({
            instanceUrl: user.instance_url,
            accessToken: user.access_token
        });
    deferred.resolve(conn);

    return deferred.promise;
};

var logout = function (conn) {
    'use strict';

    var deferred = q.defer();

    conn.logout(function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
};

var describeGlobal = function (user) {
    'use strict';

    var deferred = q.defer();

    login(user)
        .then(function (conn) {
            conn.describeGlobal(function (err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);
                }
            });
        }).catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
};

var describeObject = function (user, object_name) {
    'use strict';

    var deferred = q.defer();

    login(user)
        .then(function (conn) {
            conn.describe(object_name, function (err, res) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(res);
                }
            });
        }).catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
};

module.exports = {
    login: login,
    logout: logout,
    describeGlobal: describeGlobal,
    describeObject: describeObject
};