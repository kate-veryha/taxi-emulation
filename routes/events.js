const express = require('express');
const getConnection = require('../src/db/getConnection');
const router = express.Router();
const SSE = require('../src/SSE');
const TaxiDispatcher = require('../src/TaxiDispatcher');
const interval = require('../config/requestConfig').interval;

const sse = new SSE([]);

router.get('/', sse.init);

setInterval(() => {
  const taxiDispatcher = new TaxiDispatcher();

  const driving = taxiDispatcher.getDrivers()
    .filter(d => d.status === 'DRIVING');

  if (driving.length) {
    for (const driver of driving) {
      const {lat, lng} = taxiDispatcher.getNextLocation(driver._id);
      sse.send({lat, lng, carId: driver.driverCount }, 'newPosition')
    }

  }

}, interval);


setInterval(async () => {
  const taxiDispatcher = new TaxiDispatcher(await getConnection());

  await taxiDispatcher.initOrder();
}, 60 * 1000);

module.exports = router;