/*jslint browser: true*/
/*global window: false */
/*global document: false */
/*global setTimeout: false */
/*global clearTimeout: false */
/*global Modernizr: false */
/*global gAlp: false */
if (!window.gAlp) {
	window.gAlp = {};
}
/**
 * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
 * on host objects like NamedNodeMap, NodeList, and HTMLCollection
 * (technically, since host objects have been implementation-dependent,
 * at least before ES2015, IE hasn't needed to work this way).
 * Also works on strings, fixes IE < 9 to allow an explicit undefined
 * for the 2nd argument (as in Firefox), and prevents errors when
 * called on other DOM objects.
 */
(function () {
	'use strict';
	var slice = Array.prototype.slice;
	try {
		// Can't be used with DOM elements in IE < 9
		slice.call(document.documentElement);
	} catch (e) { // Fails in IE < 9
		//AJS// gAlp.shim indicates IE < 9; could test for attachEvent
		gAlp.slice_shim = true;
		gAlp.clone = function (object) {
			function F() {}
			F.prototype = object || F.prototype;
			F.prototype.constructor = F;
			return new F();
		};
		// This will work for genuine arrays, array-like objects, 
		// NamedNodeMap (attributes, entities, notations),
		// NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
		// and will not fail on other DOM objects (as do DOM elements in IE < 9)
		Array.prototype.slice = function (begin, end) {
			// IE < 9 gets unhappy with an undefined end argument
			end = (typeof end !== 'undefined') ? end : this.length;
			// For native Array objects, we use the native slice function
			if (Object.prototype.toString.call(this) === '[object Array]') {
				return slice.call(this, begin, end);
			}
			// For array like object we handle it ourselves.
			var i, cloned = [],
				size, len = this.length,
				start, upTo;
			// Handle negative value for "begin"
			start = begin || 0;
			start = (start >= 0) ? start : Math.max(0, len + start);
			// Handle negative value for "end"
			upTo = (typeof end === 'number') ? Math.min(end, len) : len;
			if (end < 0) {
				upTo = len + end;
			}
			// Actual expected size of the slice
			size = upTo - start;
			if (size > 0) {
				cloned = new Array(size);
				//cloned = [size];
				if (this.charAt) {
					for (i = 0; i < size; i += 1) {
						cloned[i] = this.charAt(start + i);
					}
				} else {
					for (i = 0; i < size; i += 1) {
						cloned[i] = this[start + i];
					}
				}
			}
			return cloned;
		};
	}
}());
if (!Array.prototype.push) {
	Array.prototype.push = function () {
		"use strict";
		var i, L;
		for (i = this.length, L = arguments.length; i < L; i += 1) {
			this[i] = arguments[i];
		}
	};
}
if (!Array.prototype.pop) {
	Array.prototype.pop = function () {
		"use strict";
		var n = this.length - 1,
			item = this[n];
		this.length = n;
		return item;
	};
}

if (!Array.prototype.indexOf)
  Array.prototype.indexOf = (function(Object, max, min) {
    "use strict"
    return function indexOf(member, fromIndex) {
      if (this === null || this === undefined)
        throw TypeError("Array.prototype.indexOf called on null or undefined")

      var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len)
      if (i < 0) i = max(0, Len + i)
      else if (i >= Len) return -1

      if (member === void 0) {        // undefined
        for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i
      } else if (member !== member) { // NaN
        return -1 // Since NaN !== NaN, it will never be found. Fast-path it.
      } else                          // all else
        for (; i !== Len; ++i) if (that[i] === member) return i

      return -1 // if the value was not found, then return -1
    }
  })(Object, Math.max, Math.min)


