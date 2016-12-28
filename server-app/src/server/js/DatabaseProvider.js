
import {Db,Server} from 'mongodb';
import assert from 'assert';
let DatabaseProvider = function() {

    let db = new Db('meancs', new Server('localhost', 27017, {auto_reconnect: true,keepAlive: 1, connectTimeoutMS: 30000 }));
    db.open(function(err, db) {
      assert.equal(null, err);
    });

    return db;
};

exports.DatabaseProvider = DatabaseProvider;