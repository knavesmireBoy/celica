/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global gAlp: false */
/*global _: false */
if (!window.gAlp) {
	window.gAlp = {};
}
(function () {
	"use strict";
	var ie6table = function (table) {
			function myF(t1) {
				var table = document.createElement('table'),
					tb = document.createElement('tbody'),
					r = document.createElement('tr'),
					d = document.createElement('td'),
					o = {
						anchor: d
					},
					node;
				r.appendChild(d);
				//prepare wrapper table
				if (t1) { //tbody..
					node = t1.firstChild;
					t1.insertBefore(r, node);
					o.table = t1.parentNode || t1;
				} else { //prepare nested table
					table.appendChild(tb);
					o.table = table;
					o.anchor = tb;
				}
				return o;
			}
			var pass = false,
				tb = table.getElementsByTagName('tbody')[0],
				nested = myF(),
				wrapper = myF(tb),
				rows = _.toArray(tb.childNodes),
				isEl = function (node) {
					return node && node.nodeType === 1;
				},
				doPass = function (node, i) {
					pass = !!i;
				};
			rows = _.filter(rows, isEl);
			wrapper.anchor.appendChild(nested.table);
			_.each(rows, function (row, i, coll) {
				_.each(_.filter(_.toArray(row.childNodes), isEl), doPass);
				if (pass) {
					nested.anchor.appendChild(coll[i]);
					//document.getElementsByTagName('h2')[0].innerHTML = coll[i].innerHTML;
				}
				pass = false;
			});
		}, //ie6
		node,
		ie,
		tables = _.toArray(document.getElementsByTagName('table'));
	if (tables) {
		try {
			node = gAlp.Util.getDomChild(gAlp.Util.getNodeByTag('img'))(tables[0].nextSibling);
			ie = gAlp.Util.getComputedStyle(node, 'color') !== 'white' ? true : false;
			if (ie) {
				_.each(tables, ie6table);
			}
		} catch (e) {
			document.getElementsByTagName('h2')[0].innerHTML = e.message;
		}
	}
}());