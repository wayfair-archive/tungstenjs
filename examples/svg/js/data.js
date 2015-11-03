(function() {
  function getTicks(numTicks) {
    var ticks = new Array(numTicks);
    for (var i = numTicks; i--;) {
      ticks[i] = {
        rotation: 360 * i / numTicks
      };
    }
    return ticks;
  }

  var datetime = new Date();
  var clock = {
    major: getTicks(12),
    minor: getTicks(60),
    datetime: new Date(),
    hourRotation: function() {
      var datetime = this.get ? this.get('datetime') : new Date();
      return 30 * datetime.getHours() + datetime.getMinutes() / 2;
    },
    minuteRotation: function() {
      var datetime = this.get ? this.get('datetime') : new Date();
      return 6 * datetime.getMinutes() + datetime.getSeconds() / 10;
    },
    secondRotation: function() {
      var datetime = this.get ? this.get('datetime') : new Date();
      return 6 * datetime.getSeconds();
    },
    formattedDay: function() {
      var datetime = this.get ? this.get('datetime') : new Date();
      return moment(datetime).format('dddd MMMM Do YYYY');
    },
    formattedTime: function() {
      var datetime = this.get ? this.get('datetime') : new Date();
      return moment(datetime).format('h:mm:ss a')
    }
  };

  /*******************************************************************/

  function linearScale ( domain, range ) {
    var d0 = domain[0], r0 = range[0], multipler = ( range[1] - r0 ) / ( domain[1] - d0 );

    return function ( num ) {
      return r0 + ( ( num - d0 ) * multipler );
    };
  }

  var xScale = linearScale([ 0, 12 ], [ 0, 1000 ]);
  var yScale = linearScale([ -10, 42 ], [ 400 - 20, 25 ]);

  function formatTemperature(val, type) {
    if ( type === 'fahrenheit' ) {
      // convert celsius to fahrenheit
      val = (val * 1.8) + 32;
    }

    return val.toFixed(1) + '°';
  }

  function formatTemperatures(cityTemperatures, type) {
    var temperatures = new Array(cityTemperatures.length);
    for (var i = 0; i < temperatures.length; i++) {
      var temp = cityTemperatures[i];
      temperatures[i] = {
        xPos: xScale(i + 0.5),
        low: {
          yPos: yScale(temp.low),
          label: formatTemperature(temp.low, type)
        },
        high: {
          yPos: yScale(temp.high),
          label: formatTemperature(temp.high, type)
        }
      }
    }
    return temperatures;
  }

  function plotPoints (points) {
    var result = points.map( function ( point, i ) {
      return xScale( i + 0.5 ) + ',' + yScale( point );
    });

    // add the december value in front of january, and the january value after
    // december, to show the cyclicality
    result.unshift( xScale( -0.5 ) + ',' + yScale( points[ points.length - 1 ] ) );
    result.push( xScale( points.length + 0.5 ) + ',' + yScale( points[0] ) );

    return result;
  }

  function getHighPoint ( month ) { return month.high; }
  function getLowPoint ( month ) { return month.low; }
  function formatPoints(temperatures) {
    var high = plotPoints( temperatures.map( getHighPoint ) );
    var low = plotPoints( temperatures.map( getLowPoint ) );

    return high.concat( low.reverse() ).join( ' ' );
  }

  var monthNames = [ 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D' ];
  var chart = {
    monthNames: monthNames,
    monthWidth: 1000 / monthNames.length,
    freezing: {
      xPos: xScale(6),
      yPos: yScale(0)
    },
    cities: [
      { name: 'London, UK', temperatures: [{ high: 7.9, low: 2.4 }, { high: 8.2, low: 2.2 }, { high: 10.9, low: 3.8 }, { high: 13.3, low: 5.2 }, { high: 17.2, low: 8 }, { high: 20.2, low: 11.1 }, { high: 22.8, low: 13.6 }, { high: 22.6, low: 13.3 }, { high: 19.3, low: 10.9 }, { high: 15.2, low: 8 }, { high: 10.9, low: 4.8 }, { high: 8.8, low: 3.3 }] },
      { name: 'San Francisco, CA, US', temperatures: [{ high: 13.8, low: 7.6 }, { high: 15.7, low: 8.6 }, { high: 16.6, low: 9.2 }, { high: 17.3, low: 9.6 }, { high: 17.9, low: 10.6 }, { high: 19.1, low: 11.6 }, { high: 19.2, low: 12.3 }, { high: 20.1, low: 12.8 }, { high: 21.2, low: 12.8 }, { high: 20.7, low: 12.1 }, { high: 17.3, low: 10.1 }, { high: 13.9, low: 7.8 } ] },
      { name: 'Phoenix, AZ, US', temperatures: [{ high: 19.7, low: 7.6 }, { high: 21.6, low: 9.3 }, { high: 25.1, low: 11.9 }, { high: 29.7, low: 15.7 }, { high: 35, low: 20.7 }, { high: 40.1, low: 25.4 }, { high: 41.2, low: 28.6 }, { high: 40.3, low: 28.2 }, { high: 37.8, low: 24.9 }, { high: 31.5, low: 18.2 }, { high: 24.3, low: 11.4 }, { high: 19, low: 7.1 } ] },
      { name: 'New York City, NY, US', temperatures: [{ high: 3.5, low: -2.8 }, { high: 5.3, low: -1.7 }, { high: 9.8, low: 1.8 }, { high: 16.2, low: 7.1 }, { high: 21.6, low: 12.2 }, { high: 26.3, low: 17.6 }, { high: 28.9, low: 20.5 }, { high: 28.1, low: 19.9 }, { high: 24, low: 16 }, { high: 17.7, low: 10 }, { high: 12.1, low: 5.3 }, { high: 6.1, low: 0 } ] },
      { name: 'Buenos Aires, Argentina', temperatures: [{ high: 30.4, low: 20.4 }, { high: 28.7, low: 19.4 }, { high: 26.4, low: 17 }, { high: 22.7, low: 13.7 }, { high: 19, low: 10.3 }, { high: 15.6, low: 7.6 }, { high: 13.9, low: 7.4 }, { high: 17.3, low: 8.9 }, { high: 18.9, low: 9.9 }, { high: 22.5, low: 13 }, { high: 25.3, low: 15.9 }, { high: 28.1, low: 18.4 } ] },
      { name: 'Sydney, Australia', temperatures: [{ high: 25.9, low: 18.7 }, { high: 25.8, low: 18.8 }, { high: 24.7, low: 17.5 }, { high: 22.4, low: 14.7 }, { high: 19.4, low: 11.5 }, { high: 16.9, low: 9.3 }, { high: 16.3, low: 8 }, { high: 17.8, low: 8.9 }, { high: 20, low: 11.1 }, { high: 22.1, low: 13.5 }, { high: 23.6, low: 15.6 }, { high: 25.2, low: 17.5 } ] },
      { name: 'Moscow, Russia', temperatures: [{ high: -4, low: -9.1 }, { high: -3.7, low: -9.8 }, { high: 2.6, low: -4.4 }, { high: 11.3, low: 2.2 }, { high: 18.6, low: 7.7 }, { high: 22, low: 12.1 }, { high: 24.3, low: 14.4 }, { high: 21.9, low: 12.5 }, { high: 15.7, low: 7.4 }, { high: 8.7, low: 2.7 }, { high: 0.9, low: -3.3 }, { high: -3, low: -7.6 } ] },
      { name: 'Berlin, Germany', temperatures: [{ high: 2.9, low: -1.5 }, { high: 4.2, low: -1.6 }, { high: 8.5, low: 1.3 }, { high: 13.2, low: 4.2 }, { high: 18.9, low: 9 }, { high: 21.8, low: 12.3 }, { high: 24, low: 14.7 }, { high: 23.6, low: 14.1 }, { high: 18.8, low: 10.6 }, { high: 13.4, low: 6.4 }, { high: 7.1, low: 2.2 }, { high: 4.4, low: -0.4 } ] },
      { name: 'Beijing, China', temperatures: [{ high: 1.8, low: -8.4 }, { high: 5, low: -5.6 }, { high: 11.6, low: 0.4 }, { high: 20.3, low: 7.9 }, { high: 26, low: 13.6 }, { high: 30.2, low: 18.8 }, { high: 30.9, low: 22 }, { high: 29.7, low: 20.8 }, { high: 25.8, low: 14.8 }, { high: 19.1, low: 7.9 }, { high: 10.1, low: 0 }, { high: 3.7, low: -5.8 } ] },
      { name: 'Nairobi, Kenya', temperatures: [{ high: 24.5, low: 11.5 }, { high: 25.6, low: 11.6 }, { high: 25.6, low: 13.1 }, { high: 24.1, low: 14 }, { high: 22.6, low: 13.2 }, { high: 21.5, low: 11 }, { high: 20.6, low: 10.1 }, { high: 21.4, low: 10.2 }, { high: 23.7, low: 10.5 }, { high: 24.7, low: 12.5 }, { high: 23.1, low: 13.1 }, { high: 23.4, low: 12.6 } ] }
    ],
    selectedCityIndex: 0,
    degreeType: 'celcius',
    getCity: function(temperatures, type) {
      return {
        temperatures: formatTemperatures(temperatures, type),
        points: formatPoints(temperatures, type)
      };
    }
  };

  var active = chart.getCity(chart.cities[chart.selectedCityIndex].temperatures, chart.degreeType);
  chart.temperatures = active.temperatures;
  chart.points = active.points;
  console.log(active);

  var data = {
    clock: clock,
    chart: chart
  }
  if (typeof window === 'undefined') {
    global.moment = require('moment');
    module.exports = data;
  } else {
    window.data = data;
  }
}());
