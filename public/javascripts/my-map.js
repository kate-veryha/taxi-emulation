function initMap() {
  // create map
  var london = new google.maps.LatLng( 51.509865, -0.118092);
  var mapOptions = {
    zoom: 12,
    center: london
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var marker, i, markerList = [];
  for (var driver of drivers) {
    i = driver.driverCount;
    var location = driver.current_position.coordinates;
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(location[1], location[0]),
      map: map,
      // custom props
      carId: i,
      status: driver.status,
      icon: '/images/car-green.png'
    });

    markerList.push(marker);

    /**
     * Listener for: display infowindow on click
     */
    google.maps.event.addListener(marker, 'click', (function(marker, i) {
      var infowindow = new google.maps.InfoWindow({content: (i+1).toString()});
      return function() {
        infowindow.open(map, marker);
      }
    })(marker, i));

    google.maps.event.addListener(marker, 'new-marker-position', (function(marker) {
      return function(data) {
        if (data.carId === marker.carId) {
          marker.setPosition(new google.maps.LatLng(data.lat, data.lng));
          marker.setIcon('/images/car-blue.png')
        }
      }
    })(marker));
  }

  window.londonMap = map;
  window.markers = markerList;
}
