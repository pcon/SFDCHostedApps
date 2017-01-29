/*jslint browser: true, regexp: true, es5: true, nomen: true */
/*global require, process, console */

var lo = require('lodash');
var express = require('express');
var router = express.Router();

var utils = require('./utils.js');

var listObjects = function (req, res) {
    'use strict';

    res.setHeader('Content-Type', 'application/json');

    utils.sfdc.describeGlobal(req.user)
        .then(function (data) {
            data.sobject_name = [];

            lo.each(data.sobjects, function (sobject) {
                data.sobject_name.push(sobject.name);
            });

            res.send(JSON.stringify(data));
        }).catch(function (err) {
            res.status(500).send(JSON.stringify({"message": err.message}));
        });
};

var objectDescribe = function (req, res) {
    'use strict';

    res.setHeader('Content-Type', 'application/json');

    utils.sfdc.describeObject(req.user, req.params.object)
        .then(function (data) {
            res.send(JSON.stringify(data));
        }).catch(function (err) {
            res.status(500).send(JSON.stringify({"message": err.message}));
        });
};

router.get('/describe/objects', utils.security.redirectSec, utils.user.ensureAuthenticated, listObjects);
router.get('/describe/objects/:object', utils.security.redirectSec, utils.user.ensureAuthenticated, objectDescribe);

module.exports = router;