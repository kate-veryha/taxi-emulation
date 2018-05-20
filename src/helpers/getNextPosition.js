/**
 * Calculate next position after <lambda> step
 * @param startPos {{lat: *, lng: *}}
 * @param endPos   {{lat: *, lng: *}}
 * @param lambda   {number}
 * @returns {{lat: *, lng: *}}
 */
module.exports = function (startPos, endPos, lambda) {
  const nextPos = (axis) => (startPos[axis] + endPos[axis] * lambda) / (1 + lambda);
  return {
    lat: nextPos('lat'),
    lng: nextPos('lng')
  }
};
