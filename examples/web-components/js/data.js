(function() {
  var data = {
    'selectedCity': {
      name: 'Boston',
      latitude: '42.3581',
      longitude: '-71.0636',
      zoom: 10
    },
    'cities': [{
      name: 'Boston',
      latitude: '42.3581',
      longitude: '-71.0636',
      zoom: 10
    }, {
      name: 'New York City',
      latitude: '40.7127',
      longitude: '-74.0059',
      zoom: 10
    },
      {
        name: 'Chicago',
        latitude: '41.8369',
        longitude: '-87.6847',
        zoom: 10
      }, {
        name: 'Cincinnati',
        latitude: '39.1000',
        longitude: '-84.5167',
        zoom: 10
      }, {
        name: 'St. Louis',
        latitude: '38.6272',
        longitude: '-90.1978',
        zoom: 10
      }, {
        name: 'Pittsburgh',
        latitude: '40.4417',
        longitude: '-80.0000',
        zoom: 10
      }, {
        name: 'New Orleans',
        latitude: '29.9667',
        longitude: '-90.0500',
        zoom: 10
      }, {
        name: 'Austin',
        latitude: '30.2500',
        longitude: '-97.7500',
        zoom: 10
      }, {
        name: 'San Francisco',
        latitude: '37.7833',
        longitude: '-122.4167',
        zoom: 10
      }, {
        name: 'Portland',
        latitude: '45.5200',
        longitude: '-122.6819',
        zoom: 10
      }, {
        name: 'Honolulu',
        latitude: '21.3000',
        longitude: '-157.8167',
        zoom: 10
      }]
  };
  if (typeof window === 'undefined') {
    module.exports = data;
  } else {
    window.data = data;
  }
}());