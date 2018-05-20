const MongoClient = require('mongodb').MongoClient;
const config = require('../config/dbConfig');

const connectionUrl = `mongodb://${config.host}:${config.port}`;

module.exports = function getConnection() {
  let connection;

  return async function (req, res, next) {
    try {
      if (!connection) {
        connection = await MongoClient.connect(connectionUrl);
      }
      req.connection = connection;
      next();
    } catch(e) {
      next(e);
    }
  };
};