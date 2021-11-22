/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global _: false */
if (!window.gAlp) {
	window.gAlp = {};
}
window.gAlp.Eventing = (function (eventing) {
	"use strict";
    function noOp() {
		return function () {};
	}
	////$element.triggerEvent($element.getElement(), 'scroll');
	function triggerEvent(el, type, x) {
		var e;
		if ('createEvent' in document) {
       // if (document.hasOwnProperty('createEvent')) {
			// modern browsers, IE9+
			e = document.createEvent('HTMLEvents');
			e.initEvent(type, false, true);
			el.dispatchEvent(e);
		} else {
			// IE 8
			e = document.createEventObject();
			e.eventType = type;
			el.fireEvent('on' + e.eventType, e);
		}
	}

	function mapper(src, tgt, method) {
		if (src[method] && _.isFunction(src[method])) {
			tgt[method] = function () {
				return src[method].apply(src, arguments);
			};
		}
	}

	function isfunc(fn, context) {
		//return _.isFunction(fn) || context && isfunc(context[fn]) || context && isfunc(fn[context]);
		return _.isFunction(fn);
	}

	function isElement(el) {
		return _.isElement(el) || el === window;
	}

	function sortArgs(fn, el, context) {
		var f = isfunc(fn, context) ? fn : el,
			element = isElement(el) ? el : fn;
		return {
			func: f,
			element: element
		};
	}
	var count = 0,
		EventCache = (function (list) {
			var remove = function (coll, arg) {
					var res = _.findIndex(coll, function (cur) {
						return cur === arg;
					});
					if (res !== -1) {
						//be AWARE -1 can be used by splice...
						return res;
					}
				},
				safeAddSimple = function (tgt) {
					list = _.filter(list, function (item) {
						return item !== tgt;
					});
					list.unshift(tgt);
				},
				safeAddSimpleOrder = function (tgt) {
					var i = remove(list, tgt);
					if (i < 0) {
						list.unshift(tgt);
					}
				},
				getList = function () {
					return list;
				};
			return {
				listEvents: function () {
					return list;
				},
				add: function (o) {
                    if (o) {
                        list.unshift(o);
                    }
				},
				add2: safeAddSimple,
				flush: function () {
					var i;
					for (i = list.length - 1; i >= 0; i = i - 1) {
						list[i].removeListener();
					}
					list = [];
				},
				get: function (i) {
					return _.isNumber(i) ? list[i] : _.isBoolean(i) && !i ? list[list.length - 1] : list;
				},
				//rem: _.compose(curry2(splice)(0), curry2(isfound)(Infinity), _.partial(remove, list)),
				//remove: _.compose(curry2(splice)(1), curry2(isfound)(0), _.partial(remove, list)),
				deleteListeners: function (arg) {
					var list = getList(),
						item,
						n;
					if (arg && _.isObject(arg)) {
						n = remove(list, arg);
						if (!isNaN(n)) {
							item = list.splice(n, 1)[0];
                            if (item) {
                                item.removeListener();
                            }
						}
					} else if (!isNaN(arg)) {
						try {
							item = list.splice.apply(list, arguments)[0];
                            if (item) {
                                item.removeListener();
                            }
						} catch (e) {
							noOp();
						}
					}
					list = getList();
					//console.log('ev2', list[0].el, list[list.length-1].el)
				},
				getEventObject: function (e) {
					return e || window.event;
				},
				prevent: function (e) {
					e.preventDefault();
					e = this.getEventObject(e);
					if (e && e.preventDefault) {
						e.preventDefault();
						e.stopPropagation();
					} else {
						e.returnValue = false;
						e.cancelBubble = true;
					}
				},
				getEventTarget: function (e) {
					e = this.getEventObject(e);
					return e.target || e.srcElement;
				},
				triggerEvent: triggerEvent
			};
		}([]));
	if (window.addEventListener) {
		eventing.init = function (type, el, fn, context) {
			//var inta = new gAlp.Intaface('Element', ['setAttribute']);
			//gAlp.Intaface.ensures(config.element, inta);
			var config = sortArgs(fn, el, context),
				bound;
			this.addListener = function (el) {
				bound = el ? _.bind(config.func, el) : config.func;
				config.element.addEventListener(type, bound, false);
				EventCache.add(this);
				return this;
			};
			this.removeListener = function () {
				config.element.removeEventListener(type, bound, false);
				return this;
			};
			this.getElement = function () {
				return config.element;
			};
			_.each(['prevent', 'deleteListeners', 'flush', 'listEvents', 'triggerEvent'], _.partial(mapper, EventCache, this));
			this.el = config.element + '_' + window.gAlp.Eventing.listEvents().length + '_' + (count += 1) + '__' + config.element.id;
			return _.extendOwn({}, this);
		};
	} else if (document.attachEvent) { // IE
		//window.onload = function (){alert(9);}
    
		eventing.init = function (type, el, fn, context) {
			var config = sortArgs(fn, el, context),
				bound;
			this.addListener = function (el) {
				bound = el ? _.bind(config.func, el) : config.func;
				EventCache.add(this);
				config.element.attachEvent('on' + type, bound);
				return this;
			};
			this.removeListener = function () {
				el.detachEvent('on' + type, fn);
				return this;
			};
			this.getElement = function () {
				return config.element;
			};
            this.el = config.element + '_' + (count += 1);
			_.each(['prevent', 'deleteListeners', 'flush', 'listEvents', 'triggerEvent'], _.partial(mapper, EventCache, this));
			return _.extendOwn({}, this);
		};
	} else { // older browsers
		eventing.init = function (type, el, fn, context) {
			var config = sortArgs(fn, el, context),
				bound;
			this.addListener = function (el) {
				bound = el ? _.bind(config.func, el) : config.func;
				EventCache.add(this);
				el['on' + type] = bound;
				return this;
			};
			this.removeListener = function () {
				el['on' + type] = null;
				return this;
			};
			this.getElement = function () {
				return config.element;
			};
			this.el = config.element + '_' + (count += 1);
			_.each(['prevent', 'deleteListeners', 'flush', 'listEvents', 'triggerEvent'], _.partial(mapper, EventCache, this));
			return _.extendOwn({}, this);
		};
	}
	return eventing;
}({}));