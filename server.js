/*jslint browser: true, regexp: true, es5: true, nomen: true */
/*global require, process, console, __dirname */

var express = require('express');
var expressSession = require('express-session');
var lo = require('lodash');
var morgan = require('morgan');
var passport = require('passport');
var path = require('path');

var utils = require('./lib/utils.js');

var MongoStore = require('connect-mongo/es5')(expressSession);
var SalesforceStrategy = require('passport-salesforce').Strategy;
var prodStrategy = new SalesforceStrategy({
    clientID: process.env.SALESFORCE_PROD_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_PROD_CLIENT_SECRET,
    callbackURL:  process.env.SALESFORCE_PROD_CALLBACK_URL
}, utils.user.setup);

var session_options = {
    //maxAge: 600000,
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
};

var mongoUrl;

if (process.env.OPENSHIFT_MONGODB_DB_HOST) {
    mongoUrl = 'mongodb://' +
        process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}

if (mongoUrl) {
    session_options.store = new MongoStore({
        autoRemove: 'native',
        url: mongoUrl
    });
}

var BOWER_JS = [
    'jquery/dist/',
    'bootstrap/dist/js',
    'angular',
    'angular-ui-router/release',
    'angular-bootstrap',
    'lodash/dist'
];

var BOWER_CSS = [
    'bootstrap/dist/css',
    'font-awesome/css/'
];

var BOWER_FONTS = [
    'bootstrap/dist/fonts',
    'font-awesome/fonts/'
];

var SFDCApps = function () {
    'use strict';

    var self = this;

    self.setupVariables = function () {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (self.ipaddress === undefined) {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = '127.0.0.1';
        }

        passport.use(prodStrategy);
        passport.serializeUser(utils.user.passportNoOp);
        passport.deserializeUser(utils.user.passportNoOp);
    };


    self.populateCache = function () {
        if (self.zcache === undefined) {
            self.zcache = { 'index.html': '' };
        }
    };

    self.cache_get = function (key) {
        return self.zcache[key];
    };

    self.terminator = function (sig) {
        if (typeof sig === 'string') {
            console.log('%s: Received %s - terminating app ...', Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };

    self.setupTerminationHandlers = function () {
        process.on('exit', function () {
            self.terminator();
        });

        [
            'SIGHUP',
            'SIGINT',
            'SIGQUIT',
            'SIGILL',
            'SIGTRAP',
            'SIGABRT',
            'SIGBUS',
            'SIGFPE',
            'SIGUSR1',
            'SIGSEGV',
            'SIGUSR2',
            'SIGTERM'
        ].forEach(function (element) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };

    self.initializeServer = function () {
        self.app = express();

        //self.app.use(morgan('short'));

        self.app.use('/.well-known/acme-challenge/', utils.security.redirectSec, express.static('static/.well-known/acme-challenge'));

        lo.each(BOWER_JS, function (dir) {
            self.app.use('/js', utils.security.redirectSec, express.static(__dirname + '/bower_components/' + dir));
        });

        lo.each(BOWER_CSS, function (dir) {
            self.app.use('/css', utils.security.redirectSec, express.static(__dirname + '/bower_components/' + dir));
        });

        lo.each(BOWER_FONTS, function (dir) {
            self.app.use('/fonts', utils.security.redirectSec, express.static(__dirname + '/bower_components/' + dir));
        });

        self.app.use(expressSession(session_options));
        self.app.use(passport.initialize());
        self.app.use(passport.session());

        self.app.get('/auth/prod/authorize', passport.authenticate('salesforce', {session: true}));
        self.app.get('/auth/prod/callback', passport.authenticate('salesforce', {session: true}), utils.security.redirectPostLogin);
        self.app.use('/api', require('./lib/api.js'));

        self.app.use('/objdesc', utils.security.redirectSec, utils.user.ensureAuthenticated, express.static('app_static/objdesc'));
    };

    self.initialize = function () {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
        self.initializeServer();
    };

    self.start = function () {
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...', Date(Date.now()), self.ipaddress, self.port);
        });
    };
};

var zapp = new SFDCApps();
zapp.initialize();
zapp.start();