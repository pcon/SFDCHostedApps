/*jslint browser: true, regexp: true, es5: true, nomen: true */
/*global require, process, console */

var express = require('express');
var router = express.Router();

var utils = require('./utils.js');

var objectDescribe = function (req, res) {
    'use strict';

    console.log(req.session.accessToken);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ a: 1 }));
};

router.get('/objects', utils.security.redirectSec, utils.user.ensureAuthenticated, objectDescribe);

module.exports = router;