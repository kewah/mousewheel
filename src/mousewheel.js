var isSupported = require('iseventsupported'),
    ev = require('event');

var callbacks = {};

/**
 * Detect available wheel event
 * mousewheel: suppoerted by Webkit and IE
 * wheel: supported by modern browsers
 * DOMMouseScroll: supported by older Firefox versions
 */
 
var support = '';

['wheel', 'mousewheel', 'DOMMouseScroll'].forEach(function (event) {
  if(isSupported(event) && support.length === 0) support = event;
});

module.exports.support = support;

module.exports.bind = function (el, callback, capture) {
  var handle = function (e) {
    if(!e) e = window.event;
    // create a normalized event object
    var event = {};
    // keep a ref to the original event object
    event.deltaMode = e.type === 'MozMousePixelScroll' ? 0 : 1;
    event.target = e.target || e.srcElement;
    event.originalEvent = e;
    event.type = 'wheel';
    event.deltaX = 0;
    event.deltaZ = 0;
    event.preventDefault = function () {
      if(e.preventDefault) e.preventDefault();
      else e.returnValue = false;
    };
    
    // calculate deltaY (and deltaX) according to the event
    if (support === 'mousewheel') {
      // Webkit also support wheelDeltaX
      if(e.wheelDeltaX) event.deltaX = - 1/5 * e.wheelDeltaX;
      if(e.wheelDelta) event.deltaY = (e.wheelDelta > 0) ? -5 : 5;
      if(e.wheelDeltaY) event.deltaY = - 1/5 * e.wheelDeltaY;
    } else {
      event.deltaY = e.detail;
    }
    
    // it's time to fire the callback
    callback(event);
  };
  
  // handle MozMousePixelScroll in older Firefox
  if(support === 'DOMMouseScroll') ev.bind(el, 'MozMousePixelScroll', callback, capture || false);
  ev.bind(el, support, support === 'wheel' ? callback : handle, capture || false);
  callbacks[callback] = handle;
};

module.exports.unbind = function (el, callback, capture) {
  if(!callbacks[callback]) return;
  if(support === 'DOMMouseScroll') ev.unbind(el, 'MozMousePixelScroll', callback, capture);
  ev.unbind(el, support, support === 'wheel' ? callback : callbacks[callback], capture);
  delete callbacks[callback];
};
