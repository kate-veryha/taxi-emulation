const DIRECTIONS = require('../../config/apiKeys').DIRECTIONS;
const request = require('request-promise-native');

/**
 * Returns Maps API request result
 * @param currentPoint
 * @param startPoint
 * @param endPoint
 * @returns {Promise<*>}
 */
module.exports = async function(currentPoint, startPoint, endPoint) {
  const requestOptions = {
    uri: DIRECTIONS.URL,
    qs: {
      origin: `${currentPoint[1]},${currentPoint[0]}`,
      waypoints: [`${startPoint[1]},${startPoint[0]}`],
      destination: `${endPoint[1]},${endPoint[0]}`,
      travelMode: 'driving',
      key: DIRECTIONS.API_KEY
    }
  };
  return await request(requestOptions);
};
