/**
 * Touch events - Convenience wrappers around swipe, tap, and dbltap events
 *
 * Forked from tocca@0.1.3 by Gianluca Guarini
 * @license MIT
 * @source https://github.com/GianlucaGuarini/Tocca.js
 *
 * (MIT LICENSE)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

if (typeof document.createEvent === 'function') {
  // some helpers borrowed from https://github.com/WebReflection/ie-touch
  var msEventType = function(type) {
    var lo = type.toLowerCase(),
      ms = 'MS' + type;
    return navigator.msPointerEnabled ? ms : lo;
  };
  var touchevents = {
    touchstart: msEventType('PointerDown') + ' touchstart',
    touchend: msEventType('PointerUp') + ' touchend',
    touchmove: msEventType('PointerMove') + ' touchmove'
  };

  // minimum distance moved to trigger a swipe event
  var swipeThreshold = window.SWIPE_THRESHOLD || 100;
  // range of time where a tap event could be detected
  var tapThreshold = window.TAP_THRESHOLD || 150;
  // delay needed to detect a double tap
  var dbltapThreshold = window.DBL_TAP_THRESHOLD || 200;
  // touch events boundaries ( 60px by default )
  var tapPrecision = window.TAP_PRECISION / 2 || 60 / 2;
  // @todo make more consistent with other handlers
  var justTouchEvents = true;
  var tapNum = 0;
  var currX, currY, cachedX, cachedY, tapTimer, timestamp;

  var setListener = function(events, callback) {
    var eventsArray = events.split(' '),
      i = eventsArray.length;

    while (i--) {
      document.addEventListener(eventsArray[i], callback, false);
    }
  };
  var getPointerEvent = function(event) {
    return event.targetTouches ? event.targetTouches[0] : event;
  };
  var getTimestamp = function() {
    return new Date().getTime();
  };
  var sendEvent = function(elm, eventName, originalEvent, data) {
    var customEvent = document.createEvent('Event');
    data = data || {};
    data.x = currX;
    data.y = currY;
    data.distance = data.distance;
    customEvent.originalEvent = originalEvent;
    for (var key in data) {
      customEvent[key] = data[key];
    }
    customEvent.initEvent(eventName, true, true);
    elm.dispatchEvent(customEvent);
  };

  var onTouchStart = function(e) {
    var pointer = getPointerEvent(e);
    // caching the current x
    cachedX = currX = pointer.pageX;
    // caching the current y
    cachedY = currY = pointer.pageY;

    timestamp = getTimestamp();
    tapNum++;
    // we will use these variables on the touchend events
  };
  var onTouchEnd = function(e) {
    var eventsArr = [],
      deltaY = cachedY - currY,
      deltaX = cachedX - currX;

    // clear the previous timer in case it was set
    clearTimeout(tapTimer);
    if (deltaX <= -swipeThreshold) {
      eventsArr.push('swiperight');
    }

    if (deltaX >= swipeThreshold) {
      eventsArr.push('swipeleft');
    }

    if (deltaY <= -swipeThreshold) {
      eventsArr.push('swipedown');
    }

    if (deltaY >= swipeThreshold) {
      eventsArr.push('swipeup');
    }
    var eventsArrLength = eventsArr.length;
    if (eventsArrLength) {
      for (var i = 0; i < eventsArrLength; i++) {
        var eventName = eventsArr[i];
        sendEvent(e.target, eventName, e, {
          distance: {
            x: Math.abs(deltaX),
            y: Math.abs(deltaY)
          }
        });
      }
    } else {

      if (
        (timestamp + tapThreshold) - getTimestamp() >= 0 &&
        cachedX >= currX - tapPrecision &&
        cachedX <= currX + tapPrecision &&
        cachedY >= currY - tapPrecision &&
        cachedY <= currY + tapPrecision
      ) {
        // Here you get the Tap event
        sendEvent(e.target, (tapNum === 2) ? 'dbltap' : 'tap', e);
      }

      // reset the tap counter
      tapTimer = setTimeout(function() {
        tapNum = 0;
      }, dbltapThreshold);

    }
  };
  var onTouchMove = function(e) {
    var pointer = getPointerEvent(e);
    currX = pointer.pageX;
    currY = pointer.pageY;
  };

  // setting the events listeners
  setListener(touchevents.touchstart + (justTouchEvents ? '' : ' mousedown'), onTouchStart);
  setListener(touchevents.touchend + (justTouchEvents ? '' : ' mouseup'), onTouchEnd);
  setListener(touchevents.touchmove + (justTouchEvents ? '' : ' mousemove'), onTouchMove);

}

// Export an empty function to conform to the plugin API
module.exports = function() {};
