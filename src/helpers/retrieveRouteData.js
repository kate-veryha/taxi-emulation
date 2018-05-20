const interval = require('../../config/requestConfig').interval / 1000;

/**
 * Extends route data with some helpful info
 * @param distance {number}       Length in meters
 * @param duration {number}     Time in seconds
 * @param interval {number}     Time interval between position changes
 * @returns {{lengthDelta: number, sectionCount: number, lambda: number}}
 */
function getHelperDataForStep(distance, duration, interval) {
  let sectionCount, lengthDelta;
  if (duration <= interval) {
    lengthDelta = distance;
    sectionCount = 1;
  } else {
    const avgSpeed = distance / duration;
    lengthDelta = avgSpeed * interval;
    sectionCount = Math.round(distance / lengthDelta);
  }

  return {
    lengthDelta,
    sectionCount,
    lambda: 1 / sectionCount,
    currentSection: null
  }
}

function extendRouteData(routeData) {
  let extractedInfo = {
    steps: {
      count: routeData.steps.length,
      currentStep: null,
      items: []
    }
  };
  for (let step of routeData.steps) {
    extractedInfo.steps.items.push({
      ...step,
      ...getHelperDataForStep(step.distance.value, step.duration.value, interval)
    });
  }
  return extractedInfo;
}

/**
 * Counts next section and step if needed for route
 * @param extendedRouteData
 * @returns {object}
 */
function countNextSection(extendedRouteData) {
  const {currentStep} = extendedRouteData.steps;
  let routeDataCopy = JSON.parse(JSON.stringify(extendedRouteData));

  if (currentStep === null) {
    routeDataCopy.steps.currentStep = 0;
    routeDataCopy.steps.items[0].currentSection = 0;
  } else {
    const currentStepData = extendedRouteData.steps.items[currentStep];

    if (currentStepData.currentSection < currentStepData.sectionCount - 1) {

      ++routeDataCopy.steps.items[currentStep].currentSection;
    } else {
      routeDataCopy.steps.items[currentStep].currentSection = null;

      ++routeDataCopy.steps.currentStep;
      routeDataCopy.steps.items[currentStep].currentSection = 0;
    }
  }

  return routeDataCopy;
}

/**
 * Calculate next position after <lambda> step
 * @param startPos {{lat: *, lng: *}}
 * @param endPos   {{lat: *, lng: *}}
 * @param lambda   {number}
 * @returns {{lat: *, lng: *}}
 */
function countNextLocation(startPos, endPos, lambda) {
  const nextPos = (axis) => (startPos[axis] + endPos[axis] * lambda) / (1 + lambda);
  return {
    lat: nextPos('lat'),
    lng: nextPos('lng')
  }
}

module.exports = {
  extendRouteData,
  countNextSection,
  countNextLocation
};