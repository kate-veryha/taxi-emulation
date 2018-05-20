const MongoClient = require('mongodb').MongoClient;
const config = require('../../config/dbConfig');

const connectionUrl = `mongodb://${config.host}:${config.port}`;


module.exports = (function() {
  let connection;

  return async function () {
    try {
      if (!connection) {
        connection = await MongoClient.connect(connectionUrl);
      }

      return connection;
    } catch(e) {
      console.error('Cannot get connection');
    }
  };
})();