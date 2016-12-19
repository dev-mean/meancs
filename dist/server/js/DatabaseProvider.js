'use strict';

var _mongodb = require('mongodb');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DatabaseProvider = function DatabaseProvider() {

    var db = new _mongodb.Db('meancs', new _mongodb.Server('localhost', 27017, { auto_reconnect: true, keepAlive: 1, connectTimeoutMS: 30000 }));
    db.open(function (err, db) {
        _assert2.default.equal(null, err);
    });

    return db;
};

exports.DatabaseProvider = DatabaseProvider;