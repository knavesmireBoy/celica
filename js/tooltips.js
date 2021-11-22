/*jslint browser: true*/
/*jslint nomen: true */
/*global window: false */
/*global gAlp: false */
/*global Modernizr: false */
/*global document: false */
/*global _: false */
/*global gAlp: false */
if (!window.gAlp) {
	window.gAlp = {};
}
window.gAlp.Tooltip = function (anchor, instr, count, remove) {
	"use strict";
	var $ = function (str) {
			return document.getElementById(str);
		},
		getResult = function (arg) {
			return _.isFunction(arg) ? arg() : arg;
		},
		utils = gAlp.Util,
		curryFactory = utils.curryFactory,
		twice = curryFactory(2),
		anCr = utils.append(),
		doElement = _.compose(anCr(getResult(anchor)), utils.always('div')),
		timeout = function (fn, delay, el) {
			return window.setTimeout(_.bind(fn, null, el), delay);
		},
		isPos = function (i) {
			return i > 0;
		},
		prep = function () {
			var gang = [],
				add = utils.addClass,
				a = _.partial(add, ['tip']),
				b = _.partial(utils.removeClass, ['tip']),
				c = _.partial(add, ['tb1']),
				d = _.partial(add, ['tb2']),
				git = function () {
					if (instr[1]) {
						//$('tooltip') may not exist if cancel has been called
						var parent = $('tooltip'),
							tgt = utils.getDomChild(utils.getNodeByTag('div'));
						if (parent) {
							utils.doMap(tgt(parent.firstChild), [
								['txt', instr[1]]
							]);
						}
					}
				},
				wrap = function (f, el) {
					git();
					return f(el);
				};
			gang.push(_.partial(timeout, a, 1000));
			gang.push(_.partial(timeout, b, 9000));
			gang.push(_.partial(timeout, _.wrap(c, wrap), 4000));
			gang.push(_.partial(timeout, d, 6500));
			return gang;
		},
		exit = function (delay) {
			var that = this;
			window.setTimeout(function () {
				that.cancel();
			}, delay);
		},
		init = function () {
			if (isPos(count -= 1)) {
				var doMap = twice(utils.doMap),
					tip = _.compose(_.partial(_.bind(timer.run, timer), prep()), doMap([
						['id', 'tooltip']
					]), doElement)(),
					doDiv = _.compose(anCr(tip), utils.always('div'));
				_.compose(doMap([
					['txt', instr[0]]
				]), doDiv)();
				_.compose(doMap([
					['id', 'triangle']
				]), doDiv)();
			}
			if (remove) {
				exit.call(this, 10000);
			}
			return this;
		},
		run = function (gang, el) {
			var invoke = function (partial) {
				return partial(el);
			};
			this.ids = _.map(gang, invoke, this);
			return el;
		},
		dummytimer = {
			init: function () {},
			run: function () {},
			ids: [],
			cancel: function () {}
		},
		timer = {
			init: init,
			run: function (gang, el) {
				if (utils.findByClass('tip')) {
					return el;
				}
				return run.bind(this, gang, el)();
			},
			ids: [],
			cancel: function () {
				_.each(this.ids, window.clearTimeout);
				this.ids = [];
				utils.removeNodeOnComplete($('tooltip'));
			}
		};
	return Modernizr.cssanimations ? timer : dummytimer;
};