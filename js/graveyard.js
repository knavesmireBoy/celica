
	var Universe;
			(function() {
				var instance;
				Universe = function Universe() {
					if (instance) {
						return instance;
					}
					instance = this;
					// all the functionality
					this.start_time = 0;
					this.bang = "Big";
				};
			}());

function doHandler() {
	function Handler(thunk) {
		// the cached instance
		var instance;
		// rewrite the constructor
		Handler = function Handler() {
			return instance;
		};
		// carry over the prototype properties
		Handler.prototype = this;
		// the instance
		instance = new Handler();
		// reset the constructor pointer
		instance.constructor = Handler;
		// all the functionality
		instance.handler = thunk();
		return instance;
	}
	return Handler;
}

function passThru(delegatee, subject, config) {
	function includer(arr, prop) {
		return arr.indexOf(prop) !== -1;
	}

	function excluder(arr, prop) {
		return arr.indexOf(prop) === -1;
	}
	config = config || {};
	var p, delegator = {},
		factory = function(method) {
			return function() {
				return this[subject] && this[subject][method].apply(this[subject], arguments);
			};
		},
		arr = config.exclude || config.include,
		func = arr && config.exclude ? excluder : arr && config.include ? includer : function() {
			return true;
		};
	for (p in delegatee) {
		if (func(arr, p)) {
			delegator[p] = factory(p);
		}
	}
	delegator[subject] = delegatee;
	return delegator;
}



	function fixMinWidthForIE() {
		try {
			if (!document.body.currentStyle) {
				return
			} //IE only
		} catch (e) {
			return
		}
		var elems = document.getElementsByTagName("*");
		for (e = 0; e < elems.length; e++) {
			var eCurStyle = elems[e].currentStyle;
			var l_minWidth = (eCurStyle.minWidth) ? eCurStyle.minWidth : eCurStyle.getAttribute("min-width"); //IE7 : IE6
			if (l_minWidth && l_minWidth != 'auto') {
				var shim = document.createElement("DIV");
				shim.style.cssText = 'margin:0 !important; padding:0 !important; border:0 !important; line-height:0 !important; height:0 !important; BACKGROUND:RED;';
				shim.style.width = l_minWidth;
				shim.appendChild(document.createElement("&nbsp;"));
				if (elems[e].canHaveChildren) {
					elems[e].appendChild(shim);
				} else {
					//??
				}
			}
		}
	}
	//https://stackoverflow.com/questions/7715562/css-style-property-names-going-from-the-regular-version-to-the-js-property-ca    
	function cssNameToJsName(name) {
		var split = name.split("-");
		var output = "";
		for (var i = 0; i < split.length; i++) {
			if (i > 0 && split[i].length > 0 && !(i == 1 && split[i] == "ms")) {
				split[i] = split[i].substr(0, 1).toUpperCase() + split[i].substr(1);
			}
			output += split[i];
		}
		return output;
	}

	function jsNameToCssName(name) {
		return name.replace(/([A-Z])/g, "-$1").toLowerCase();
	}


	//https://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
	function isElement(obj) {
		try {
			//Using W3 DOM2 (works for FF, Opera and Chrome)
			return obj instanceof HTMLElement;
		} catch (e) {
			//Browsers not supporting W3 DOM2 don't have HTMLElement and
			//an exception is thrown and we end up here. Testing some
			//properties that all elements have (works on IE7)
			return (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.style === "object") && (typeof obj.ownerDocument === "object");
		}
	}


	//https://stackoverflow.com/questions/6472707/how-to-get-info-on-what-key-was-pressed-on-for-how-long
	/*
    var pressed = {};

window.onkeydown = function(e) {
    if ( pressed[e.which] ) return;
    pressed[e.which] = e.timeStamp;
};

window.onkeyup = function(e) {
    if ( !pressed[e.which] ) return;
    var duration = ( e.timeStamp - pressed[e.which] ) / 1000;
    // Key "e.which" was pressed for "duration" seconds
    pressed[e.which] = 0;
};
*/


	function isTouchDevice() {
		return 'ontouchstart' in window // works on most browsers 
			|| window.navigator.maxTouchPoints; // works on IE10/11 and Surface
	}

	function fnull(fun /*, defaults */ ) {
		var defaults = _.rest(arguments);
		return function( /* args */ ) {
			var args = _.map(arguments, function(e, i) {
				return existy(e) ? e : defaults[i];
			});
			return fun.apply(null, args);
		};
	}

	function defaults(d) {
		return function(o, k) {
			var val = fnull(idty, d[k]);
			return o && val(o[k]);
		};
	}

	function returnIndex(i, func) {
		return func.apply(func, _.rest(arguments, 2))[i];
	}

	function getElementElse(arg) {
		if (!getElement(arg)) {
			throw new Error();
		}
	}
    
    function spread(fn, getargs) {
		return fn.apply(null, getResult(getargs));
	}
    
    function bridge(fn1, fn2, a, b) {
		//spread would invoked to convert arguments object to positional arguments
		//useful if two functions required
		return _.partial(fn1(a), fn2(b));
	}

	/*
const curry = fn => (...args) => args.length >= fn.length
  ? fn(...args)
  : (...otherArgs) => curry(fn)(...args, ...otherArgs);
    */
	function curryLeft(fn) {
		var args = _.rest(arguments);
		if (args.length >= fn.length) {
			return fn.apply(null, args);
		} else {
			return function() {
				return curryLeft.apply(null, [fn].concat(args, _.toArray(arguments)));
			}
		}
	}


	function doObject(k, v) {
		return _.object([k], [v]);
	}

	function doArgs(o) {
		return _.pairs(o)[0]
	}

	function doArray(k, v) {
		return [k, v];
	}

	function caller(args, f) {
		return f.apply(null, args);
	}

	function stringOp(arg, o, m) {
		return o[m](arg);
	}

	function invokeBound(bound, arg) {
		return bound(arg);
	}

	function spread() {
		return _.toArray(arguments);
	}

	function curryRight(fn) {
		var args = _.rest(arguments);
		if (args.length >= fn.length) {
			return fn.apply(null, gAlp.Util.reverse(args));
		} else {
			return function() {
				return curryRight.apply(null, [fn].concat(args, gAlp.Util.reverse(arguments)));
			}
		}
	}

	function orify( /* preds */ ) {
		var preds = _.toArray(arguments);
		return function( /* args */ ) {
			var args = _.toArray(arguments);
			var something = function(ps, truth) {
				if (_.isEmpty(ps)) {
					return truth;
				} else {
					return _.some(args, _.first(ps)) || something(_.rest(ps), truth);
				}
			};
			return something(preds, false);
		};
	}

   
    function truthy(x) {
		return (x !== false) && existy(x);
	}

	function warn(thing) {
		console.log(["WARNING:", thing].join(' '));
	}

	function note(thing) {
		console.log(["NOTE:", thing].join(' '));
	}


	function repeat(times, VALUE) {
		return _.map(_.range(times), function() {
			return VALUE;
		});
	}
   
    
	function fromMethod(method, coll, it) {
		return _[method](coll, it);
	}

	function invokeThen(validate, action) {
		var args = _.rest(arguments, 2),
			res = validate.apply(this || null, args);
		return !undef(res) && action.call(this || null, res);
	}

	function ignoreArgs(n, fn) {
		var args = _.rest(arguments, n)
		return fn.apply(null, args)
	}
	//http://adripofjavascript.com/blog/drips/using-apply-to-emulate-javascripts-upcoming-spread-operator.html
	function spreadify(fn, fnThis) {
		return function( /* accepts unlimited arguments */ ) {
			// Holds the processed arguments for use by `fn`
			var i,
				spreadArgs = [],
				length = arguments.length,
				currentArg;
			for (i = 0; i < length; i++) {
				currentArg = arguments[i];
				if (Array.isArray(currentArg)) {
					spreadArgs = spreadArgs.concat(currentArg);
				} else {
					spreadArgs.push(currentArg);
				}
			}
			fn.apply(fnThis, spreadArgs);
		};
	}

    
    function doList(list){
        
        function remove(arg) {
				return _.findIndex(list, (function(cur) {
					return cur === arg;
				}));
			}
        
        function safeAddSimpleOrder(tgt){
            var i = remove(tgt);
            if(i < 0){
                list.unshift(tgt);
            }
            }
        
        function safeAddSimpleOrder(tgt){
            var i = remove(tgt);
            if(i < 0){
                list.splice(i, 1, tgt);
            }
            }
        
        
        return safeAddSimpleOrder;
    }

	function applyOn(partial, getargs, o) {
		//applies the final arguments before fulfilling the function with the supplied object
		partial.apply(null, getResult(getargs))(o);
	}

    String.prototype.mapLinktoTitle = function() {
    var getHref = curry3(simpleInvoke)(linkEx)('match'),
        s = _.compose(ptL(callWith, ''.capitalize), ptL(byIndex, 1), getHref, gAlp.Util.drillDown(['href']));
        s.call(this);
};
    
	var COR = {
		init: function (predicate, key, action) {
        //ie add,replace,remove
			this.predicate = predicate;
			this.action = action;
			this.key = key;
			return this;
		},
		setSuccessor: function (s) {
			this.successor = s;
		},
		handle: function () {
			if (this.predicate.apply(this, arguments)) {
				return this.action.apply(this, arguments);
			} else if (this.successor) {
				return this.successor.handle.apply(this.successor, arguments);
			}
		}
	};
    
    function setUp(invoke, vals) {
		var i,
			L = vals.length,
			collect = [];
		for (i = 0; i < L; i += 1) {
			collect.push(_.extend({}, COR).init(vals[i][0], vals[i][1], invoke));
			if (i) {
                collect[i - 1].setSuccessor(collect[i]);
            }
		}
		return collect[0];
	}
    
    function invoke1(ctxt, m, k, v) {
		if (k) {
			ctxt[m].call(ctxt, k, v);
		}
	}


	function constructValidate(drill, args, o) {
		var context = drill(o),
			checker = _.partial(invoke, context, _.head(args)),
			chain = setUp(checker, vals);
		_.each(_.invert(_.rest(args)[0]), chain.handle, chain);
	}


	
	(function() {
	    'use strict';
	   
	    var start,
	        end,
	        delta,
	        node = document.getElementById("aside");
	    node.addEventListener("mousedown", function() {
	        start = new Date();
	    });
	    node.addEventListener("mouseup", function() {
	        end = new Date();
	        delta = (end - start) / 1000.0;
	        ///alert("Button held for " + delta + " seconds." )
	        Len = Math.ceil(delta);
	    });
	}());
	
	function caller(f1, f2, context) {
		return f1(context).call(f2(context));
	}

               
                                try {
addMyEvent(_.partial(gAlp.Util.addHandler, 'bolt'), navigator.retreat)($('controls'));
//thumbnails.addEventListener('build', listen1.bind(thumbnails, {target: document.getElementsByTagName('img')[2]}));
thumbnailsListener.triggerEvent($('controls'), 'bolt');
}
    catch(er){
        report.innerHTML = er.message;
    }
              
    
