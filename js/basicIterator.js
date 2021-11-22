/*jslint nomen: true */
/*global window: false */
/*global gAlp: false */
/*global _: false */
if (!window.gAlp) {
	window.gAlp = {};
}
gAlp.Iterator = function (rev) {
	"use strict";
	return function (index, coll, validate, doAdvance) {
		var loop = function (bool) {
				if (!bool) {
					index = gAlp.Util.doWhen(validate, _.partial(doAdvance, index += 1));
				}
				//document.getElementsByTagName('h2')[0].innerHTML = index;
				return index;
			},
			switchDirection = function () {
				//console.log('sw..')
				coll = gAlp.Util.reverse(coll);
				//coll.reverse();
				index = coll.length - 1 - index;
				rev = !rev;
			},
			isReversed = function () {
				return (rev === true);
			},
			getnext = function (isRev, bool) {
				//console.log('next..', isRev())
				gAlp.Util.doWhen(isRev(), switchDirection);
				return coll[loop(bool)];
			},
			getNow = function (bool) {
				return coll[loop(bool)];
			},
			forward = _.partial(getnext, isReversed),
			back = _.partial(getnext, _.negate(isReversed)),
			invoke = function (bool) {
				//console.log('invoke..')
				return gAlp.Util.getBest(isReversed, [_.bind(back, null, bool), _.bind(forward, null, bool)])();
			},
			ret = {
				forward: forward,
				back: back,
				getCurrent: _.partial(getNow, true),
				getNext: invoke,
				getIndex: function () {
					return index;
				},
				setIndex: function (i) {
					index = i;
				},
				getLength: function () {
					return coll.length;
				},
				getCollection: function () {
					return coll;
				}
			};
		if (rev) {
			switchDirection();
		}
		return ret;
	};
};
gAlp.Composite = (function () {
	"use strict";

	function noOp() {}

	function isFalse(i) {
		return !i && _.isBoolean(i);
	}

	function isTrue(i) {
		return i && _.isBoolean(i);
	}
	return function (included) {
		var intafaces = _.rest(arguments),
			/*, intafaces..*/
			j,
			k,
			comp_intaface = gAlp.Intaface('Composite', ['add', 'remove', 'get', 'find']),
			leaf = {
				add: noOp,
				remove: noOp,
				get: noOp,
				find: noOp,
				render: noOp,
				unrender: noOp
			},
			composite,
			tmp,
			comp_add = function (comp) {
				intafaces.unshift(comp);
				gAlp.Intaface.ensures.apply(gAlp.Intaface, intafaces);
				included.push(intafaces.shift(comp));
				comp.parent = this;
			},
			comp_remove = function (comp) {
				if (!comp) {
					_.each(included, function (comp) {
						comp.remove();
					});
					included = [];
					return this;
				} else {
					included = _.filter(included, function (n_comp) {
						if (n_comp !== comp) {
							return n_comp;
						}
					});
					return comp;
				}
			},
			comp_get = function (i) {
				//console.log('recent', i)
				if (_.isNull(i) && !isNaN(parseFloat(k))) {
					return included[k];
				}
				if (_.isNull(i)) {
					return included;
				}
				var j = isTrue(i) ? 0 : isFalse(i) ? included.length - 1 : !isNaN(parseFloat(i)) ? i : undefined,
					ret = !isNaN(parseFloat(j)) ? included[j] : included;
				k = !isNaN(parseFloat(j)) ? j : k; //store current
				return ret;
			},
			comp_find = function (m, e) {
				return _[m](included, function (member) {
					return member.find && member.find(e);
				});
			},
			doAdd = function (comp) {
				try {
					comp_add.call(composite, comp);
				} catch (er) {
					try {
						comp_add(_.extend(leaf, comp));
					} catch (error) {
						noOp();
					}
				}
				return comp;
			},
			render = function () {
				var args = _.toArray(arguments);
				_.each(included, function (member) {
					if (member.render) {
						member.render.apply(member, args.concat(_.rest(arguments)));
					}
				});
			},
			unrender = function () {
				var args = _.toArray(arguments);
				_.each(included, function (member) {
					if (member.unrender) {
						member.unrender.apply(member, args.concat(_.rest(arguments)));
					}
				});
			};
		intafaces.unshift(comp_intaface);
		if (included && _.isArray(included)) {
			composite = {
				add: doAdd,
				addAll: function () {
					_.each(_.toArray(arguments), doAdd);
				},
				remove: comp_remove,
				get: comp_get,
				find: comp_find,
				included: included,
				render: render,
				unrender: unrender,
				current: function () {
					return included[j] || included;
				}
			};
			if (included.length) {
				//copy and empty included; establish contents conform to interface
				tmp = included.slice();
				included = [];
				_.each(tmp, function (comp) {
					doAdd(comp);
				});
			}
		}
		return composite || leaf;
	}; //ret func
}());
gAlp.Looper = function () {
	"use strict";

	function equals(a, b) {
		return a === b;
	}

	function modulo(n, i) {
		return i % n;
	}

	function increment(i) {
		return i + 1;
	}

	function doInc(n) {
		return _.compose(_.partial(modulo, n), increment);
	}

	function makeProxyIterator(src, tgt, methods) {
		function mapper(method) {
			if (src[method] && _.isFunction(src[method])) {
				tgt[method] = function () {
					return this.$subject[method].apply(this.$subject, arguments);
				};
			}
		}
		tgt.setSubject(src);
		_.each(methods, mapper);
		return tgt;
	}
	gAlp.LoopIterator = function (group, advancer) {
		this.group = group;
		this.position = 0;
		this.rev = false;
		this.advance = advancer;
	};
	gAlp.Group = function () {
		this.members = [];
	};
	gAlp.Group.prototype = {
		constructor: gAlp.Group,
		add: function (value) {
			if (!this.has(value)) {
				this.members.push(value);
			}
		},
		remove: function (value) {
			this.members = _.filter(this.members, _.negate(_.partial(equals, value)));
		},
		has: function (value) {
			return _.contains(this.members, value);
		},
		visit: function (cb) {
			_.each(this.members, cb, this);
		}
	};
	gAlp.Group.from = function (collection) {
		var group = new gAlp.Group(),
			i,
			L = collection.length;
		for (i = 0; i < L; i += 1) {
			group.add(collection[i]);
		}
		return group;
	};
	gAlp.LoopIterator.from = function (coll, advancer) {
		return new gAlp.LoopIterator(gAlp.Group.from(coll), advancer);
	};
	gAlp.LoopIterator.onpage = null;
	gAlp.LoopIterator.cross_page = null;
	gAlp.LoopIterator.prototype = {
		constructor: gAlp.LoopIterator,
        /*if not in reverse mode, reverse or undo reverse BEFORE forwarding*/
		back: function (flag) {
			if (!this.rev || (flag && _.isBoolean(flag))) {
				this.group.members = this.group.members.reverse();
				this.position = this.group.members.length - 2 - (this.position);
				this.position = this.advance(this.position);
				this.rev = !this.rev;
			}
			return this.forward(this.rev);
		},
		find: function (tgt) {
			return this.set(_.findIndex(this.group.members, _.partial(equals, tgt)));
		},
		forward: function (flag) {
			/*PLAY button sends flag and respects current mode we dont't really want a play method in this interface*/
			if (!flag && this.rev) {
				return this.back(true);
			}
			this.position = this.advance(this.position);
            console.log(this.position);
			return this.status();
		},
		get: function (m) {
           // console.log('get: ', m)
			m = m || 'value';
			return this.status()[m];
		},
		set: function (pos) {
            //console.log('set: ', pos)
			if (!isNaN(parseFloat(pos)) && pos >= 0) {
				this.position = pos;
			}
			return {
				value: this.group.members[this.position],
				index: this.position
			};
		},
		status: function () {
			return {
				members: this.group.members,
				value: this.group.members[this.position],
				index: this.position
			};
		},
		visit: function (cb) {
			this.group.visit(cb);
		}
	};
	var target = {
			setSubject: function (s) {
				this.$subject = s;
			},
			getSubject: function () {
				return this.$subject;
			},
			build: function (coll, advancer) {
				//console.log(coll);
				this.setSubject(gAlp.LoopIterator.from(coll, advancer(coll)));
			}
		},
		twice = gAlp.Util.curryFactory(2),
		doGet = twice(gAlp.Util.getter),
		getLength = doGet('length'),
		incrementer = _.compose(doInc, getLength);
	return makeProxyIterator(gAlp.LoopIterator.from([], incrementer), target, ['back', 'status', 'find', 'forward', 'get', 'play', 'set', 'visit']);
};