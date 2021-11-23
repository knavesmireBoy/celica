/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global Modernizr: false */
/*global gAlp: false */
/*global _: false */
(function (mq, query, touchevents, pausepath, imagepath, picnum, tooltip_msg) {
	"use strict";

	function getNativeOpacity(bool) {
		return {
			getKey: function () {
				return bool ? 'filter' : Modernizr.prefixedCSS('opacity');
			},
			getValue: function (val) {
				/* IE requires that val MUST be a string, took me FOUR days to find this solution*/
				return bool ? 'alpha(opacity=' + val * 100 + ')' : val.toString();
			}
		};
	}

	function greater(a, b) {
		return a > b;
	}

	function greaterBridge(o, p1, p2) {
		return greater(o[p1], o[p2]);
	}

	function getResult(arg) {
		return _.isFunction(arg) ? arg() : arg;
	}

	function equals(a, b) {
		return getResult(a) === getResult(b);
	}

	function add(a, b) {
		return a + b;
	}

	function modulo(n, i) {
		return i % n;
	}

	function increment(i) {
		return i + 1;
	}

	function applyArg(f, arg) {
		arg = _.isArray(arg) ? arg : [arg];
		return f.apply(null, arg);
	}

	function invokeBridge(arr) {
		return applyArg(arr[0], arr[1]);
	}

	function invokeArgs(f) {
		var args = _.rest(arguments);
		return f.apply(null, _.map(args, getResult));
	}

	function invoke(f) {
		return f.apply(null, _.rest(arguments));
	}

	function doMethod(o, v, p) {
		//console.log(arguments);
		return o[p] && o[p](v);
	}

	function lazyVal(v, o, p) {
		return doMethod(o, v, p);
	}

	function doCallbacks(cb, coll, p) {
		return _[p](getResult(coll), cb);
	}
	var utils = gAlp.Util,
		//con = utils.con,
		ptL = _.partial,
		doComp = _.compose,
		//creates an object that wraps an iterator, allows setting new instance of iterator ($looper.build) and forwards all requests
		$looper = gAlp.Looper(),
		curryFactory = utils.curryFactory,
		event_actions = ['preventDefault', 'stopPropagation', 'stopImmediatePropagation'],
		eventing = utils.eventer,
		once = utils.doOnce(),
		defer_once = curryFactory(1, true),
		twice = curryFactory(2),
		twicedefer = curryFactory(2, true),
		thrice = curryFactory(3),
		thricedefer = curryFactory(3, true),
		deferEach = thricedefer(doCallbacks)('each'),
		anCr = utils.append(),
		anCrIn = utils.insert(),
		klasAdd = utils.addClass,
		klasRem = utils.removeClass,
		cssopacity = getNativeOpacity(!window.addEventListener),
		$ = thrice(lazyVal)('getElementById')(document),
		$$ = thricedefer(lazyVal)('getElementById')(document),
		main = document.getElementsByTagName('main')[0],
		getThumbs = doComp(utils.getZero, ptL(utils.getByTag, 'ul', main)),
		getAllPics = doComp(ptL(utils.getByTag, 'img'), getThumbs),
		mytarget = !window.addEventListener ? 'srcElement' : 'target',
        myTouch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false,
		myClick = myTouch ? 'touchend' : 'click',
		getTarget = utils.drillDown([mytarget]),
		parser = thrice(doMethod)('match')(/images\/\w+\.jpe?g$/),
		doMap = utils.doMap,
		doGet = twice(utils.getter),
		doVal = doGet('value'),
		doParse = doComp(ptL(add, ''), doGet(0), parser),
        //sends null to recur.undo, as opposed to undefined
		doAlt = doComp(twice(applyArg)(null), utils.getZero, thrice(doMethod)('reverse')()),
		unsetPortrait = ptL(klasRem, 'portrait', getThumbs),
		setPortrait = ptL(klasAdd, 'portrait', getThumbs),
		undostatic = ptL(klasRem, 'static', $$('controls')),
		getLength = doGet('length'),
		text_from_target = doComp(doGet('id'), getTarget),
		node_from_target = utils.drillDown([mytarget, 'nodeName']),
		getSlideChild = doComp(utils.getChild, utils.getChild, $$('slide')),
		getBaseChild = doComp(utils.getChild, utils.getChild, $$('base')),
		getBaseSrc = doComp(utils.drillDown(['src']), getBaseChild),
		queryOrientation = thrice(greaterBridge)('clientWidth')('clientHeight'),
		getLI = utils.getDomParent(utils.getNodeByTag('li')),
		getSRC = twice(utils.getter)('src'),
		getDomTargetImg = utils.getDomChild(utils.getNodeByTag('img')),
		$slide_swapper = utils.makeContext(),
		$setup = utils.makeContext(),
		$toggler = utils.makeContext(),
		$controlbar = utils.makeContext(),
		addElements = function () {
			return doComp(twice(applyArg)('img'), anCr, twice(applyArg)('a'), anCr, anCr(getThumbs))('li');
		},
		//height and width of image are compared BUT a) must invoke the comparison AFTER image loaded
		//b) must remove load listener or will intefere with slideshow
		onBase = function (img, path, promise) {
            var ev = eventing('load', event_actions.slice(0, 1), function (e) {
				promise.then(e[mytarget]);
				ev.undo();
			}, img).execute();
            img.src = path;
		},
		doInc = function (n) {
			return doComp(ptL(modulo, n), increment);
		},
		doMapLateVal = function (v, el, k) {
			return doMap(el, [
				[k, v]
			]);
		},
		doOrient = doComp(applyArg, ptL(utils.getBestPred, queryOrientation, [setPortrait, unsetPortrait])),
		//slide and pause 
		onLoad = function (img, path, promise) {
			var ret;
			if (promise) {
				ret = promise.then(getLI(img));
			}
			img.src = path;
			return ret;
		},
		doMapBridge = function (el, v, k) {
			return doMap(el, [
				[k, v]
			]);
		},
		getPausePath = ptL(utils.getBest, doComp(ptL(utils.hasClass, 'portrait'), getThumbs), [pausepath + 'pause_long.png', pausepath + 'pause.png']),
		doMakeBase = function (source, target) {
			var img = addElements();
			doMap(img.parentNode, [
				['href', doParse(source)]
			]);
			doMap(img.parentNode.parentNode, [
				['id', target]
			]);
			return onBase(img, doParse(img.parentNode.href), new utils.FauxPromise(_.rest(arguments, 2)));
		},
		doMakeSlide = function (source, target) {
			var img = addElements();
			doMap(img.parentNode, [
				['href', doParse(getBaseSrc())]
			]);
			doMap(img.parentNode.parentNode, [
				['id', target]
			]);
			return onLoad(img, doParse(img.parentNode.href), new utils.FauxPromise(_.rest(arguments, 2)));
		},
        doMakePause = function (path) {
			if (path) {
                var img = addElements(),
                    styles = [[cssopacity.getKey(), cssopacity.getValue(0.5)]];
                doMap(img.parentNode.parentNode, [['id', 'paused'], styles]);
                return onLoad(img, path);
            }
			//ensure only gets called when in in_play mode
            return onLoad(getDomTargetImg($('paused')), getPausePath());
        },
		loadImage = function (getnexturl, id, promise) {
			var img = getDomTargetImg($(id)),
				next;
			if (img) {
				img.onload = function (e) {
					promise.then(e[mytarget]);
				};
				next = getnexturl();
				if (!next) {
					return;
				}
				img.src = doParse(next);
				img.parentNode.href = doParse(img.src);
			}
		},
		loadImageBridge = function () {
			var args = _.rest(arguments, 2);
			args = args.length ? args : [function () {}];
			loadImage.apply(null, _.first(arguments, 2).concat(new utils.FauxPromise(args)));
		},
		makeToolTip = doComp(thrice(doMethod)('init')(null), ptL(gAlp.Tooltip, getThumbs, tooltip_msg, touchevents ? 0 : 2)),
		getValue = doComp(doVal, ptL(doMethod, $looper)),
		showtime = doComp(ptL(klasRem, ['gallery'], getThumbs), ptL(klasAdd, ['showtime'], utils.getBody())),
		enter_inplay = ptL(klasAdd, 'inplay', $('wrap')),
		play_ing = doComp(ptL(utils.doWhen, once(2), ptL(makeToolTip, true)), ptL(klasAdd, 'playing', main)),
		unplayin = ptL(klasRem, 'playing', main),
		exit_inplay = ptL(klasRem, 'inplay', $('wrap')),
		exitswap = ptL(klasRem, 'swap', utils.getBody()),
		swapping = ptL(utils.findByClass, 'swap'),
		exitshowtime = doComp(ptL(klasAdd, 'gallery', getThumbs), exitswap, ptL(klasRem, 'showtime', utils.getBody()), exit_inplay, unplayin),
		in_play = thricedefer(doMethod)('findByClass')('inplay')(utils),
        nextcaller = twicedefer(getValue)('forward')(),
		prevcaller = twicedefer(getValue)('back')(),
		incrementer = doComp(doInc, getLength),
        do_page_iterator = function (coll) {
			if (coll && typeof coll.length !== 'undefined') {
                if(coll[0].src){
                    $looper.build(_.pluck(coll, 'src'), incrementer);
                }
                else {
                  $looper.build(coll, incrementer);  
                }
                
			}
		},
        setindex = function (arg) {
			do_page_iterator(getAllPics());
			return $looper.find(arg);
		},
		locator = function (forward, back) {
            var getLoc = function (e) {
				var box = e[mytarget].getBoundingClientRect(),
                    threshold = (box.right - box.left) / 2;
                //default to forward
				return e.clientX ? (e.clientX - box.left) > threshold : true;
            };
			return function (e) {
				return utils.getBest(function (agg) {
					return agg[0](e);
				}, [
					[getLoc, forward],
					[utils.always(true), back]
				]);
			};
		},
		$locate = eventing(myClick, event_actions.slice(0,1), function (e) {
			locator(twicedefer(loadImageBridge)('base')(nextcaller), twicedefer(loadImageBridge)('base')(prevcaller))(e)[1]();
			doOrient(e[mytarget]);
		}, getThumbs()),
		slide_player_factory = function () {
			return {
				/*remember because images are a mix of landscape and portrait we re-order collection for the slideshow
				so landscapes follow portraits or vice-versa (depending what is the leading pic), this requires undoing when reverting to manual navigation which is invoked by clicking forward/back button, a fresh slideplayer is created on entering slideshow */
				execute: do_page_iterator,
				undo: _.once(_.wrap(do_page_iterator, function (orig, coll) {
					/*gets called on exiting slideshow, doesn't need to run again (ie forward/back in manual slideshow) until fresh slide_player*/
					orig(coll);
					//fulfills the duty of clicking an image when entering showtime 
					$looper.find(getBaseSrc());
				}))
			};
		},
		do_static_factory = function () {
			return {
				/* the class of static should be removed from #control on entering slideshow but should run only once PER slideshow session a fresh instance is set up on exiting slideshow */
				execute: _.once(undostatic),
				undo: function () {}
			};
		},
		///slideshow..., must run to determine start index for EITHER collection
		get_play_iterator = function (flag) {
			var coll = _.map(_.filter(_.map(getAllPics(), getLI), function (li) {
					return !li.id;
				}), getDomTargetImg),
				m = 'undo';
			if (flag) {
				m = 'execute';
				$slide_swapper.set(slide_player_factory());
			}
            $slide_swapper[m](coll);
		},
		$recur = (function (player) {
			function test() {
				return _.map([getBaseChild(), getSlideChild()], function (img) {
					return img && img.width > img.height;
				});
			}

			function doSwap() {
				var coll = test(),
					bool = coll[0] === coll[1],
					body = utils.getClassList(utils.getBody()),
					m = bool ? 'remove' : 'add';
				body[m]('swap');
				return !bool;
			}

			function doRecur() {
				player.inc();
				$recur.t = window.requestAnimationFrame($recur.execute);
			}

			function doOpacity(flag) {
				var slide = $('slide'),
					val;
				if (slide) {
					val = flag ? 1 : $recur.i / 100;
					val = cssopacity.getValue(val);
					doMap(slide, [
						[
							[cssopacity.getKey(), val]
						]
					]);
				}
			}
			var playmaker = (function () {
				var setPlayer = function (arg) {
						player = playmaker(arg);
						$recur.execute();
					},
                    doPlay = doComp(doVal, _.bind($looper.forward, $looper, true)),
					doBase = ptL(invoke, loadImageBridge, doPlay, 'base', setPlayer, doSwap),
					doSlide = ptL(invoke, loadImageBridge, doComp(utils.drillDown(['src']), utils.getChild, utils.getChild, $$('base')), 'slide', doOrient),
					fadeOut = {
						validate: function () {
							return $recur.i <= -15.5;
						},
						inc: function () {
							$recur.i -= 1;
						},
						reset: function () {
							doSlide();
							setPlayer(swapping());
						}
					},
					fadeIn = {
						validate: function () {
							return $recur.i >= 134.5;
						},
						inc: function () {
							$recur.i += 1;
						},
						reset: function () {
							doBase();
						}
					},
					fade = {
						validate: function () {
							return $recur.i <= -1;
						},
						inc: function () {
							$recur.i -= 1;
						},
						reset: function () {
							$recur.i = 150;
							doSlide();
							doOpacity();
							doBase();
							$controlbar.execute();
						}
					},
					actions = [fadeIn, fadeOut];
				return function (flag) {
					return flag ? actions.reverse()[0] : fade;
				};
			}());
			player = playmaker();
			return {
				execute: function () {
					if (!$recur.t) {
                        /*returns true if undefined, false if null which it will be as a result of pausing
                        ensures we only get a fresh collection when initiating a slideshow*/
                        if (isNaN($recur.t)) {
                            //console.log('init')
                            get_play_iterator(true);
                        }
						$controlbar.set(do_static_factory());
					}
					if (player.validate()) {
						player.reset();
                        //console.log('reset')
					} else {
						doOpacity();
						doRecur();
					}
				},
				undo: function (flag) {
					doOpacity(flag);
					window.cancelAnimationFrame($recur.t);
					$controlbar.set(do_static_factory());
					$recur.t = flag; //either set to undefined(forward/back/exit) or null(pause)
                    if (!isNaN(flag)) {//is null
                        doMakePause(); //checks path to pause pic
                    }

				}
			};
		}({})),
		clear = _.bind($recur.undo, $recur),
		doplay = _.bind($recur.execute, $recur),
		go_execute = thrice(doMethod)('execute')(null),
		go_set = thrice(lazyVal)('set')($toggler),
		undo_toggler = thricedefer(doMethod)('undo')()($toggler),
		factory = function () {
			var remPause = doComp(utils.removeNodeOnComplete, $$('paused')),
				remSlide = doComp(utils.removeNodeOnComplete, $$('slide')),
				unlocate = thricedefer(doMethod)('undo')(null)($locate),
				defer = defer_once(doAlt),
				do_slide = defer([clear, doplay]),
				doPlaying = defer([unplayin, play_ing]),
				doDisplay = defer([function () {}, enter_inplay]),
				doResumeSlideshow = ptL(utils.doWhen, _.negate(swapping), do_slide),
				doResumePlaying = ptL(utils.doWhen, _.negate(swapping), doPlaying),
				invoke_player = deferEach([doResumeSlideshow, doResumePlaying, doDisplay])(getResult),
				do_invoke_player = doComp(ptL(eventing, 'click', event_actions.slice(0, 2), invoke_player), getThumbs),
				relocate = ptL(lazyVal, null, $locate, 'execute'),
				doReLocate = ptL(utils.doWhen, $$('base'), relocate),
				farewell = [unplayin, exit_inplay, exitswap, undo_toggler, doReLocate, doComp(doOrient, $$('base')), deferEach([remPause, remSlide])(getResult)],
				exit_slideshow = ptL(utils.doWhen, $$('slide'), doComp(get_play_iterator, defer_once(clear)())),
				next_driver = deferEach([exit_slideshow, twicedefer(loadImageBridge)('base')(nextcaller)].concat(farewell))(getResult),
				prev_driver = deferEach([exit_slideshow, twicedefer(loadImageBridge)('base')(prevcaller)].concat(farewell))(getResult),
				toggler = function () {
					//make BOTH slide and pause but only make pause visible on NOT playing
					if (!$('slide')) {
						doMakeSlide('base', 'slide', thricedefer(doMethod)('execute')(null)($toggler), go_set, do_invoke_player, unlocate);
						doMakePause(getPausePath());
					}
				},
				COR = function (predicate, action) {
					var test = _.negate(ptL(equals, 'playbutton'));
					return {
						setSuccessor: function (s) {
							this.successor = s;
						},
						handle: function () {
							if (predicate.apply(this, arguments)) {
								return action.apply(this, arguments);
							} else if (this.successor) {
								return this.successor.handle.apply(this.successor, arguments);
							}
						},
						validate: function (str) {
							if (in_play() && $recur.t && test(str)) {
								//return fresh instance on exiting slideshow IF in play mode, or maybe just anyway
								return factory();
							}
							return this;
						}
					};
				},
				mynext = COR(ptL(invokeArgs, equals, 'forwardbutton'), next_driver),
				myprev = COR(ptL(invokeArgs, equals, 'backbutton'), prev_driver),
				myplayer = COR(function () {
					toggler();
					return true;
				}, invoke_player);
			myplayer.validate = function () {
				return this;
			};
			mynext.setSuccessor(myprev);
			myprev.setSuccessor(myplayer);
			$recur.i = 47; //slide is clone of base initially, so fade can start quickly, ie countdown from lowish figure
			return mynext;
		}, //factory
        mock = {
            target: {
                nodeName: 'IMG',
                src: "http://81.131.244.169/Alpacas/gal/big/Sancho.jpg"
            }
        },
		setup_val = doComp(thrice(doMethod)('match')(/img/i), node_from_target),
		//setup_val = utils.always(mock),
		setup = function (e) {
			doComp(setindex, utils.drillDown([mytarget, 'src']))(e);
			doComp(ptL(klasAdd, 'static'), thrice(doMapBridge)('id')('controls'), anCr(main))('section');
			doMakeBase(e[mytarget].src, 'base', doOrient, getBaseChild, showtime);
			//doMakeBase("../gal/big/Sancho.jpg", 'base', doOrient, getBaseChild, showtime);
            
            var buttons = ['backbutton', 'playbutton', 'forwardbutton'],
				aButton = anCr($('controls')),
				close_cb = ptL(doComp(utils.getDomParent(utils.getNodeByTag('main')), thrice(doMapBridge)('href')('.'), thrice(doMapBridge)('id')('exit'), anCrIn(getThumbs, main)), 'a'),
				dombuttons = _.map(buttons, doComp(thrice(doMapLateVal)('id'), aButton, thrice(doMethod)('slice')(-6))),
				dostatic = ptL(klasAdd, 'static', $$('controls')),
				chain = factory(),
                
				$controls = eventing('click', event_actions.slice(0, 1), function (e) {
					var str = text_from_target(e),
						node = node_from_target(e);
					if (node.match(/button/i)) {
						//!!REPLACE the original chain reference, validate will return either the original or brand new instance
						chain = chain.validate(str);
						chain.handle(str);
					}
				}, $('controls')),
				$controls_undostat = eventing('mouseover', [], undostatic, utils.getByTag('footer', document)[0]),
				$controls_dostat = eventing('mouseover', [], dostatic, $('controls')),
                
				$exit = eventing('click', event_actions.slice(0, 1), function (e) {
                    var go_undo = thrice(doMethod)('undo')();

					if (e[mytarget].id === 'exit') {
						chain = chain.validate();
						exitshowtime();
						unsetPortrait();
						_.each([$recur, $locate, $toggler], go_undo);
						_.each([$('exit'), $('tooltip'), $('controls'), $('paused'), $('base'), $('slide')], utils.removeNodeOnComplete);
						$setup.execute();
					}
				}, close_cb);
			//listeners...
			_.each(_.zip(dombuttons, buttons), invokeBridge);
			_.each([$controls, $exit, $locate, $controls_undostat, $controls_dostat], go_execute);
			$setup.undo();
		};
	$setup.set(eventing('click', event_actions.slice(0, 2), ptL(utils.invokeWhen, setup_val, setup), main));
    $setup.execute();
    utils.highLighter.perform();
    /*
      (function () {
        var el = utils.findByTag(0)('header'),
            box = el.getBoundingClientRect(),
            w = box.width || box.right - box.left,
            home = 'url(assets/header_ipad.png)',
            other = 'url(assets/header_ipad.png)',
            swap = utils.$('welcome') ? home : other;
        if (w > 960) {
            utils.doMap(el, [[['background-image', swap]]]);
        }
    }());
    */

    //utils.report(getThumbs());
    //gAlp.Util.eventCache.triggerEvent(main, 'click');
    /*
    var tgt = utils.getDomChild(utils.getNodeByTag('img'))($('yag')),
    ie6 = utils.getComputedStyle(tgt, 'color') === 'red' ? true : false;
	*/
    //utils.report(utils.getComputedStyle(getThumbs(), 'width'));
}(Modernizr.mq('only all'), '(min-width: 668px)', Modernizr.touchevents, 'assets/', /images[a-z\/]+\d+\.jpe?g$/, new RegExp('[^\\d]+\\d(\\d+)[^\\d]+$'), ["move mouse in and out of footer...", "...to toggle the display of control buttons"]));