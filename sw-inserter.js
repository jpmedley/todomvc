'use strict';

var Transform = require('stream').Transform;
var inherits = require('util').inherits;

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
	//console.log('transform before : ' + JSON.stringify(data));
	//console.log('transform before : ' + data.toString('UTF-8'));
	// var str = data.toString('UTF-8');
	// console.log('transform before : ' + str);
	// var newBuff = new Buffer(str);
	// console.log('transform before : ' + JSON.stringify(str));

	// if (typeof data.originalValue === 'undefined') 
	// 	data.originalValue = data.value;
	// data.value++;
	var str = data.toString('UTF-8');
	var addition = "<script src='site-assets/sw-loader.js'></script>";
	var locRegEx = '\s*<\/body>';
	var find = str.search(locRegEx);
	console.log(find);
	console.log(str.charAt(find));
	var res = str.replace(locRegEx, (addition + '\n</body>'));
	console.log(res);
	//console.log('transform after  : ' + JSON.stringify(data));
	this.push(res);
	cb();
}

