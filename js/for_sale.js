/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global Modernizr: false */
/*global gAlp: false */
/*global _: false */
if (!window.gAlp) {
	window.gAlp = {};
}
(function (query, mq, touchevents, article, report, displayclass, linkEx, navExes, limits) {
	"use strict";

	function noOp() {}

	function getResult(arg) {
		return _.isFunction(arg) ? arg() : arg;
	}

	function gtThan(a, b) {
		return getResult(a) > getResult(b);
	}

	function lsThanEq(a, b) {
		return a <= b;
	}

	function callWith(m, ctxt) {
		return m.call(ctxt);
	}

	function onValidation() {
		var validators = _.toArray(arguments),
			result = 0;
		return function (fun, arg) {
			_.each(validators, function (validator) {
				if (!result) {
					//if passes set to zero
					result = Number(!validator(arg)) ? result += 1 : result;
				}
			});
			if (!result) {
				return fun(arg);
			}
			return arg;
		};
	}

	function checkDummy() {
		var val = gAlp.Util.getComputedStyle(document.getElementById("checkDummy"), "margin-top");
		return val === "1px";
		//return true;
	}

	function stringOp(reg, o, m) {
		return o[m](reg);
	}

	function simpleInvoke(o, m, arg) {
		//gAlp.Util.report(o[m]);
		if (arguments.length >= 3) { //allow for superfluous arguments 
			return o[m](arg);
		}
	}

	function caller(ctxt, ptl, arg, m) {
		return ptl(ctxt)[m](arg);
	}

	function inRange(i) {
		//https://wsvincent.com/javascript-tilde/
		//var res = ~"hello world".indexOf("w") ? true : false;
		return i >= 0;
	}

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
	var alpacas = [
			[
				["Granary Grace", "Price on Application"],
				["D.O.B.", "24.07.2005"],
				["Type", "Huacaya"],
				["Sex", "Female"],
				["Colour", "Fancy but mainly white"],
				["Sire", "Highlander Lad"],
				["Other Information"],
				["Grace is an assertive friendly animal, a herd leader. She is an excellent caring mother who has produced three excellent crias (one boy and two girls). She is currently empty but if required she could be covered by our own stud male Granary Carlos who has sired her two female crias. She carries the genetics of Both Highlander and Don Pedro. Price on application."],
				["alt", "Grace"],
				["src", "../images/sale/grace.jpg"]
			],
			[
				["Granary Maria", "Price on Application"],
				["D.O.B.", "12.08.2008"],
				["Type", "Huacaya"],
				["Sex", "Female (Maiden)"],
				["Colour", "Solid White"],
				["Sire", "Granary Carlos"],
				["Other Information"],
				["Unlike her mother (Grace) Maria is a gentle, curious hucaya who likes to be around humans. She is a well fleeced animal who carries the genetics of Highlander and Don Pedro. She is a maiden. Price on application."],
				["alt", "Maria"],
				["src", "../images/sale/Maria1.jpg"]
			],
			[
				["Granary Pilar", "Price on Application"],
				["D.O.B.", "26.08.2009"],
				["Type", "Huacaya"],
				["Sex", "Female"],
				["Colour", "Fancy but mainly white"],
				["Sire", "Granary Carlos"],
				["Other Information"],
				["Pilar is a strikingly marked animal, which goes well with her lively personality. She is well fleeced and good conformation. She is lively, loveable and a perfect pet a favourite with all who meet the herd. She is a maiden who carries the genes of Highlander and Don Pedro. Price on application."],
				["alt", "Pilar"],
				["src", "../images/sale/Pilar1.jpg"]
			],
			[
				["Granary Juanita", "Price on Application"],
				["D.O.B.", "29.072006"],
				["Type", "Huacaya"],
				["Sex", "Female"],
				["Colour", "Solid Dark Brown"],
				["Sire", "Somerset Peruvian Highlander Lad"],
				["Other Information"],
				["Juanita is a lovely natured&nbsp; huacaya who has just produced her first cria, a solid white female, born 13th July 2009. She is for sale with cria at foot and boasts background genetics of Highlander and Don Pedro."],
				["alt", "Juanita"],
				["src", "../images/sale/juanita.jpg"]
			],
			[
				["Newland Becky", "Price on Application"],
				["D.O.B.", "21.07.2004"],
				["Type", "Huacaya"],
				["Sex", "Female"],
				["Colour", "Solid  White"],
				["Sire", "Somerset Peruvian Highlander of Milend"],
				["Other Information"],
				["Becky is a proven breeding female (2) currently pregnant by Granary Carlos."],
				["alt", "Becky"],
				["src", "../images/sale/becky.jpg"]
			],
			[
				["Granary Enrico", "Price on Application"],
				["D.O.B.", "20.06.2007"],
				["Type", "Huacaya"],
				["Sex", "Male"],
				["Colour", "Solid White"],
				["Sire", "Farrlacey Ivan"],
				["Other Information"],
				["Enrico is a fine sturdy boy with a great fleece 18.5micron in 2008. Excellent stud potential."],
				["alt", "Rico"],
				["src", "../images/sale/rico.jpg"]
			]
		],
		utils = gAlp.Util,
		sliceArray = function (list, end) {
			return list.slice(_.random(0, end || list.length));
			//return list.slice(0,0);
		},
		alpacas_select = sliceArray(alpacas),
		alp_len = alpacas_select.length,
		lookup = {
			4: 'four',
			5: 'five',
			6: 'six'
		},
		number_reg = new RegExp('[^\\d]+(\\d+)[^\\d]+'),
		threshold = Number(query.match(number_reg)[1]),
		isDesktop = _.partial(gtThan, window.viewportSize.getWidth, threshold),
		getEnvironment = (function () {
			if (mq) {
				return _.partial(Modernizr.mq, query);
			} else {
				return isDesktop;
			}
		}()),
		negate = function (cb) {
			if (!getEnvironment()) {
				getEnvironment = _.negate(getEnvironment);
				cb();
			}
		},
		throttler = function (callback) {
			negate(noOp);
			return utils.addHandler('resize', window, _.throttle(_.partial(negate, callback), 66));
		},
		$ = function (str) {
			return document.getElementById(str);
		},
		//con = _.bind(window.console.log, window.console),
		always = utils.always,
		reverse = utils.invoker('reverse', Array.prototype.reverse),
		validator = utils.validator,
		ptL = _.partial,
		idty = _.identity,
		doTwiceDefer = utils.curryTwice(true),
		doThrice = utils.curryThrice(),
		doQuart = utils.curryFourFold(),
		anCr = utils.append(),
		anMv = utils.move(),
		anCrIn = utils.insert(),
		setAttrs = utils.setAttributes,
		doDrillDown = utils.drillDown,
		byIndex = utils.byIndex,
		klasAdd = utils.addClass,
		klasRem = utils.removeClass,
		getDomTargetLink = utils.getDomChild(utils.getNodeByTag('a')),
		getDomTargetImage = utils.getDomChild(utils.getNodeByTag('img')),
		clicker = ptL(utils.addHandler, 'click'),
		allow = !touchevents ? 2 : 0,
		getTargetLink = doDrillDown(['childNodes', 1, 'firstChild']),
		eventBridge = function (action, e) {
			var getText = doDrillDown(['target', 'nodeName']),
				val = _.compose(doThrice(simpleInvoke)(/img/i)('match'), getText),
				isImg = utils.validator('Please click on an image', val);
			try {
				return utils.conditional(isImg)(action, e);
			} catch (er) {
				action();
			}
		},
		adaptHandlers = function (subject, adapter, allpairs, override) {
			adapter = adapter || {};
			adapter = utils.simpleAdapter(allpairs, adapter, subject);
			adapter[override] = function () {
				subject.deleteListeners(subject);
			};
			return adapter;
		},
		handlerpair = ['addListener', 'deleteListeners'],
		renderpair = ['render', 'unrender'],
		tooltip_pairs = [
			['render', 'unrender'],
			['init', 'cancel']
		],
		tooltip_adapter = ptL(utils.simpleAdapter, tooltip_pairs, gAlp.Composite()),
		makeToolTip = ptL(gAlp.Tooltip, article, ["click table/picture", "to toggle the display"], allow),
		makeElement = utils.machElement,
		makeComp = function (obj, inc) {
			obj = obj || {
				render: noOp,
				unrender: noOp,
				getElement: noOp
			};
			return _.extend(gAlp.Composite(inc), obj);
		},
		adapterFactory = function () {
			//fresh instance of curried function per adapter
			return doQuart(adaptHandlers)('unrender')([renderpair, handlerpair.slice(0)])(gAlp.Composite());
		},
		checkDataLength = validator('no alpacas for sale', always(alp_len)),
		checkJSenabled = validator('javascript is not enabled', checkDummy),
		maybeLoad = utils.silent_conditional(checkDataLength, checkJSenabled),
		$sell = utils.machElement(ptL(setAttrs, {
			id: 'sell'
		}), anCr(article), always('div')),
		renderTable = _.compose(anCr($sell.render().getElement()), always('table')),
		iterateTable = function (getId, getPath, doFreshRow, doSpan, doDescription, doOddRow) {
			return function (getAnchor, subject) {
				var table = getAnchor(), //<table></table
					//optional tbody reqd for IE
					render = anCr(table),
					tbody = _.compose(render, ptL(idty))('tbody'),
					c = utils.curry4(caller)('match')(/^other/i)(doDrillDown(['innerHTML'])),
					addspan,
					doRow = _.compose(anCr(tbody)),
					tableconfig = {
						cellspacing: 0
					},
					addTableAttrs = {},
					addImgAttrs = {},
					addLinkAttrs = {},
					tmp;
				_.each(subject.slice(0, -2), function (tr, j) {
					var row,
						type = !j ? 'th' : 'td',
						supportsNthChild = validator('hard coding class not required', always(!Modernizr.nthchild)),
						isOdd = validator('is not an odd numbered row', always(j % 2)),
						isFirstRow = ptL(validator, 'is NOT first row'),
						isTableHead = ptL(validator, 'is NOT table head'),
						dospan = ptL(_.compose(ptL(utils.isEqual, 1), doDrillDown(['length']))),
						doOdd = onValidation(supportsNthChild, isOdd),
						provisionalID,
						assignId = function (str) {
							addImgAttrs.alt = getId(str);
							addTableAttrs = ptL(setAttrs, tableconfig);
						},
						maybeClass = ptL(onValidation(validator('no match found', c), supportsNthChild), doDescription);
					_.each(tr, function (td, i, data) {
						//partially apply the RETURNED function from onValidation with (partially applied) function to invoke
						addspan = ptL(onValidation(validator('is NOT a single column row', ptL(dospan, data))), doSpan);
						row = row || doFreshRow(ptL(doRow, 'tr'), i);
						provisionalID = onValidation(isFirstRow(always(Number(!i))), isTableHead(ptL(utils.isEqual, type, 'th')));
						provisionalID(ptL(assignId, td));
						_.compose(maybeClass, addspan, utils.setText(td), anCr(row))(type);
						doOdd(_.compose(doOddRow, always(row)));
					});
				});
				render = anCr(table.parentNode);
				addLinkAttrs = _.extend(addLinkAttrs, {
					href: getPath(subject)
				});
				addLinkAttrs = ptL(setAttrs, addLinkAttrs);
				addImgAttrs = _.extend(addImgAttrs, {
					src: getPath(subject)
				});
				addImgAttrs = ptL(setAttrs, addImgAttrs);
				tmp = _.compose(addLinkAttrs, render, always('a'))();
				render = anCr(tmp);
				_.compose(addImgAttrs, render, always('img'))();
				addTableAttrs(table);
			};
		},
		doLoad = function (coll, cb) {
			var loadData = function (data, render, driver) {
					_.each(data, ptL(driver, render));
				},
				getId = _.compose(ptL(byIndex, 1), doThrice(simpleInvoke)(' ')('split')),
				doRow = onValidation(validator('is first row', ptL(utils.isEqual, 0))),
				doColspan = ptL(setAttrs, {
					colSpan: 2 //!!!!////camelCase!!!!
				}),
				getPath = function (array) {
					return array.slice(-1)[0][1];
				},
				configureTable = iterateTable(getId, getPath, doRow, doColspan, ptL(klasAdd, 'description'), ptL(klasAdd, 'odd'));
			loadData(coll, cb, configureTable);
			return true;
		};
	maybeLoad(ptL(doLoad, alpacas_select, renderTable));
	(function (extent) {
		if (!extent) {
			$sell.unrender();
			return;
		}
		var links = _.toArray($sell.getElement().getElementsByTagName('a')),
			my_head = gAlp.Composite([]),
			my_stage_one = gAlp.Composite([]),
			my_stage_two = gAlp.Composite([]),
			my_figure_comp = gAlp.Composite([]),
			my_list_comp = gAlp.Composite([]),
			my_list_elements = gAlp.Composite([]),
			prepNav = function (ancor, refnode) {
				return utils.machElement(ptL(setAttrs, {
					id: 'list'
				}), anCrIn(ancor, refnode), always('ul'));
			},
			prepNavKlas = function (klas) {
				var $el = makeComp(utils.machElement(ptL(klasAdd, klas), ptL($, 'list')));
				$el.unrender = ptL(klasRem, klas, ptL($, 'list'));
				return $el;
			},
			doIterate = function (coll, iteratee, comp) {
				return _.each(getResult(coll), _.compose(comp.add, iteratee));
			},
			makeBody = function () {
				var $el = makeComp(makeElement(ptL(klasAdd, 'sell'), always(utils.getBody())));
				$el.unrender = ptL(klasRem, 'sell', utils.getBody());
				return $el;
			},
			makeFigure = function (ancor, el) {
				var grabAlt = _.compose(doDrillDown(['alt']), getDomTargetImage),
					preptext = _.compose(utils.setText, grabAlt)(el),
					sibling = utils.getPrevious(el),
					find = function (e) {
						var myimg_alt = grabAlt(this.sub.getElement()),
							tgt_alt = doDrillDown(['target', 'alt'])(e);
						return myimg_alt === tgt_alt;
					};
				return {
					render: function () {
						var fig = _.compose(anCr(ancor), always('figure'))();
						this.sub = utils.machElement(ptL(idty, fig), preptext, anCr(fig), always('figcaption'), anMv(fig), ptL(idty, el)).render();
						return this;
					},
					unrender: function () {
						if (!this.sub) { //may not have been initialised when unrender called
							return;
						}
						var link = _.compose(getDomTargetLink)(this.sub.getElement());
						utils.insertAfter(link, sibling);
						this.sub.unrender();
					},
					find: find
				};
			},
			my_presenter = (function (head) {
				_.each(links, function (lnk) {
					var elements = gAlp.Composite([]),
						tbl = utils.getPrevious(lnk),
						$lnk = makeComp(makeElement(utils.show, always(lnk))),
						$tbl = makeComp(makeElement(utils.show, always(tbl)));
					$tbl.unrender = ptL(utils.hide, tbl);
					$lnk.unrender = ptL(utils.hide, lnk);
					elements.addAll($tbl, $lnk);
					head.add(elements);
				});
				head.remove = noOp; //default remove is recursive, but we want these elements to persist
				return head;
			}(gAlp.Composite([]))),
			$body = makeBody(),
			$nav = makeComp(prepNav($sell.getElement(), article)),
			doCurrent = function (bool, klas, leaf) {
				var addClass = ptL(utils.setFromArray, always(bool), 'add', [klas]),
					$el = makeComp(makeElement(addClass, always(leaf.getElement())));
				$el.unrender = ptL(klasRem, klas, leaf.getElement());
				return $el;
			},
			toggleTable = ptL(utils.toggleClass, ['tog'], $sell.getElement()),
			addListener2Comp = function (comp, cb, el) {
				return _.compose(comp.add, adapterFactory(), utils.addEvent(clicker, cb))(getResult(el));
			},
			getNavTypeFactory = function (coll, len, limits) {
				var pop = utils.invoker('pop', Array.prototype.pop),
					shift = utils.invoker('shift', Array.prototype.shift),
					//reverse = utils.invoker('reverse', Array.prototype.reverse),
					isMobile = validator('loop layout priority', _.negate(getEnvironment)),
					//isMobile = validator('loop layout priority', getEnvironment),
					//isMobile = validator('loop layout priority', negate),
					subHigher = validator('Data length exceeds a tab layout', doTwiceDefer(gtThan)(limits.hi)(len)),
					subLower = validator('Data length will not require a loop layout', doTwiceDefer(lsThanEq)(limits.lo)(len)),
					trials = [ptL(onValidation(subLower), pop, coll), ptL(onValidation(subHigher), shift, coll), ptL(onValidation(isMobile), reverse, coll)];
				_.each(trials, function (f) {
					return f();
				});
				return coll;
			},
			routes = getNavTypeFactory(['tab', 'loop'], alp_len, limits),
			layout = (function (myroutes) {
				var mapLinktoTitle = function (link) {
						var getHref = doThrice(simpleInvoke)(linkEx)('match');
						return _.compose(ptL(callWith, ''.capitalize), ptL(byIndex, 1), getHref, doDrillDown(['href']))(link);
					},
					alpacaTitles = _.map(links, mapLinktoTitle),
					prepTabTitles = doTwiceDefer(utils.map)(mapLinktoTitle)(links),
					prepLoopTitles = function () {
						return ['Alpacas For Sale', 'placeholder', 'Next Alpaca'];
					},
					getLI = function () {
						return _.compose(anCr, _.compose(anCr($nav.getElement()), always('li')))();
					},
					doTabs = function (doLI, str) {
						var getListEl = _.compose(always, utils.getDomParent(utils.getNodeByTag('li')));
						//needs to return an appended element, so renders on the fly
						return _.compose(makeComp, utils.machElement, getListEl, utils.setText(str.capitalize()), doLI())('a');
					},
					doTabNav = _.compose(ptL(doTabs, getLI)),
					prepTabNav = function () {
						return function (e) {
							var el = doDrillDown(['target', 'innerHTML'])(e),
								i = _.findIndex(alpacaTitles, ptL(utils.isEqual, el)),
								comp = my_stage_two.get(0);
							if (inRange(i)) {
								comp.unrender();
								comp.get(0).get(i).render();
								comp.get(1).get(i).render();
							}
						};
					},
					prepLoopNav = function (i) {
						function setText() {
							var comp = my_stage_two.get(0);
							if (inRange(i)) {
								i = (i += 1) % alpacaTitles.length;
								comp.unrender();
								comp.get(0).get(i).render();
								//too DOM dependent??
								_.compose(utils.setText(alpacaTitles[i]), getTargetLink)($('list'));
							}
						}
						var reset = function () {
								var comp = my_head.get(2); //stage_two
								comp.unrender();
								comp.remove();
								my_head.get(1).render();
							},
							events = [setText, reset, noOp, noOp];
						return function (e) {
							var composed = _.compose(doThrice(stringOp)('match'), doDrillDown(['target', 'innerHTML']))(e),
								best = ptL(utils.getBest, function (arr) {
									return composed(arr[0]);
								}, _.zip(navExes, events));
							_.compose(utils.getDefaultAction, best)()();
						};
					},
					mystates = {
						loop: {
							getId: always('loop'),
							prepNav: prepLoopNav,
							buildList: ptL(doIterate, prepLoopTitles, doTabNav, my_list_comp),
							displayList: doThrice(doIterate)(my_list_elements)(ptL(doCurrent, false, 'current')),
							enter: function (i) {
								var setText = utils.setText(alpacaTitles[i]),
									$el = makeComp(utils.machElement(setText, getTargetLink, ptL($, 'list')));
								$el.unrender = function () {
									$el.getElement().innerHTML = 'placeholder';
								};
								return $el;
							},
							validator: eventBridge,
							renderList: function () {}
						},
						tab: {
							getId: always('tab'),
							prepNav: prepTabNav,
							buildList: ptL(doIterate, prepTabTitles, doTabNav, my_list_comp),
							displayList: doThrice(doIterate)(my_list_elements)(ptL(doCurrent, true, 'current')),
							enter: doTwiceDefer(makeComp)(null)(null),
							validator: eventBridge,
							renderList: function (i) {
								my_list_elements.unrender();
								my_list_elements.get(i).render();
								/*
								var getSellStyle = _.compose(doThrice(setter)('-1px')('marginTop'), doDrillDown(['style']), doThriceDefer(simpleInvoke)(null)('getElement')($sell));
								*/
							}
						}
					},
					mystate = (function (states) {
						return {
							states: states,
							state: states[myroutes[0]],
							changestates: function () {
								myroutes.reverse();
								this.state = this.states[myroutes[0]];
								return this;
							}
						};
					}(mystates));
				return extendFrom(mystate.states.state, mystate, 'states', 'state');
			}(routes)),
			prepStageThree = function (i, bool) {
				var mylayout = bool ? layout.changestates().state : layout.state,
					my_nav = my_stage_two.get(4);
				mylayout.buildList(); //add to my_list_comp
				my_nav.add(prepNavKlas(mylayout.getId())); //mynav1 (remove)
				my_nav.add(mylayout.enter(i)); //mynav2
				addListener2Comp(my_nav, mylayout.prepNav(i), ptL($, 'list')); //mynav3 (remove)
				my_nav.render();
				//display current (tab)
				mylayout.displayList(ptL(my_list_comp.get)); //listElements
				mylayout.renderList(i);
			},
			prepStageTwo = function (i) {
				my_head.get(0).render();
				my_stage_one.unrender();
				var my_display_elements = gAlp.Composite([]),
					my_nav = gAlp.Composite([]);
				my_display_elements.addAll(my_presenter, my_list_elements);
				my_stage_two.add(my_display_elements); //0
				addListener2Comp(my_stage_two, toggleTable, $sell.getElement()); //1
				_.compose(my_stage_two.add, tooltip_adapter, makeToolTip)(); //2 
				my_stage_two.render();
				my_display_elements.unrender();
				my_presenter.get(i).render();
				my_stage_two.add($nav); //3
				my_stage_two.add(my_nav); //4
				my_nav.add(my_list_comp); //mynav0
				$nav.render();
				prepStageThree(i);
			},
			prepStageTwoBridge = function (i) {
				prepStageTwo(i < 0 ? 0 : i);
			},
			prepStageOne = function () {
				var res,
                    myExtent = function (head, el) {
						var $el = makeComp(makeElement(ptL(klasAdd, 'extent'), always(el)));
						$el.unrender = ptL(klasRem, 'extent', el);
						head.add($el);
					},
					goFigure = ptL(makeFigure, $sell.getElement()),
					doFigures = ptL(doIterate, links, goFigure, my_figure_comp),
					dofind;
				doFigures();
				my_figure_comp.find = ptL(my_figure_comp.find, 'findIndex');
				dofind = _.compose(prepStageTwoBridge, my_figure_comp.find);
				myExtent(my_figure_comp, $sell.getElement());
				my_stage_one.add(my_figure_comp); //0
				addListener2Comp(my_stage_one, ptL(layout.state.validator, dofind), $sell.getElement()); //2
				res = _.find(utils.getByTag('img', document), function (el) {
					//console.log(utils.getComputedStyle(el, 'color'))
					return utils.getComputedStyle(el, 'color') !== 'white';
				});
				utils.doWhen(res, ptL(klasAdd, lookup[alp_len], article));
				//report.innerHTML = res;
			},
			swap = function () {
				var i = _.findIndex(my_presenter.get(), ptL(utils.isEqual, my_presenter.get(null))),
					comp = my_head.get(2).get(4); //my_nav
				//scenario where we move from loop to tab BUT before we have an active UL, ie in "gallery" mode
				if (!comp) {
					layout.changestates();
					return;
				}
				_.each(comp.get(), function (subcomp, i) {
					if (i) {
						subcomp.unrender();
						comp.remove(subcomp);
					}
				});
				comp.get(0).unrender();
				comp.get(0).remove();
				my_list_elements.remove();
				prepStageThree(i, true);
			},
			prepStage = function () {
				utils.highLighter.perform();
				my_head.add($body); //0
				my_head.add(my_stage_one); //1
				my_head.add(my_stage_two); //2
				if (routes[1]) {
					throttler(swap);
				}
				if (layout.state.getId() === 'tab') {
					prepStageTwoBridge(0);
				} else {
					prepStageOne();
					my_head.render();
					//report.innerHTML = document.getElementsByTagName('figure')[0].firstChild.firstChild.src;
				}
			};
		prepStage();
	}(alp_len));
}('(min-width: 769px)', Modernizr.mq('only all'), Modernizr.touchevents, document.getElementsByTagName('article')[0], document.getElementsByTagName('h2')[0], 'show', /\/([a-z]+)\d?\.jpg$/i, [/^next/i, /sale$/i, new RegExp('^[^<]', 'i'), /^</], {
	lo: 3,
	hi: 4
}));