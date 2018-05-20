const config = require('../../config/dbConfig');

/**
 * Here should be implemented all methods for db
 */
class DataMapper {
  constructor(connection) {
    this._connection = connection;
  }

  /**
   * @param {String} [name] Collection name in MongoDB
   * @returns {Promise<*>}  Collection
   */
  async getCollection(name) {
    return await this._connection.db(config.dbName)
      .collection(name || config.collectionName);
  }

  /**
   * get random Array [{lat, long}, {lat, long}] from default collection
   * @param n {number} Amount of coordinates
   * @returns {Promise<*>}
   */
  async getRandomCoordinates(n = 2) {
    try {
      const cursor = ((await this.getCollection())
        .aggregate(
          [{$sample: {size: n}}]));
      return await cursor.toArray();
    } catch (err) {
      console.error(err.stack);
    }
  }

  /**
   *
   * @param driversCount
   * @param locations [[Number]]
   * @returns {Promise<Promise|UnorderedBulkOperation|OrderedBulkOperation|void|*>}
   */
  async createTaxiPark(driversCount, locations) {
    // ??
    (await this.getCollection("drivers")).deleteMany({});

    const maxFeedback = 10;
    const minFeedback = 3;
    const taxis = [];
    for (let i = 0; i < driversCount; i++) {
      const currentPosition = {"type": "Point", "coordinates": locations[i]};
      const feedback = Math.floor(Math.random() * (maxFeedback - minFeedback) + minFeedback);
      taxis.push({
        driverCount: i,
        current_position: currentPosition,
        status: 'EMPTY',
        feedback
      });
    }
    try {
      (await this.getCollection("drivers")).insertMany(taxis);
      return taxis;
    } catch (e) {
      console.error(e.message);
    }
  }

  async createOrder(startPoint, endPoint) {
    try {
      const writeResult = await (await this.getCollection("orders")).insert({
        startPoint,
        endPoint,
        status: 'NEW',
        driver: null
      });
      return writeResult.ops[0];
    } catch (e) {
      console.error(e.message);
    }
  }

  async fetchNearestTaxi(coordinates) {
    const drivers = await this.getCollection('drivers');
    drivers.createIndex({
      "current_position": "2dsphere"
    });
    const cursor = drivers
      .find({
        status: 'EMPTY',
        current_position: {
          $near: {
            $geometry: coordinates
          }
        }
      });
    return (await cursor.toArray())[0];
  }

  async changeDriverStatus(driverId, status) {
    try {
      (await this.getCollection("drivers")).update({
        "_id": driverId,
      }, {
        $set: {
          status: status,
        }
      });

      return `taxi ${driverId} changed status to ${status}`
    } catch (e) {
      console.error(e);
    }
  }

  async assignTaxiOrder(driverId, orderId) {
    const update = {};
    try {
      update.driver = (await (await this.getCollection("drivers")).findOneAndUpdate({
        "_id": driverId
      }, {
        $set: {
          status: 'DRIVING',
          order: orderId
        }
      }, {
        returnOriginal: false
      })).value;

      update.order = (await (await this.getCollection("orders")).findOneAndUpdate({
        "_id": orderId
      }, {
        $set: {
          status: 'IN PROGRESS',
          driver: driverId
        }
      }, {
        returnOriginal: false
      })).value;

      return update;
    } catch (e) {
      console.error(e.message);
    }
  }
}

module.exports = DataMapper;