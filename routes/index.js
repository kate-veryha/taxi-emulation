const express = require('express');
const router = express.Router();
const apiKey = require('../config/apiKeys').MAPS_API_KEY;
const TaxiDispatcher = require('../src/TaxiDispatcher');

/* GET home page. */
/**
 * Yep it takes a lot of time to load page =(
 */
router.get('/', async function(req, res, next) {
  const taxiDispatcher = new TaxiDispatcher(req.connection);
  /**
   * Get results from google api and save to store
   */
  try {
    await taxiDispatcher.initTaxiPark();

    //await taxiDispatcher.initOrder();
  } catch (err) {
    console.error(err.stack);
  }


  res.render('index', {
    title: 'Lab 3',
    url: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`,
    drivers: JSON.stringify(taxiDispatcher.getDrivers())
  });
});

module.exports = router;