try {
addMyEvent(_.partial(gAlp.Util.addHandler, 'build'), listen1.bind(thumbnails, {target: document.getElementsByTagName('img')[3]}))(thumbnails);
//thumbnails.addEventListener('build', listen1.bind(thumbnails, {target: document.getElementsByTagName('img')[2]}));
thumbnailsListener.triggerEvent(thumbnails, 'build');
}
    catch(er){
        report.innerHTML = er.message;
    }
  
	
	var COR = {
		init: function (predicate, key, action) {
        //ie add,replace,remove
			this.predicate = predicate;
			this.action = action;
			this.key = key;
			return this;
		},
		setSuccessor: function (s) {
			this.successor = s;
		},
		handle: function () {
			if (this.predicate.apply(this, arguments)) {
				return this.action.apply(this, arguments);
			} else if (this.successor) {
				return this.successor.handle.apply(this.successor, arguments);
			}
		}
	};
    
    function setUp(invoke, vals) {
		var i,
			L = vals.length,
			collect = [];
		for (i = 0; i < L; i += 1) {
			collect.push(_.extend({}, COR).init(vals[i][0], vals[i][1], invoke));
			if (i) {
                collect[i - 1].setSuccessor(collect[i]);
            }
		}
		return collect[0];
	}
    
    function invoke1(ctxt, m, k, v) {
		if (k) {
			ctxt[m].call(ctxt, k, v);
		}
	}


	function constructValidate(drill, args, o) {
		var context = drill(o),
			checker = _.partial(invoke, context, _.head(args)),
			chain = setUp(checker, vals);
		_.each(_.invert(_.rest(args)[0]), chain.handle, chain);
	}
   
//state pattern
  var beatles = (function(options){
            var ret = {
                state: options[0],
            states: {
                john: {
                    sing: function(){
                        return 'I Wanna'
                    }
                },
                paul: {
                    sing: function(){
                        return 'I Saw Her'
                    }
                }
            },
                swap: function(){
                    options.reverse();
                    this.state = options[0];
                },
                sing: function(){
                    console.log(this.states[this.state].sing())
                }
            };
            return ret;
        }(['john', 'paul']));

function extendFrom(sub, supa, keys, key) {
		function mapper(method) {
			if (sub[method] && _.isFunction(sub[method])) {
				supa[method] = function () {
					return supa[keys][supa[key]][method].apply(sub[key], arguments);
				};
			}
		}
		_.each(_.keys(sub), mapper);
		return supa;
	}