'use strict';

var inherits = require('util').inherits;
var jsdom = require('jsdom');
var Transform = require('stream').Transform;

module.exports = Insert;

function Insert(options) {
	if (! (this instanceof Insert)) {
		return new Insert(options);
	}
	if (! options) options = {};
	options.objectMode = true;
	Transform.call(this, options);
}

inherits(Insert, Transform);

Insert.prototype._transform = function transform(data, encoding, cb) {
	// var str = data.toString('UTF-8');
	// var addition = "<script src='site-assets/sw-loader.js'></script>";
	// var locRegEx = '\s*<\/body>';
	// var find = str.search(locRegEx);
	// console.log(find);
	// console.log(str.charAt(find));
	// var res = str.replace(locRegEx, (addition + '\n</body>'));
	// console.log(res);

	var htmlFile = data.toString('UTF-8');
	//console.log(htmlFile);
	var transObj = this;
	jsdom.env(
		htmlFile,
		['site-assets/sw-loader.js'],
		function (err, window) {
			console.log("err: ", err);
			console.log("window: ", window);
			transObj.htmlFile = window;
		}
	);

	this.push(htmlFile);
	cb();
}

