const store = require('./store');
const rd = require('../src/helpers/retrieveRouteData');
const COUNT = require('../config/taxi');
const getRoute = require('./helpers/getRoute');
const DataMapper = require('./db/DataMapper');

/**
 * NOTE!!!
 * 2. Case when driver finishes 1st order and takes next not implemented yet
 */
class TaxiDispatcher {
  constructor(connection) {
    this._store = store;
    this._dataMapper = new DataMapper(connection); // If we want to save data both to db an store

    this._initStore();
  }

  async initTaxiPark() {
    const locations = (await this._dataMapper.getRandomCoordinates(COUNT))
      .map(el => el.coordinates);
    const drivers = await this._dataMapper.createTaxiPark(COUNT, locations);
    this._store.set('drivers', drivers);
  }

  getNextLocation(driverId) {
    const routeData = this.getDriver(driverId).routeData;
    const nextRouteData = rd.countNextSection(routeData);
    this._store.update('drivers', driverId, {routeData: nextRouteData});

    const step = nextRouteData.steps.items[nextRouteData.steps.currentStep];

    return rd.countNextLocation(
      step.start_location,
      step.end_location,
      step.lambda * step.currentSection
    );
  }

  async initOrder() {
    const [startPoint, endPoint] = await this._dataMapper.getRandomCoordinates();
    const newOrder = await this._dataMapper.createOrder(startPoint, endPoint);
    this._store.push('orders', newOrder);

    const nearestTaxi = await this._dataMapper.fetchNearestTaxi(startPoint);

    if (nearestTaxi) {
      await this.assignOrder(nearestTaxi, newOrder);
    }
  }

  async assignOrder(nearestDriver, newOrder) {
    // update in db
    const {driver, order} = await this._dataMapper.assignTaxiOrder(nearestDriver._id, newOrder._id);

    //send request api
    const currentPoint = nearestDriver.current_position.coordinates;
    const {startPoint, endPoint} = order;
    const routeData = await getRoute(currentPoint, startPoint.coordinates, endPoint.coordinates);
    driver.routeData = rd.extendRouteData(JSON.parse(routeData).routes[0].legs[0]);

    // update store
    this._store.update('drivers', driver._id, driver);
    this._store.update('orders', order._id, order);
  }

  getDrivers() {
    return this._store.get('drivers');
  }

  getDriver(id) {
    return this.getDrivers().find(d => d._id.toString() === id.toString());
  }

  getOrders() {
    return this._store.get('orders');
  }

  _initStore() {
    if (!this.getDrivers()) {
      this._store.set('drivers', []);
    }
    if (!this.getOrders()) {
      this._store.set('orders', []);
    }
  }
}

module.exports = TaxiDispatcher;