window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
	"use strict";
	//return window.setTimeout(f, (1000 / 60));
	return window.setTimeout(f, 16.666);
}; // simulate calling code 60 
window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || function (requestID) {
	"use strict";
	window.clearTimeout(requestID);
}; //fall back
window.dispatchEvent = window.dispatchEvent || window.fireEvent;
if (!String.prototype.trim) {
	String.prototype.trim = function () {
        "use strict";
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}
String.prototype.sansNumber = function () {
	"use strict";
	var str = '',
		n = parseFloat(this),
		i = !isNaN(n) ? str + n : 0;
	return this.substring(i.length);
};
String.prototype.isUpper = function () {
	"use strict";
	return this.toString() === this.toUpperCase();
};
String.prototype.bloated = function () {
	"use strict";
	var str = this.toString();
	return Number(str.length - str.trim().length);
};
String.prototype.abbreviate = function (token) {
	"use strict";
	var split = this.split(token || " "),
		res = '',
		i = 0;
	while (split[i]) {
		res += split[i].charAt(0).toUpperCase();
		i += 1;
	}
	return res;
};
String.prototype.honor = function () {
	"use strict";
	var str;
	if (this.constructor.prototype.saved) {
		str = this.constructor.prototype.saved.join(' ');
		this.constructor.prototype.saved = null;
	} else {
		this.constructor.prototype.saved = this.split(' ');
		str = this.constructor.prototype.saved[1];
	}
	return str;
};
String.prototype.toCamelCase = function (char) {
    "use strict";
	var reg = new RegExp(char + "([a-z])", 'g');
	return this.replace(reg, function (match, captured) {
		return captured.toUpperCase();
	});
};
String.prototype.honorific = function (h) {
	"use strict";
	return h + ' ' + this;
};
if (typeof Function.prototype.method === 'undefined') {
	Function.prototype.method = function (name, func) {
		"use strict";
		this.prototype[name] = func;
		return this;
	};
}
if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function (context) {
		"use strict";
		var fn = this,
			slice = Array.prototype.slice,
			args = slice.call(arguments, 1);
		return function () {
			return fn.apply(context, args.concat(slice.call(arguments)));
		};
	};
}
if (typeof Function.prototype.wrap === 'undefined') {
	//WORKHORSE
	Function.prototype.wrap = function (wrapper, options) {
        "use strict";
		var method = this;
		return function () {
			var args = [],
				L = arguments.length,
				i;
			/* options could be provided when wrap is first invoked
			OR when the returned function is invoked where it would be args[0] below
			wrapper expects at least (method), maybe (method, options) maybe (method, options, ...rest)
			if options is pre-supplied rest[0] is args[0] below otherwise rest[0] === options in (method, options)
			*/
			if (options) {
				args.push(options);
			}
			for (i = 0; i < L; i += 1) {
				args.push(arguments[i]);
			}
			if (wrapper) {
				return wrapper.apply(this, [method.bind(this)].concat(args));
			}
		};
	};
}

/*
function ieOpacity(v) {
    "use strict";
	this['-ms-filter'] = 'progid:DXImageTransform.Microsoft.Alpha=' + (v * 100) + ')';
	this.filter = 'alpha(opacity=' + (v * 100) + ')';
	return this;
}
*/

function getNativeOpacity(bool) {
    "use strict";
	return function (v) {
		return {
			getKey: function () {
				return bool ? 'filter' : Modernizr.prefixedCSS('opacity');
			},
			getValue: function (val) {
				var IE6,
                    value = val || v;
				//return bool ? 'alpha(opacity=' + value + ')' : (value / 100)+'';
                return bool ? 'alpha(opacity=' + val * 100 + ')' : val.toString();
                /*
                try {
                    IE6=@cc_on @_jscript_version <= 5.7 && @_jscript_build < 10000;
                } catch(e){
                   IE6=false;
                }
                */

			}
		};
	};
}
gAlp.getOpacity = getNativeOpacity(gAlp.slice_shim);

if (typeof Object.getPrototypeOf !== "function") {
	if (typeof "test".__proto__ === "object") {
		Object.getPrototypeOf = function (object) {
			return object.__proto__;
		};
	} else {
		Object.getPrototypeOf = function (object) {
			// May break if the constructor has been tampered with
			return object.constructor.prototype;
		};
	}
}